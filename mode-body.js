/* ===========================================================================
   mode-body.js — tap a part of the character, see AND hear the word.

   Two changes from the first version:
     1. The figure is drawn with real features — shaped eyes with lids and
        lashes, a modelled nose, lips, fingers, hair with volume — instead of
        flat circles.
     2. Tapping shows the word in large type AND speaks it. At this age the
        pairing is the point; the word alone disappears too fast.

   Hit areas come from config.js as percentages of the figure box, verified to
   have zero overlaps, and are rendered largest-first so the most precise
   target always wins a tap.
   =========================================================================== */
window.ModeBody = (function () {
  "use strict";
  var stage, wrap, labelEl, CFG, hotspots = [];

  /* Palette taken from the photo: fine light-blonde hair, blue-grey eyes,
     pale yellow top with lettuce-edge cuffs, sage leggings, white velcro
     sneakers. */
  var SKIN="#f7d5b5", SKIN_D="#e0b391", SKIN_S="#fde7d2";
  var HAIR="#d8bc8c", HAIR_D="#bda06e", HAIR_L="#ecd9b4";
  var TOP="#f7efc2", TOP_D="#e8dfa6", TOP_S="#fffbe0";
  var LEGS="#a9c5b2", LEGS_D="#8fae99";
  var IRIS="#7d9cb4", IRIS_D="#5a7a94";

  /* A wispy strand escaping the topknot. The photo is full of them and they
     are most of what makes the drawing read as *her*. */
  /* Baby hair is FINE. The first pass used 1.4-2.2 stroke widths and the
     strands read as spider legs. Sub-pixel widths with low opacity are what
     actually look like stray hair. */
  function wisp(x1,y1,cx,cy,x2,y2,w) {
    return '<path d="M'+x1+' '+y1+' Q'+cx+' '+cy+' '+x2+' '+y2+'" stroke="'+HAIR_L+
           '" stroke-width="'+w+'" fill="none" stroke-linecap="round" opacity=".7"/>';
  }

  function figureSVG() {
    return '<svg class="body-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<radialGradient id="cheekG" cx="50%" cy="50%">' +
          '<stop offset="0%" stop-color="#f2929c" stop-opacity=".5"/>' +
          '<stop offset="100%" stop-color="#f2929c" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="topG" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="' + TOP_S + '"/>' +
          '<stop offset="100%" stop-color="' + TOP_D + '"/></linearGradient>' +
        '<linearGradient id="legG" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="' + LEGS + '"/>' +
          '<stop offset="100%" stop-color="' + LEGS_D + '"/></linearGradient>' +
      '</defs>' +

      /* ---------- legs: ribbed sage leggings ---------- */
      '<path d="M41 78 q-1.5 6 -1.5 9.5 h10 q0 -4 1 -9.5 Z" fill="url(#legG)"/>' +
      '<path d="M59 78 q1.5 6 1.5 9.5 h-10 q0 -4 -1 -9.5 Z" fill="url(#legG)"/>' +
      '<g stroke="' + LEGS_D + '" stroke-width="0.5" opacity=".6">' +
        '<path d="M43 79 v11 M45.5 79 v11 M48 79 v11"/>' +
        '<path d="M57 79 v11 M54.5 79 v11 M52 79 v11"/></g>' +

      /* ---------- bare feet ----------
         Shoes hide the thing the mode is teaching. If the child taps "Foot"
         she should see a foot, with toes. */
      '<g fill="' + SKIN + '">' +
        '<path d="M36.5 90 q0 -3 4.5 -3 q4.5 0 4.5 3.5 q0 4 -1.5 5.5 q-1.5 1.5 -4 1.5 q-3.5 0 -3.5 -3.5 Z"/>' +
        '<circle cx="36.4" cy="91.6" r="1.5"/><circle cx="36" cy="93.6" r="1.25"/>' +
        '<circle cx="36.2" cy="95.4" r="1.05"/><circle cx="36.9" cy="96.9" r="0.85"/>' +
        '<path d="M63.5 90 q0 -3 -4.5 -3 q-4.5 0 -4.5 3.5 q0 4 1.5 5.5 q1.5 1.5 4 1.5 q3.5 0 3.5 -3.5 Z"/>' +
        '<circle cx="63.6" cy="91.6" r="1.5"/><circle cx="64" cy="93.6" r="1.25"/>' +
        '<circle cx="63.8" cy="95.4" r="1.05"/><circle cx="63.1" cy="96.9" r="0.85"/>' +
      '</g>' +
      '<path d="M39 96.5 q3 1.6 5.5 0" stroke="' + SKIN_D + '" stroke-width="0.8" fill="none" opacity=".55"/>' +
      '<path d="M61 96.5 q-3 1.6 -5.5 0" stroke="' + SKIN_D + '" stroke-width="0.8" fill="none" opacity=".55"/>' +

      /* ---------- torso: pale yellow top ---------- */
      '<path d="M32 59 q0 -6 9 -7 h18 q9 1 9 7 v16 q0 5.5 -7 5.5 h-22 q-7 0 -7 -5.5 Z" fill="url(#topG)"/>' +
      /* ribbed texture */
      '<g stroke="' + TOP_D + '" stroke-width="0.45" opacity=".5">' +
        '<path d="M40 54 v25 M44 53 v27 M48 53 v27 M52 53 v27 M56 53 v27 M60 54 v25"/></g>' +
      /* round neckline */
      '<path d="M43 53 q7 5 14 0" fill="none" stroke="' + TOP_D + '" stroke-width="1.2"/>' +
      /* the little embroidered motif on the chest */
      '<g opacity=".55">' +
        '<circle cx="57" cy="63" r="1.5" fill="' + HAIR_D + '"/>' +
        '<circle cx="55.6" cy="61.4" r="0.9" fill="' + HAIR_D + '"/>' +
        '<circle cx="58.4" cy="61.4" r="0.9" fill="' + HAIR_D + '"/></g>' +

      /* ---------- arms with lettuce-edge cuffs ---------- */
      '<path d="M34 61 q-10 0.5 -16 3" stroke="url(#topG)" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      '<path d="M66 61 q10 0.5 16 3" stroke="url(#topG)" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      '<path d="M19.5 60.5 q-1.2 1.4 0 2.8 q-1.2 1.4 0 2.8 q-1.2 1.2 0 2.4" stroke="' + TOP_D + '" stroke-width="1.1" fill="none"/>' +
      '<path d="M80.5 60.5 q1.2 1.4 0 2.8 q1.2 1.4 0 2.8 q1.2 1.2 0 2.4" stroke="' + TOP_D + '" stroke-width="1.1" fill="none"/>' +

      /* ---------- hands with fingers ---------- */
      '<g fill="' + SKIN + '">' +
        '<circle cx="14" cy="64" r="6"/>' +
        '<rect x="8.6" y="59.4" width="2.7" height="5" rx="1.35"/>' +
        '<rect x="11.4" y="58.2" width="2.7" height="5.8" rx="1.35"/>' +
        '<rect x="14.3" y="58.4" width="2.7" height="5.6" rx="1.35"/>' +
        '<rect x="17.2" y="59.8" width="2.5" height="4.6" rx="1.25"/>' +
        '<circle cx="86" cy="64" r="6"/>' +
        '<rect x="88.7" y="59.4" width="2.7" height="5" rx="1.35"/>' +
        '<rect x="85.9" y="58.2" width="2.7" height="5.8" rx="1.35"/>' +
        '<rect x="83" y="58.4" width="2.7" height="5.6" rx="1.35"/>' +
        '<rect x="80.3" y="59.8" width="2.5" height="4.6" rx="1.25"/>' +
      '</g>' +

      /* ---------- neck ---------- */
      '<path d="M45.5 51 h9 v6 q-4.5 2 -9 0 Z" fill="' + SKIN_D + '"/>' +

      /* ---------- ears ---------- */
      '<ellipse cx="22" cy="33" rx="5" ry="6.6" fill="' + SKIN + '"/>' +
      '<path d="M22 29.5 q2.6 2 1.8 4.6 q-0.8 2.4 -2.4 2.6" stroke="' + SKIN_D + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="78" cy="33" rx="5" ry="6.6" fill="' + SKIN + '"/>' +
      '<path d="M78 29.5 q-2.6 2 -1.8 4.6 q0.8 2.4 2.4 2.6" stroke="' + SKIN_D + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +

      /* ---------- head: round with full toddler cheeks ---------- */
      '<path d="M50 6 C68 6 76 19 76 32 C76 47 64 58 50 58 C36 58 24 47 24 32 C24 19 32 6 50 6 Z" fill="' + SKIN + '"/>' +

      /* ---------- hair: fine, light, soft fringe + topknot ---------- */
      '<path d="M24.4 36 C23.6 17 34 6 50 6 C66 6 76.4 17 75.6 36 C74.6 27 71 21.5 66.5 19.5 Q61 25.5 54 24.2 Q47 23 41 25.5 Q35.5 27.8 31.5 25 C28.8 27.5 26 31 24.4 36 Z" fill="' + HAIR + '"/>' +
      '<path d="M31 22.5 q11 -6 21 -3.2" stroke="' + HAIR_L + '" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".6"/>' +
      '<path d="M28 30 q3 -6 8 -8.5" stroke="' + HAIR_L + '" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".45"/>' +
      '<path d="M72 30 q-3 -6 -8 -8.5" stroke="' + HAIR_L + '" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".45"/>' +
      /* side wisps in front of the ears */
      wisp(28,25,25.5,32,27,38,0.9) + wisp(72,25,74.5,32,73,38,0.9) +
      /* the topknot */
      '<path d="M44.6 14 q5.4 -7 10.8 0 q-5.4 2.6 -10.8 0 Z" fill="' + HAIR + '"/>' +
      '<ellipse cx="50" cy="6.6" rx="5.8" ry="4.8" fill="' + HAIR + '"/>' +
      '<ellipse cx="50" cy="6.6" rx="5.8" ry="4.8" fill="none" stroke="' + HAIR_D + '" stroke-width="0.6" opacity=".45"/>' +
      '<path d="M46 5.8 q4 -2.4 8 0" stroke="' + HAIR_L + '" stroke-width="0.9" fill="none" opacity=".7"/>' +
      '<rect x="46.6" y="10.4" width="6.8" height="2.2" rx="1.1" fill="#e09ab4"/>' +
      '<rect x="46.6" y="10.4" width="6.8" height="1" rx="0.5" fill="#f0b8cc" opacity=".8"/>' +
      /* escaped strands — the signature detail from the photo */
      wisp(47,4.5,43.5,1,41,3,0.75) + wisp(49.5,3.5,49,0,51,0.5,0.7) +
      wisp(52.5,4.5,56,1,58.5,3,0.75) + wisp(45.5,6,41,4.5,39.5,6.5,0.65) +
      wisp(54.5,6,59,4.5,60.5,6.5,0.65) + wisp(51,3.5,53,0.5,54,1,0.6) +

      /* ---------- brows: light and soft, inner ends higher ---------- */
      '<path d="M36 24.2 q5.4 -2.4 10.6 -1.2" stroke="' + HAIR_D + '" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".32"/>' +
      '<path d="M64 24.2 q-5.4 -2.4 -10.6 -1.2" stroke="' + HAIR_D + '" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".32"/>' +

      /* ---------- eyes: large, round, blue-grey ---------- */
      '<g>' +
        '<ellipse cx="41" cy="29.5" rx="5.8" ry="5.4" fill="#fffdfa"/>' +
        '<circle cx="41" cy="29.8" r="4.3" fill="' + IRIS + '"/>' +
        '<circle cx="41" cy="29.8" r="3" fill="' + IRIS_D + '" opacity=".45"/>' +
        '<circle cx="41" cy="29.8" r="2.1" fill="#241f1a"/>' +
        '<circle cx="39.4" cy="28.2" r="1.35" fill="#ffffff"/>' +
        '<circle cx="42.6" cy="31.4" r="0.7" fill="#ffffff" opacity=".65"/>' +
        '<path d="M35.2 28.4 q5.8 -5 11.6 0" stroke="#8a6d4e" stroke-width="0.9" fill="none" stroke-linecap="round" opacity=".6"/>' +
        '<ellipse cx="59" cy="29.5" rx="5.8" ry="5.4" fill="#fffdfa"/>' +
        '<circle cx="59" cy="29.8" r="4.3" fill="' + IRIS + '"/>' +
        '<circle cx="59" cy="29.8" r="3" fill="' + IRIS_D + '" opacity=".45"/>' +
        '<circle cx="59" cy="29.8" r="2.1" fill="#241f1a"/>' +
        '<circle cx="57.4" cy="28.2" r="1.35" fill="#ffffff"/>' +
        '<circle cx="60.6" cy="31.4" r="0.7" fill="#ffffff" opacity=".65"/>' +
        '<path d="M53.2 28.4 q5.8 -5 11.6 0" stroke="#8a6d4e" stroke-width="0.9" fill="none" stroke-linecap="round" opacity=".6"/>' +
      '</g>' +

      /* ---------- nose: small button ---------- */
      '<ellipse cx="50" cy="38.4" rx="3" ry="2.2" fill="' + SKIN_S + '"/>' +
      '<ellipse cx="48.4" cy="39.1" rx="0.95" ry="0.75" fill="' + SKIN_D + '"/>' +
      '<ellipse cx="51.6" cy="39.1" rx="0.95" ry="0.75" fill="' + SKIN_D + '"/>' +

      /* ---------- mouth: small open smile, hint of upper teeth ---------- */
      '<path d="M45.4 47 q4.6 -1.3 9.2 0 q-1.5 4.8 -4.6 4.8 q-3.1 0 -4.6 -4.8 Z" fill="#cf7079"/>' +
      '<path d="M46.5 47.5 q3.5 0.9 7 0 q-0.5 1.5 -3.5 1.5 q-3 0 -3.5 -1.5 Z" fill="#fffdf8"/>' +

      /* ---------- cheeks: full and rosy ---------- */
      '<circle cx="32" cy="41" r="7.5" fill="url(#cheekG)"/>' +
      '<circle cx="68" cy="41" r="7.5" fill="url(#cheekG)"/>' +
      '</svg>';
  }

  var dimTimer = null;
  /* When the last tap asked for a word, and which word. The click retry needs
     both: it must only fire if nothing began speaking since that moment. */
  var lastTapAt = 0, lastWord = "";

  function tap(part, el) {
    lastTapAt = Date.now(); lastWord = part.name;
    /* SPEECH FIRST, and synchronously.
       iOS grants speechSynthesis a short user-activation window after a real
       input event. The previous order - two Web Audio calls, then say() on a
       200ms setTimeout - fell outside it, and the utterance was dropped
       silently: the chime played, the word never came. The Sound check on the
       menu spoke correctly precisely because it calls say() from a plain
       click handler. So the word is requested first, in the handler itself,
       and the sound effects follow. */
    /* Just the word. The pat and the musical note were noise competing with
       the thing she is meant to hear. */
    window.Sound.say(part.name);
    if (navigator.vibrate) { try { navigator.vibrate(10); } catch(e){} }

    /* Three signals at once, because one is not enough at this age:
       the part is OUTLINED and GLOWS, the word is SPOKEN, and the word is
       SHOWN. Sound alone vanishes; a glow alone has no name. */
    hotspots.forEach(function (h) { h.classList.remove("hit"); });
    void el.offsetWidth;
    el.classList.add("hit");

    labelEl.textContent = part.name;
    labelEl.classList.remove("show");
    void labelEl.offsetWidth;
    labelEl.classList.add("show");

    /* dim the rest of the figure so the lit part is unmistakably the subject */
    wrap.classList.add("focusing");
    if (dimTimer) clearTimeout(dimTimer);
    dimTimer = setTimeout(function(){ wrap.classList.remove("focusing"); }, 1600);
  }

  var charUrl = null;

  function buildHotspots(parts) {
    hotspots = [];
    /* Largest first so the smallest (most precise) target ends up on top. */
    parts.slice().sort(function(a,b){ return b.r - a.r; }).forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "hotspot";
      b.setAttribute("aria-label", p.name);
      b.style.left = p.x + "%";
      b.style.top = p.y + "%";
      /* WIDTH ONLY. r is a percentage of the image width; the stylesheet
         gives .hotspot aspect-ratio:1 so the height matches in pixels. Setting
         height as a percentage too would measure it against the container
         HEIGHT and every target on the 896x1195 image would be an ellipse. */
      b.style.width = (p.r*2) + "%";
      /* No preventDefault here. It suppressed the follow-up click, which is
         the event iOS treats as a full user activation - and that click is
         the retry path below. Scrolling is already prevented by
         touch-action:none on .hotspot, which is what preventDefault was for. */
      b.addEventListener("pointerdown", function(e){ e.stopPropagation(); tap(p,b); });

      /* Retry the word if the pointerdown request produced no speech. Guarded
         on speaking() so a working device never says the name twice. */
      b.addEventListener("click", function(e){
        e.preventDefault(); e.stopPropagation();
        if (!window.Sound.spokeSince(lastTapAt)) window.Sound.say(lastWord);
      });
      b.addEventListener("keydown", function(e){
        if(e.key==="Enter"||e.key===" "){ e.preventDefault(); tap(p,b); } });
      wrap.appendChild(b);
      hotspots.push(b);
    });
  }

  /* ---- calibration wizard -------------------------------------------------
     A custom illustration has its own proportions, so the hit areas that match
     the drawn figure will not match it. Rather than guess, the parent taps
     each part once. Twelve taps, once, and it is exact for that image. */
  function runCalibration(parts, onDone) {
    var i = 0, map = {};
    var ui = document.createElement("div");
    ui.className = "calib";
    ui.innerHTML = '<div class="calib-bar">' +
      '<p class="calib-ask"></p><p class="calib-sub">Tap it on the picture</p>' +
      '<div class="calib-row">' +
        '<button type="button" class="ghost-btn subtle calib-skip">Skip this one</button>' +
        '<button type="button" class="ghost-btn subtle calib-back">Back</button>' +
        '<span class="calib-count"></span>' +
      '</div></div>';
    wrap.appendChild(ui);

    var ask = ui.querySelector(".calib-ask");
    var count = ui.querySelector(".calib-count");

    function render() {
      if (i >= parts.length) {
        window.Store.setCalibration(map);
        ui.remove();
        onDone(map);
        return;
      }
      ask.textContent = "Where is her " + parts[i].name.toLowerCase() + "?";
      count.textContent = (i+1) + " of " + parts.length;
      window.Sound.say("Where is her " + parts[i].name.toLowerCase() + "?");
    }
    function advance(){ i++; render(); }

    ui.querySelector(".calib-skip").addEventListener("click", function(e){ e.stopPropagation(); advance(); });
    ui.querySelector(".calib-back").addEventListener("click", function(e){
      e.stopPropagation(); if (i>0) { i--; render(); } });

    wrap.addEventListener("pointerdown", function (e) {
      if (i >= parts.length) return;
      if (ui.contains(e.target)) return;         /* the bar is not the picture */
      var r = wrap.getBoundingClientRect();
      map[parts[i].id] = {
        x: +(((e.clientX - r.left) / r.width) * 100).toFixed(2),
        y: +(((e.clientY - r.top) / r.height) * 100).toFixed(2)
      };
      window.Sound.call("pat");
      advance();
    }, true);

    render();
  }

  function partsFromCalibration(cal) {
    return CFG.bodyParts.map(function (p) {
      var c = cal && cal[p.id];
      return c ? { id:p.id, name:p.name, x:c.x, y:c.y, r:p.r, note:p.note } : p;
    });
  }

  function start(host) {
    CFG = window.CONFIG;
    stage = host.stage;
    wrap = document.createElement("div");
    wrap.className = "body-wrap";

    labelEl = document.createElement("div");
    labelEl.className = "body-label";
    labelEl.setAttribute("aria-live","polite");
    stage.appendChild(wrap);
    stage.appendChild(labelEl);

    /* Three tiers, in order of preference:
         1. a photo the parent imported  -> needs calibration (their photo,
            their framing, so the twelve positions cannot be known here)
         2. the bundled illustration     -> ships with measured coordinates
         3. the drawn SVG figure         -> only if the image fails to load
       Tier 3 exists so the mode is never empty on a bad cache or a failed
       asset fetch; it has its own coordinates because its geometry differs. */
    window.Store.getCharacter().then(function (rec) {
      if (rec && rec.blob) {
        if (charUrl) { try { URL.revokeObjectURL(charUrl); } catch(e){} }
        charUrl = URL.createObjectURL(rec.blob);
        showImage(charUrl, null);
      } else {
        showImage(CFG.characterSrc + (CFG.assetVersion || ""), CFG.bodyParts);
      }
    }).catch(function(){ showDrawn(); });
  }

  /* parts === null means "an imported photo, so ask where things are".
     parts !== null means "a known image with measured coordinates". */
  function showImage(src, parts) {
    wrap.classList.add("custom");
    var img = document.createElement("img");
    img.className = "body-img";
    img.alt = "";
    img.decoding = "sync";

    /* A CACHED image can already be complete before onload is wired, so the
       ready path is called directly as well - which means it can run twice and
       build a second set of targets on top of the first. The old set stays in
       the DOM, is no longer in `hotspots`, and so never gets its glow cleared.
       `settled` makes the ready path run exactly once. */
    var settled = false;
    function ready(fn){ if (settled) return; settled = true; fn(); }

    img.onerror = function(){ ready(showDrawn); };
    img.onload  = function(){ ready(function(){
      /* Hand the real ratio to CSS so the box matches the picture exactly.
         Without this the box and the image disagree and every hit area,
         being a percentage of the box, lands in the wrong place. */
      if (img.naturalWidth && img.naturalHeight) {
        wrap.style.setProperty("--char-ar", img.naturalWidth + " / " + img.naturalHeight);
        wrap.style.setProperty("--char-arn", (img.naturalWidth / img.naturalHeight).toFixed(5));
      }
      if (parts) { buildHotspots(parts); return; }
      var cal = window.Store.getCalibration();
      if (cal) buildHotspots(partsFromCalibration(cal));
      else runCalibration(CFG.bodyParts, function (m) { buildHotspots(partsFromCalibration(m)); });
    }); };

    wrap.innerHTML = "";
    wrap.appendChild(img);
    img.src = src;
    if (img.complete) { img.naturalWidth ? img.onload() : img.onerror(); }
  }

  function showDrawn() {
    wrap.classList.remove("custom");
    wrap.innerHTML = figureSVG();
    hotspots = [];
    buildHotspots(CFG.drawnParts || CFG.bodyParts);
  }

  function stop(){
    if (dimTimer) { clearTimeout(dimTimer); dimTimer = null; }
    if (charUrl) { try { URL.revokeObjectURL(charUrl); } catch(e){} charUrl = null; }
    stage.innerHTML=""; hotspots=[]; labelEl=null;
  }
  function resize(){}

  return { id:"body", start:start, stop:stop, resize:resize,
           _recalibrate:function(){ window.Store.clearCalibration(); } };
})();
