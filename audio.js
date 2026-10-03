/* ===========================================================================
   audio.js — every sound is generated at runtime. No audio files ship.

   Three layers:
     1. Tones          — plinks, pops, chimes (Web Audio oscillators).
     2. Animal/object calls — synthesised meow, woof, moo, quack, bounce, boo…
     3. Spoken words   — the device's own voice engine.

   ON REALISM, HONESTLY: these are synthesised approximations, not recordings.
   A real "moo" is a licensed audio file we would have to own and prove we own,
   forever. These are built from oscillators, pitch glides, vibrato and
   filtered noise — recognisable and fun, not photoreal. Swapping in licensed
   CC0 recordings later is a change to `call()` alone.

   iOS specifics baked in:
     - AudioContext starts suspended; only a real user gesture resumes it.
     - speechSynthesis needs priming inside a gesture, with real text.
     - Session type is "playback" so the hardware mute switch cannot silence it.
     - Oscillators/buffer sources are one-shot: new node per sound, always.
   =========================================================================== */
window.Sound = (function () {
  "use strict";

  var ctx = null, master = null, comp = null, speechBus = null;
  var voices = 0, ready = false, speechReady = false;

  /* ---- baked voice ------------------------------------------------------
     Every word and phrase the app says is a pre-rendered clip. The device's
     own speech engine is the fallback, not the plan: on iOS it defaults to
     the flat compact voice, needs priming inside a gesture, drops utterances
     without saying so, and gives no control over the pause between "C" and
     "kuh". Baked clips have none of those problems and sound identical on
     every device.

     Clips are fetched and decoded in the background after the first tap. A
     word asked for before its clip is ready falls back to the speech engine
     for that one word, so nothing is ever silent while the set loads. */
  var CLIPS = null, buffers = {}, clipLoading = {}, clipPlaying = 0;

  /* When the current word will have finished. Two things need it: the guard
     that stops a word restarting while it is still sounding, and the pause
     before an animal's own noise. */
  var speakingUntil = 0;
  function busy() { return Date.now() < speakingUntil; }

  function clipUrl(name) {
    return (window.CONFIG.voiceDir || "voice/") + name + ".mp3" + (window.CONFIG.assetVersion || "");
  }

  function loadManifest() {
    if (CLIPS) return Promise.resolve(CLIPS);
    return fetch((window.CONFIG.voiceDir || "voice/") + "manifest.json" + (window.CONFIG.assetVersion || ""))
      .then(function (r) { return r.json(); })
      .then(function (j) { CLIPS = j; return j; })
      .catch(function () { CLIPS = {}; return CLIPS; });
  }

  function decode(name) {
    if (buffers[name]) return Promise.resolve(buffers[name]);
    if (clipLoading[name]) return clipLoading[name];
    clipLoading[name] = fetch(clipUrl(name))
      .then(function (r) { return r.arrayBuffer(); })
      .then(function (b) {
        return new Promise(function (res, rej) {
          /* the callback form, because older Safari has no promise form */
          var p = ctx.decodeAudioData(b, res, rej);
          if (p && p.then) p.then(res, rej);
        });
      })
      .then(function (buf) { buffers[name] = buf; return buf; })
      .catch(function () { return null; });
    return clipLoading[name];
  }

  /* Warm the whole set, gently, so taps early on are not silent. */
  function warm() {
    loadManifest().then(function (m) {
      var names = Object.keys(m).map(function (k) { return m[k]; });
      var i = 0;
      (function next() {
        if (i >= names.length || !ctx) return;
        decode(names[i++]).then(function () { setTimeout(next, 30); },
                               function () { setTimeout(next, 30); });
      })();
    });
  }

  function playClip(name) {
    var buf = buffers[name];
    if (!buf || !ctx || !speechBus) return false;
    try {
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(speechBus);
      src.start();
      current = src;
      lastStart = Date.now();
      speakingUntil = Date.now() + buf.duration * 1000;
      clipPlaying++;
      src.onended = function () { clipPlaying = Math.max(0, clipPlaying - 1);
                                  if (current === src) current = null; };
      setTimeout(function () { clipPlaying = Math.max(0, clipPlaying - 1); },
                 (buf.duration + 0.2) * 1000);
      return buf.duration;
    } catch (e) { return false; }
  }

  /* ---- Real recordings -------------------------------------------------
     sfx/manifest.json maps a noise ("Moo") to a file. When a recording is
     present it wins over the spoken noise; when the folder is absent the
     whole thing quietly stays null and the spoken noise is used. Keeping
     them in a separate folder means dropping new recordings in is a data
     change, never a code change. */
  var SFX = null, sfxBuf = {}, sfxLoading = {}, lastSfx = null;

  function sfxUrl(name) {
    return (window.CONFIG.sfxDir || "sfx/") + name + ".mp3" + (window.CONFIG.assetVersion || "");
  }

  function loadSfxManifest() {
    if (SFX) return Promise.resolve(SFX);
    return fetch((window.CONFIG.sfxDir || "sfx/") + "manifest.json" + (window.CONFIG.assetVersion || ""))
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (j) { SFX = j || {}; return SFX; })
      .catch(function () { SFX = {}; return SFX; });
  }

  function decodeSfx(name) {
    if (sfxBuf[name]) return Promise.resolve(sfxBuf[name]);
    if (sfxLoading[name]) return sfxLoading[name];
    sfxLoading[name] = fetch(sfxUrl(name))
      .then(function (r) { return r.arrayBuffer(); })
      .then(function (b) {
        return new Promise(function (res, rej) {
          var p = ctx.decodeAudioData(b, res, rej);
          if (p && p.then) p.then(res, rej);
        });
      })
      .then(function (buf) { sfxBuf[name] = buf; return buf; })
      .catch(function () { return null; });
    return sfxLoading[name];
  }

  function warmSfx() {
    loadSfxManifest().then(function (m) {
      var names = Object.keys(m).map(function (k) { return m[k]; });
      var i = 0;
      (function next() {
        if (i >= names.length || !ctx) return;
        decodeSfx(names[i++]).then(function () { setTimeout(next, 30); },
                                   function () { setTimeout(next, 30); });
      })();
    });
  }

  function playSfx(name) {
    var buf = sfxBuf[name];
    if (!buf || !ctx || !speechBus) return false;
    try {
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(speechBus);
      src.start();
      current = src;
      lastSfx = name;
      speakingUntil = Date.now() + buf.duration * 1000;
      src.onended = function () { if (current === src) current = null; };
      return buf.duration;
    } catch (e) { return false; }
  }

  function now(){ return ctx ? ctx.currentTime : 0; }

  function unlock() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try { ctx = new AC({ latencyHint:"interactive" }); }
      catch (e) { try { ctx = new AC(); } catch (e2) { return false; } }
      try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
      master = ctx.createGain();
      master.gain.value = window.CONFIG.masterVolume;
      comp = ctx.createDynamicsCompressor();
      master.connect(comp); comp.connect(ctx.destination);
      /* Spoken words get their own bus, louder than the effects bus: the
         word is the content and the moo is the decoration. */
      speechBus = ctx.createGain();
      speechBus.gain.value = 0.95;
      speechBus.connect(comp);
    }
    if (ctx.state === "suspended") { try { ctx.resume(); } catch(e){} }
    ready = true;
    /* Start fetching and decoding the baked clips in the background. */
    if (!CLIPS) warm();
    if (!SFX) warmSfx();

    /* PRIMING THE SPEECH ENGINE.
       This used to speak the word "ready" at volume 0. iOS accepts a silent
       utterance, discards it, and does NOT arm the engine - so every word
       tapped afterwards was dropped. The symptom was exact: nothing spoke
       until you pressed Sound check, because that was the first utterance the
       device actually had to produce out loud.

       So the greeting is audible, at normal volume, spoken synchronously
       inside the tap that opens the app. speechReady is set from onstart
       rather than optimistically, so a failure stays visible instead of being
       recorded as success. */
    if (!speechReady && window.speechSynthesis) {
      try {
        window.speechSynthesis.getVoices();
        var u = new SpeechSynthesisUtterance(window.CONFIG.greeting || "Lets play!");
        u.volume = 1;
        u.rate = window.CONFIG.speechRate;
        u.pitch = window.CONFIG.speechPitch;
        u.lang = "en-US";
        try { var gv = bestVoice(window.speechSynthesis); if (gv) u.voice = gv; } catch(e){}
        u.onstart = function(){ lastStart = Date.now(); speechReady = true; };
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }
    return true;
  }

  function canPlay(){ return ready && ctx && voices < window.CONFIG.maxVoices; }
  function claim(sec){ voices++; setTimeout(function(){ voices = Math.max(0,voices-1); }, sec*1000); }

  /* ---- primitives ------------------------------------------------------ */

  /* A pitched voice with an optional pitch path and vibrato. */
  function voice(o) {
    var t = now() + (o.delay || 0);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var filt = ctx.createBiquadFilter();

    osc.type = o.wave || "sawtooth";
    osc.frequency.setValueAtTime(o.f0, t);
    (o.path || []).forEach(function (p) {
      if (p.exp) osc.frequency.exponentialRampToValueAtTime(Math.max(p.f, 1), t + p.at);
      else osc.frequency.linearRampToValueAtTime(p.f, t + p.at);
    });

    filt.type = o.filter || "lowpass";
    filt.frequency.setValueAtTime(o.cutoff || 1800, t);
    if (o.cutoffTo) filt.frequency.linearRampToValueAtTime(o.cutoffTo, t + o.dur);
    filt.Q.value = o.q == null ? 4 : o.q;

    var peak = o.gain == null ? 0.5 : o.gain;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + (o.attack || 0.02));
    gain.gain.setValueAtTime(peak, t + o.dur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);

    osc.connect(filt); filt.connect(gain); gain.connect(master);

    if (o.vibrato) {
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = o.vibrato.rate;
      lg.gain.value = o.vibrato.depth;
      lfo.connect(lg); lg.connect(osc.frequency);
      lfo.start(t); lfo.stop(t + o.dur + 0.05);
    }
    if (o.tremolo) {
      var tl = ctx.createOscillator(), tg = ctx.createGain();
      tl.frequency.value = o.tremolo.rate;
      tg.gain.value = o.tremolo.depth;
      tl.connect(tg); tg.connect(gain.gain);
      tl.start(t); tl.stop(t + o.dur + 0.05);
    }
    osc.start(t); osc.stop(t + o.dur + 0.06);
  }

  /* Filtered noise — breath, thuds, hisses, wind. */
  function noise(o) {
    var t = now() + (o.delay || 0);
    var len = Math.max(1, Math.floor(ctx.sampleRate * o.dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random()*2-1) * (o.decay === false ? 1 : (1 - i/len));
    var src = ctx.createBufferSource(); src.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = o.filter || "bandpass";
    f.frequency.setValueAtTime(o.cutoff || 1200, t);
    if (o.cutoffTo) f.frequency.exponentialRampToValueAtTime(Math.max(o.cutoffTo,1), t + o.dur);
    f.Q.value = o.q == null ? 1.2 : o.q;
    var g = ctx.createGain();
    g.gain.setValueAtTime(o.gain == null ? 0.3 : o.gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t);
  }

  /* ---- named calls ------------------------------------------------------
     Each recipe is a small set of voices/noise layered in time. Tuned by ear
     for "recognisable to a toddler", not for zoological accuracy. */
  var CALLS = {
    /* rising-then-falling cry, nasal formant */
    meow: function () {
      voice({wave:"sawtooth", f0:520, dur:0.52, gain:0.34, attack:0.05, cutoff:1500, q:7,
             path:[{f:760,at:0.16,exp:true},{f:700,at:0.30,exp:true},{f:430,at:0.52,exp:true}],
             vibrato:{rate:16,depth:14}});
      voice({wave:"triangle", f0:260, dur:0.5, gain:0.12, cutoff:900, delay:0.01,
             path:[{f:380,at:0.16,exp:true},{f:215,at:0.5,exp:true}]});
    },
    /* sharp bark: click + fast falling growl */
    woof: function () {
      noise({dur:0.07, cutoff:1800, cutoffTo:400, gain:0.4, q:0.8});
      voice({wave:"sawtooth", f0:300, dur:0.22, gain:0.4, attack:0.006, cutoff:1100, q:3,
             path:[{f:170,at:0.09,exp:true},{f:110,at:0.22,exp:true}]});
    },
    /* long low vibrato */
    moo: function () {
      voice({wave:"sawtooth", f0:150, dur:0.95, gain:0.34, attack:0.11, cutoff:620, q:5,
             path:[{f:132,at:0.55,exp:true},{f:112,at:0.95,exp:true}],
             vibrato:{rate:6.5,depth:7}});
      voice({wave:"triangle", f0:75, dur:0.9, gain:0.16, cutoff:340, delay:0.03});
    },
    /* buzzy nasal, hard gate */
    quack: function () {
      voice({wave:"square", f0:330, dur:0.16, gain:0.3, attack:0.008, filter:"bandpass", cutoff:1300, q:6,
             path:[{f:250,at:0.16,exp:true}]});
      voice({wave:"square", f0:300, dur:0.15, gain:0.26, attack:0.008, delay:0.19,
             filter:"bandpass", cutoff:1150, q:6, path:[{f:215,at:0.15,exp:true}]});
    },
    /* two short croaks */
    ribbit: function () {
      voice({wave:"square", f0:220, dur:0.13, gain:0.26, attack:0.01, cutoff:820, q:9,
             path:[{f:150,at:0.13,exp:true}]});
      voice({wave:"square", f0:300, dur:0.2, gain:0.28, attack:0.01, delay:0.17, cutoff:900, q:9,
             path:[{f:170,at:0.2,exp:true}], vibrato:{rate:26,depth:22}});
    },
    /* sustained tremolo */
    buzz: function () {
      voice({wave:"sawtooth", f0:172, dur:0.85, gain:0.2, attack:0.05, cutoff:1500, q:2,
             tremolo:{rate:34,depth:0.14}, vibrato:{rate:5,depth:5}});
    },
    /* wobbly bleat */
    baa: function () {
      voice({wave:"sawtooth", f0:400, dur:0.62, gain:0.26, attack:0.05, cutoff:1400, q:6,
             path:[{f:360,at:0.62,exp:true}], vibrato:{rate:19,depth:26}});
    },
    /* grunts */
    oink: function () {
      [0, 0.17, 0.34].forEach(function (d, i) {
        noise({dur:0.1, delay:d, cutoff:900 - i*120, cutoffTo:260, gain:0.26, q:2.2});
        voice({wave:"sawtooth", f0:190 - i*18, dur:0.1, delay:d, gain:0.22, attack:0.01,
               cutoff:700, q:4, path:[{f:120,at:0.1,exp:true}]});
      });
    },
    /* rubbery bounce */
    bounce: function () {
      noise({dur:0.05, cutoff:2200, cutoffTo:600, gain:0.26, q:1});
      voice({wave:"sine", f0:420, dur:0.3, gain:0.4, attack:0.004, cutoff:1400,
             path:[{f:120,at:0.3,exp:true}]});
    },
    /* leather thud */
    thud: function () {
      noise({dur:0.09, cutoff:700, cutoffTo:180, gain:0.34, q:0.9});
      voice({wave:"sine", f0:180, dur:0.22, gain:0.34, attack:0.004,
             cutoff:600, path:[{f:70,at:0.22,exp:true}]});
    },
    /* airy swish */
    swish: function () {
      noise({dur:0.34, filter:"bandpass", cutoff:700, cutoffTo:3400, gain:0.2, q:1.1});
    },
    /* breathy rising boo */
    boo: function () {
      voice({wave:"sine", f0:180, dur:0.75, gain:0.3, attack:0.14, cutoff:700, q:3,
             path:[{f:260,at:0.38,exp:true},{f:200,at:0.75,exp:true}],
             vibrato:{rate:5,depth:12}});
      noise({dur:0.7, filter:"lowpass", cutoff:500, gain:0.1, q:0.7});
    },
    /* high chirp pair */
    squeak: function () {
      voice({wave:"sine", f0:1700, dur:0.08, gain:0.18, attack:0.004, cutoff:5200,
             path:[{f:2500,at:0.08,exp:true}]});
      voice({wave:"sine", f0:1900, dur:0.07, gain:0.16, attack:0.004, delay:0.1, cutoff:5200,
             path:[{f:2700,at:0.07,exp:true}]});
    },
    /* wind-up wobble */
    spooky: function () {
      voice({wave:"triangle", f0:300, dur:0.9, gain:0.22, attack:0.1, cutoff:1200, q:5,
             path:[{f:480,at:0.45,exp:true},{f:240,at:0.9,exp:true}],
             vibrato:{rate:7,depth:34}});
    },
    /* skittering */
    skitter: function () {
      for (var i = 0; i < 6; i++) {
        noise({dur:0.045, delay:i*0.055, filter:"bandpass",
               cutoff:2400 + Math.random()*1400, gain:0.13, q:5});
      }
    },
    /* soft sparkle */
    twinkle: function () {
      [1046.5, 1318.5, 1568].forEach(function (f, i) {
        voice({wave:"sine", f0:f, dur:0.42, gain:0.14, attack:0.01, delay:i*0.07, cutoff:6000});
      });
    },
    /* wrapper crinkle */
    crinkle: function () {
      for (var i = 0; i < 5; i++) {
        noise({dur:0.05, delay:i*0.04, filter:"highpass",
               cutoff:3000 + Math.random()*2000, gain:0.1, q:1});
      }
    },
    /* gentle pat, for body parts */
    /* ---- farm ---- */
    /* A horse: two falling whinny bursts over a breathy tail. */
    neigh: function () {
      voice({wave:"sawtooth", f0:620, dur:0.38, gain:0.3, attack:0.012, cutoff:1800, q:6,
             path:[{f:540,at:0.18},{f:430,at:0.38}], vibrato:{rate:26,depth:22}});
      voice({wave:"sawtooth", f0:500, dur:0.3, gain:0.2, attack:0.01, delay:0.3, cutoff:1500, q:5,
             path:[{f:360,at:0.3}], vibrato:{rate:22,depth:18}});
      noise({dur:0.26, gain:0.07, delay:0.55, cutoff:1100, q:1.2});
    },
    /* A hen: short clipped clucks, the last one higher. */
    cluck: function () {
      [0, 0.13, 0.27].forEach(function (d, i) {
        voice({wave:"square", f0:520 + i*40, dur:0.07, gain:0.22, attack:0.004, delay:d,
               filter:"bandpass", cutoff:1500, q:8, path:[{f:380 + i*30, at:0.07}]});
      });
      voice({wave:"square", f0:700, dur:0.14, gain:0.2, attack:0.006, delay:0.44,
             filter:"bandpass", cutoff:1900, q:7, path:[{f:900,at:0.14}]});
    },
    /* A tractor: a low chug, not a car horn. */
    engine: function () {
      voice({wave:"sawtooth", f0:52, dur:1.0, gain:0.26, attack:0.06, cutoff:420, q:3,
             path:[{f:66,at:0.25},{f:60,at:1.0}], vibrato:{rate:9,depth:5}});
      voice({wave:"square", f0:31, dur:1.0, gain:0.16, attack:0.06, cutoff:260, q:2,
             vibrato:{rate:9,depth:3}});
      noise({dur:0.95, gain:0.05, cutoff:700, q:1});
    },

    /* ---- jungle ---- */
    roar: function () {
      voice({wave:"sawtooth", f0:120, dur:0.85, gain:0.34, attack:0.07, cutoff:900, q:4,
             path:[{f:175,at:0.2},{f:110,at:0.85}], vibrato:{rate:14,depth:9}});
      voice({wave:"square", f0:60, dur:0.8, gain:0.18, attack:0.08, cutoff:420, q:3,
             path:[{f:88,at:0.2},{f:56,at:0.8}]});
      noise({dur:0.7, gain:0.09, cutoff:1300, q:1.1});
    },
    trumpet: function () {
      voice({wave:"sawtooth", f0:300, dur:0.7, gain:0.3, attack:0.05, cutoff:2200, q:8,
             path:[{f:700,at:0.16},{f:660,at:0.5},{f:420,at:0.7}], vibrato:{rate:7,depth:6}});
      voice({wave:"square", f0:150, dur:0.62, gain:0.12, attack:0.06, cutoff:1200, q:5,
             path:[{f:350,at:0.16},{f:210,at:0.62}]});
    },
    chirp: function () {
      [0, 0.16, 0.3].forEach(function (d, i) {
        voice({wave:"sine", f0:1300 + i*180, dur:0.1, gain:0.2, attack:0.005, delay:d,
               cutoff:5200, path:[{f:2000 + i*160, at:0.1}]});
      });
    },
    hiss: function () {
      noise({dur:0.7, gain:0.13, filter:"bandpass", cutoff:5200, q:1.6});
      noise({dur:0.3, gain:0.06, delay:0.4, filter:"bandpass", cutoff:6800, q:2});
    },

    /* ---- ocean ---- */
    splash: function () {
      noise({dur:0.42, gain:0.2, filter:"lowpass", cutoff:3200, q:1});
      noise({dur:0.55, gain:0.1, delay:0.07, filter:"bandpass", cutoff:1100, q:1.4});
      voice({wave:"sine", f0:700, dur:0.22, gain:0.1, attack:0.004, path:[{f:260,at:0.22}]});
    },
    whalesong: function () {
      voice({wave:"sine", f0:150, dur:1.25, gain:0.26, attack:0.22, cutoff:800,
             path:[{f:240,at:0.4},{f:190,at:0.9},{f:130,at:1.25}], vibrato:{rate:4.5,depth:6}});
      voice({wave:"sine", f0:105, dur:1.2, gain:0.13, attack:0.25, cutoff:400});
    },
    click: function () {
      [0,0.07,0.13,0.2,0.29].forEach(function (d) {
        voice({wave:"sine", f0:2000, dur:0.045, gain:0.16, attack:0.003, delay:d,
               cutoff:7000, path:[{f:3100,at:0.045}]});
      });
    },

    /* ---- things that go ---- */
    honk: function () {
      voice({wave:"square", f0:400, dur:0.3, gain:0.26, attack:0.012, cutoff:1600, q:4});
      voice({wave:"square", f0:505, dur:0.3, gain:0.2, attack:0.012, cutoff:1600, q:4});
    },
    siren: function () {
      voice({wave:"sine", f0:640, dur:1.1, gain:0.24, attack:0.05, cutoff:2600,
             path:[{f:980,at:0.28},{f:640,at:0.56},{f:980,at:0.84},{f:700,at:1.1}]});
    },
    choochoo: function () {
      voice({wave:"square", f0:300, dur:0.55, gain:0.24, attack:0.05, cutoff:1300, q:4,
             path:[{f:300,at:0.45},{f:240,at:0.55}]});
      voice({wave:"square", f0:380, dur:0.55, gain:0.16, attack:0.05, cutoff:1300, q:4});
      noise({dur:0.3, gain:0.07, delay:0.6, filter:"lowpass", cutoff:900, q:1});
    },
    whoosh: function () {
      noise({dur:1.0, gain:0.16, filter:"bandpass", cutoff:1700, q:0.9});
      voice({wave:"sawtooth", f0:150, dur:0.95, gain:0.12, attack:0.25, cutoff:900, q:3,
             path:[{f:220,at:0.4},{f:160,at:0.95}]});
    },
    ding: function () {
      voice({wave:"sine", f0:1760, dur:0.5, gain:0.2, attack:0.003, cutoff:7000});
      voice({wave:"sine", f0:2640, dur:0.36, gain:0.09, attack:0.003, cutoff:8000});
    },

    /* A bubble bursting: a tiny inrush of air, then a wet click. */
    pop: function () {
      noise({dur:0.055, gain:0.26, filter:"bandpass", cutoff:2600, q:1.1});
      voice({wave:"sine", f0:1500, dur:0.1, gain:0.18, attack:0.003,
             cutoff:6000, path:[{f:420, at:0.1, exp:true}]});
      voice({wave:"sine", f0:320, dur:0.14, gain:0.1, attack:0.004, delay:0.02,
             cutoff:2200, path:[{f:170, at:0.14, exp:true}]});
    },

    /* A golf ball off a putter: a hard little click with a short ring. */
    putt: function () {
      noise({dur:0.03, gain:0.22, filter:"bandpass", cutoff:3800, q:2});
      voice({wave:"sine", f0:1180, dur:0.16, gain:0.16, attack:0.002, cutoff:6000,
             path:[{f:820, at:0.16, exp:true}]});
    },

    pat: function () {
      noise({dur:0.09, filter:"lowpass", cutoff:1100, cutoffTo:300, gain:0.22, q:1});
      voice({wave:"sine", f0:240, dur:0.16, gain:0.2, attack:0.005,
             cutoff:900, path:[{f:150,at:0.16,exp:true}]});
    }
  };

  function call(name) {
    if (!canPlay() || !CALLS[name]) return false;
    claim(1.1);
    try { CALLS[name](); return true; } catch (e) { return false; }
  }

  /* ---- simple tones ---------------------------------------------------- */
  function note(freq, velocity) {
    if (!canPlay()) return;
    var v = velocity == null ? 1 : velocity, t = now(), dur = 1.15;
    claim(dur);
    var osc = ctx.createOscillator(), gain = ctx.createGain(), filt = ctx.createBiquadFilter();
    osc.type = "triangle"; osc.frequency.setValueAtTime(freq, t);
    filt.type = "lowpass"; filt.frequency.setValueAtTime(Math.min(freq*6,8000), t); filt.Q.value = 0.7;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.55*v, t+0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    osc.connect(filt); filt.connect(gain); gain.connect(master);
    osc.start(t); osc.stop(t+dur+0.05);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = "sine"; o2.frequency.setValueAtTime(freq*2, t);
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(0.16*v, t+0.01);
    g2.gain.exponentialRampToValueAtTime(0.0001, t+dur*0.55);
    o2.connect(g2); g2.connect(master);
    o2.start(t); o2.stop(t+dur);
  }

  function pop() {
    if (!canPlay()) return;
    claim(0.16);
    noise({dur:0.16, filter:"bandpass", cutoff:1400+Math.random()*900, q:1.4, gain:0.3});
  }

  function tick(freq) {
    if (!canPlay()) return;
    var t = now(), dur = 0.22; claim(dur);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.13, t+0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t+dur+0.02);
  }

  function chime(){ note(523.25,0.7); setTimeout(function(){ note(783.99,0.6); },130); }

  /* ---- speech ---------------------------------------------------------- */
  /* Is the device actually producing speech right now? Used to detect an
     utterance that iOS silently dropped, so it can be retried from a context
     that definitely carries a user activation. */
  /* Say a word, pause, then make the thing's own noise.

     The noise is now spoken too - "Quack quack", "Moo" - because the
     synthesised barnyard was the weak part: it came out as a beep. The synth
     call is still played underneath when one is configured, so a tractor
     still rumbles, but the recognisable part is the word.

     TAPPING FASTER THAN THE APP CAN TALK.

     The first rule here was "a different object interrupts immediately",
     which is right for an adult pointing at things and wrong for a toddler
     with both hands on the glass: every word got chopped off a syllable in
     and she never heard a whole one.

     A flat lockout is the obvious fix and it is also wrong, because some of
     these noises are long - the shark cue runs about five seconds - and
     holding every tap for that long makes the picture feel dead.

     So the guard covers the part that matters. The NAME is protected: once
     it starts, nothing can cut it off, and a short gap of quiet follows it so
     two words never run together. The NOISE after it is not protected: a new
     tap stops it and starts the next word. She always hears a whole word, and
     she never waits more than about a second to hear the next one.

     Tapping the same thing twice still does nothing until it has finished,
     so a double-tap cannot stutter.

     Every mode draws its own tap feedback regardless of what this returns, so
     a held tap still pops the bubble, flashes the sticker and shows the word.
     Only the audio waits. */
  var lastKey = null, current = null, chain = null;
  var protectedUntil = 0;

  function gapMs() {
    var g = window.CONFIG && window.CONFIG.tapGapMs;
    return (typeof g === "number") ? g : 180;
  }
  function waiting() { return Date.now() < protectedUntil; }
  function hold(ms) { protectedUntil = Date.now() + ms; }

  function stopCurrent() {
    if (chain) { clearTimeout(chain); chain = null; }
    if (current) { try { current.stop(); } catch (e) {} current = null; }
    clipPlaying = 0;
    speakingUntil = 0;
    protectedUntil = 0;
  }

  /* Leaving a mode should not leave a cow mooing into the menu. */
  function hush() { stopCurrent(); lastKey = null; }

  function sayThen(text, soundText, callName, sfxName, gap) {
    var key = text + "|" + (soundText || "") + "|" + (callName || "");
    var legacy = window.CONFIG && window.CONFIG.tapPolicy === "interrupt";
    if (busy()) {
      if (key === lastKey) return false;       /* same thing - let it finish */
      if (!legacy && waiting()) return false;  /* its name is still playing  */
      stopCurrent();                            /* only the noise was left   */
    }
    lastKey = key;

    var dur = 0;
    if (CLIPS && CLIPS[text]) dur = playClip(CLIPS[text]) || 0;
    else { say(text); dur = 0.8; }

    var wait = (dur * 1000) + (gap == null ? 300 : gap);
    /* The name, the pause after it, and a breath of quiet: that is the part
       no tap may interrupt. */
    hold(wait + gapMs());
    if (soundText || callName || sfxName) {
      speakingUntil = Date.now() + wait + 150;  /* the chain resets this exactly */
      chain = setTimeout(function () {
        chain = null;
        /* Priority: a real recording, then the spoken noise, and only if
           neither exists the synthesised call. Playing the call ON TOP of a
           clip is what made every animal end in a beep. */
        var d = 0;
        if (sfxName && SFX && SFX[sfxName]) d = playSfx(SFX[sfxName]) || 0;
        else if (soundText && CLIPS && CLIPS[soundText]) d = playClip(CLIPS[soundText]) || 0;
        else if (callName) { call(callName); d = 0.5; }
        speakingUntil = Date.now() + (d ? d * 1000 : 500);
      }, wait);
    }
    return true;
  }

  function speaking() {
    if (busy()) return true;
    if (clipPlaying > 0) return true;
    try { var s = window.speechSynthesis;
          return !!(s && (s.speaking || s.pending)); } catch (e) { return false; }
  }

  /* When did an utterance last actually BEGIN? `speaking` alone is not enough:
     the engine takes a moment to start, so a caller checking immediately can
     see false on a device that is about to speak perfectly well, and say the
     word twice. onstart is the only signal that the utterance was really
     accepted rather than silently dropped. */
  var lastStart = 0;
  function spokeSince(t) {
    if (speaking()) return true;
    return lastStart >= t;
  }

  /* VOICE CHOICE.
     The old rule was "first English voice with localService === true". On iOS
     that reliably picks the small compact voice - the flat, clipped, robotic
     one. The good voices (Samantha and the premium ones) are also local, but
     they are not first in the list, so they never got chosen.

     These are matched by name, most natural first, then any English voice as
     a fallback. Novelty voices (Fred, Albert, Zarvox and friends) are excluded
     outright - they are unusable for a toddler learning words. */
  var GOOD_VOICES = ["ava","samantha","allison","susan","zoe","nicky","joelle",
                     "karen","moira","tessa","serena","google us english"];
  var JOKE_VOICES = ["albert","bad news","bahh","bells","boing","bubbles","cellos",
                     "deranged","fred","good news","jester","junior","organ","ralph",
                     "superstar","trinoids","whisper","wobble","zarvox","grandma",
                     "grandpa","rocko","sandy","shelley","eddy","flo","reed","rishi"];
  var pickedVoice = null;
  function bestVoice(synth) {
    if (pickedVoice) return pickedVoice;
    var vs = synth.getVoices() || [];
    var en = vs.filter(function(v){ return v.lang && v.lang.toLowerCase().indexOf("en") === 0; });
    if (!en.length) return null;
    var usable = en.filter(function(v){
      var n = (v.name||"").toLowerCase();
      for (var j=0;j<JOKE_VOICES.length;j++) if (n.indexOf(JOKE_VOICES[j]) === 0) return false;
      return true;
    });
    if (!usable.length) usable = en;
    for (var i=0;i<GOOD_VOICES.length;i++) {
      for (var k=0;k<usable.length;k++) {
        if ((usable[k].name||"").toLowerCase().indexOf(GOOD_VOICES[i]) === 0) {
          pickedVoice = usable[k]; return pickedVoice;
        }
      }
    }
    pickedVoice = usable[0];
    return pickedVoice;
  }
  /* The list arrives asynchronously on some engines; drop the cache so the
     next word re-picks once the real voices are known. */
  if (window.speechSynthesis && window.speechSynthesis.addEventListener) {
    try { window.speechSynthesis.addEventListener("voiceschanged", function(){ pickedVoice = null; }); } catch(e){}
  }
  function voiceName(){ try { var v = bestVoice(window.speechSynthesis); return v ? v.name : "none"; } catch(e){ return "error"; } }

  /* Speak several fragments with a real gap between them.
     "C" and "kuh" run together as one noise when they are a single
     utterance - the engine gives them no more space than two words in a
     sentence, and a toddler hears "ckuh". These are queued as SEPARATE
     utterances instead: the engine pauses between them, and a short silent
     spacer widens that pause. Every speak() call is made synchronously
     inside the same handler, so no timer is involved and iOS's activation
     window is never left. */
  function sayAll(parts) {
    if (!window.speechSynthesis || !parts || !parts.length) return false;
    var ok = say(parts[0]);
    for (var i = 1; i < parts.length; i++) {
      queue(SPACER);
      queue(parts[i]);
    }
    return ok;
  }
  /* Commas are read as silence by every engine we care about; a bare space or
     an empty string is skipped outright, which is why this is not "". */
  var SPACER = ", ,";

  function queue(text) {
    try {
      var u = new SpeechSynthesisUtterance(text);
      u.rate = window.CONFIG.speechRate;
      u.pitch = window.CONFIG.speechPitch;
      u.volume = 1; u.lang = "en-US";
      try { var v = bestVoice(window.speechSynthesis); if (v) u.voice = v; } catch(e){}
      u.onstart = function(){ lastStart = Date.now(); };
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* Speak by key: the letter and counting phrases are baked as one clip each,
     with real silence inside them. Falls back to the queued-utterance path. */
  function sayKey(key, parts) {
    if (waiting()) return false;           /* let the current word finish */
    if (busy()) stopCurrent();             /* only a trailing noise was left */
    if (CLIPS && CLIPS[key]) {
      var d = playClip(CLIPS[key]);
      if (d) { lastKey = key; hold(d * 1000 + gapMs()); return true; }
    }
    return sayAll(parts);
  }

  /* Hammering a tile used to start the clip again on every press, so the
     word chopped itself into fragments. A word now plays to the end before
     another can start. The picture still reacts to every tap - only the
     audio is held. */
  function say(text) {
    if (waiting()) return false;
    if (busy()) stopCurrent();         /* only a trailing noise was left */
    if (CLIPS && CLIPS[text]) {
      var d = playClip(CLIPS[text]);
      if (d) { lastKey = text; hold(d * 1000 + gapMs()); return true; }
    }
    if (!window.speechSynthesis) return false;
    try {
      var synth = window.speechSynthesis;
      var needsCancel = synth.speaking || synth.pending;
      if (needsCancel) synth.cancel();   /* cancel()+speak() back-to-back is swallowed on iOS */
      var fire = function () {
        var u = new SpeechSynthesisUtterance(text);
        u.rate = window.CONFIG.speechRate;
        u.pitch = window.CONFIG.speechPitch;
        u.volume = 1; u.lang = "en-US";
        try { var v = bestVoice(synth); if (v) u.voice = v; } catch(e){}
        u.onstart = function(){ lastStart = Date.now(); };
        try { if (synth.paused) synth.resume(); } catch(e){}
        synth.speak(u);
      };
      if (needsCancel) setTimeout(fire, 90); else fire();
      return true;
    } catch (e) { return false; }
  }

  if (window.speechSynthesis && window.speechSynthesis.addEventListener) {
    try { window.speechSynthesis.addEventListener("voiceschanged", function(){
      try { window.speechSynthesis.getVoices(); } catch(e){}
    }); } catch(e){}
  }

  function status() {
    return {
      audioContext: ctx ? ctx.state : "none",
      ready: ready,
      speechSupported: !!window.speechSynthesis,
      speechPrimed: speechReady,
      bakedClips: CLIPS ? Object.keys(CLIPS).length : 0,
      sfxClips: SFX ? Object.keys(SFX).length : 0,
      lastSfx: lastSfx,
      clipsReady: Object.keys(buffers).length,
      voices: (window.speechSynthesis && window.speechSynthesis.getVoices)
                ? (window.speechSynthesis.getVoices()||[]).length : 0,
      calls: Object.keys(CALLS).length,
      voice: voiceName(),
      sessionType: (function(){ try { return navigator.audioSession ? navigator.audioSession.type : "unsupported"; }
                                catch(e){ return "error"; } })()
    };
  }

  return { unlock:unlock, note:note, pop:pop, tick:tick, chime:chime, say:say,
           call:call, callNames:function(){ return Object.keys(CALLS); },
           sayAll:sayAll, sayKey:sayKey, sayThen:sayThen, busy:busy, speaking:speaking, spokeSince:spokeSince, voiceName:voiceName,
           hush:hush, waiting:waiting,
           status:status, isReady:function(){ return ready; } };
})();
