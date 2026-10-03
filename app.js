/* ===========================================================================
   app.js — menu, mode router, and the exit guard.

   THE EXIT GUARD
   A toddler must not be able to leave the game she is in, but a parent must
   be able to, one-handed, while holding her. The rule: BOTH top corners held
   at once for 3 seconds. That needs two hands and deliberate intent — a palm
   resting on the glass or a random flurry of taps will not do it. A ring
   fills while held so the parent can see it working, and any release cancels.

   This does NOT replace Guided Access. Nothing in any web app — or any native
   app — can block the swipe-up-to-home gesture. Guided Access is still what
   locks the iPad itself; the guard just keeps her inside the chosen game.
   =========================================================================== */
(function () {
  "use strict";

  var CFG = window.CONFIG;
  var curtain  = document.getElementById("curtain");
  var menuEl   = document.getElementById("menu");
  var gridEl   = document.getElementById("menu-grid");
  var playEl   = document.getElementById("play");
  var stage    = document.getElementById("stage");
  var trailC   = document.getElementById("trails");
  var fxC      = document.getElementById("fx");
  var guardEl  = document.getElementById("guard");
  var ringFg   = guardEl.querySelector(".ring-fg");
  var addBtn   = document.getElementById("add-photos-btn");
  var fileIn   = document.getElementById("photo-input");

  var tctx = trailC.getContext("2d");
  var fctx = fxC.getContext("2d");

  /* Five of the seven menu entries are the same float engine with a
     different theme; only Me and Photos are their own modes. */
  function modeFor(id) {
    var m = CFG.modes.filter(function(x){ return x.id === id; })[0];
    if (!m) return null;
    if (m.theme) return { impl: window.ModeFloat, theme: m.theme };
    if (m.scene) return { impl: window.ModeScene.make(m.scene) };
    if (id === "body")     return { impl: window.ModeBody };
    if (id === "letters")  return { impl: window.ModeLearn.letters };
    if (id === "counting") return { impl: window.ModeLearn.counting };
    if (id === "colours")  return { impl: window.ModeLearn.colours };
    if (id === "shapes")   return { impl: window.ModeLearn.shapes };
    if (id === "photos") return { impl: window.ModePhotos };
    return null;
  }

  var current = null, currentId = null, started = false, wakeLock = null;
  var W = 0, H = 0, DPR = 1;

  /* ---------- canvas sizing (DPR-correct; all drawing in CSS pixels) ----- */
  function sizeCanvas(c, cx) {
    c.width  = Math.floor(W * DPR);
    c.height = Math.floor(H * DPR);
    c.style.width  = W + "px";
    c.style.height = H + "px";
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx.lineCap = "round"; cx.lineJoin = "round";
  }
  function resize() {
    DPR = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    sizeCanvas(trailC, tctx); sizeCanvas(fxC, fctx);
    if (current && current.resize) current.resize({ W:W, H:H, DPR:DPR });
  }
  function dims() { return { W:W, H:H, DPR:DPR }; }

  /* ---------- menu ------------------------------------------------------ */
  /* Each tile shows a real object from its own theme, so a child who cannot
     read still knows what she is choosing. Drawn inline; nothing to license. */
  function tileImg(path) {
    return '<img class="tile-img" src="' + path + '.webp' +
           (CFG.assetVersion || "") + '" alt="" draggable="false">';
  }

  var TILE_ART = {
    bubbles:   function(){ return window.Sprites.draw("bubble",{c1:"#9fe0f7",c2:"#3577c9"}); },
    /* the menu tile shows the same cut-out sticker the game uses */
    animals:   function(){ return tileImg("objects/animals/cat"); },
    balls:     function(){ return tileImg("objects/balls/soccer"); },
    halloween: function(){ return tileImg("objects/halloween/pumpkin"); },
    body:      function(){ return window.Sprites.draw("face"); },
    letters:   function(){ return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<text x="50" y="72" text-anchor="middle" font-family="system-ui,sans-serif" font-size="62" font-weight="800" fill="#4f9fd8">Aa</text></svg>'; },
    counting:  function(){ return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<text x="50" y="72" text-anchor="middle" font-family="system-ui,sans-serif" font-size="62" font-weight="800" fill="#e0762c">123</text></svg>'; },
    colours:   function(){ return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="36" cy="38" r="24" fill="#e03a3a"/><circle cx="64" cy="38" r="24" fill="#f2c53d" opacity=".9"/>' +
      '<circle cx="50" cy="64" r="24" fill="#3d7fd6" opacity=".85"/></svg>'; },
    shapes:    function(){ return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="32" cy="34" r="20" fill="#4bab5a"/><rect x="54" y="14" width="38" height="38" rx="5" fill="#f08122"/>' +
      '<path d="M50 56 L78 94 H22 Z" fill="#8e5ad0"/></svg>'; },
    "scene-farm": function(){ return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="0" y="52" width="100" height="48" rx="6" fill="#79c268"/>' +
      '<path d="M18 52 V30 L38 18 L58 30 V52 Z" fill="#d8443c"/><path d="M14 31 L38 15 L62 31 Z" fill="#f0f2f4"/>' +
      '<rect x="32" y="36" width="12" height="16" fill="#f0f2f4"/>' +
      '<ellipse cx="74" cy="66" rx="15" ry="11" fill="#fff"/><circle cx="68" cy="62" r="4" fill="#2a2f36"/>' +
      '<circle cx="80" cy="70" r="3.4" fill="#2a2f36"/></svg>'; },
    "scene-ocean": function(){ return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="0" y="0" width="100" height="100" rx="8" fill="#2f86c4"/>' +
      '<path d="M18 62 q10 -22 26 -8 q6 -12 16 -4 l16 -12 v34 Z" fill="#7fd4f0"/>' +
      '<circle cx="34" cy="46" r="3" fill="#123"/></svg>'; },
    "scene-jungle": function(){ return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="0" y="54" width="100" height="46" fill="#4f9e4a"/>' +
      '<circle cx="50" cy="40" r="20" fill="#f0a63c"/><circle cx="50" cy="42" r="13" fill="#f7cf90"/>' +
      '<circle cx="44" cy="39" r="2.6" fill="#2a2f36"/><circle cx="56" cy="39" r="2.6" fill="#2a2f36"/>' +
      '<path d="M44 48 q6 5 12 0" stroke="#2a2f36" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>'; },
    "scene-town": function(){ return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="0" y="66" width="100" height="34" fill="#9aa5b1"/>' +
      '<path d="M14 62 h44 l14 -14 h10 q8 0 8 8 v6 h8 v14 H14 Z" fill="#d8443c"/>' +
      '<circle cx="32" cy="78" r="8" fill="#2a2f36"/><circle cx="70" cy="78" r="8" fill="#2a2f36"/></svg>'; },
    photos:    function(){ return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="10" y="20" width="80" height="60" rx="9" fill="#fbfbfd"/>' +
      '<circle cx="32" cy="40" r="7" fill="#f0a244"/>' +
      '<path d="M16 72 L40 46 L56 62 L68 51 L84 72 Z" fill="#4f9fd8"/>' +
      '<rect x="10" y="20" width="80" height="60" rx="9" fill="none" stroke="#cfd6de" stroke-width="2.5"/></svg>'; }
  };

  function buildMenu() {
    gridEl.innerHTML = "";
    CFG.modes.forEach(function (m) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "mode-tile";
      var th = m.theme ? CFG.themes[m.theme] : null;
      b.style.setProperty("--hue", (th && th.hue) || (m.id === "photos" ? "#6cc46e" : "#e86ba4"));
      b.setAttribute("aria-label", m.title);
      b.innerHTML = '<span class="mode-art" data-mode="' + m.id + '">' +
                      ((TILE_ART[m.id] && TILE_ART[m.id]()) || '') + '</span>' +
                    '<span class="mode-name">' + m.title + '</span>' +
                    '<span class="mode-count" data-for="' + m.id + '"></span>';
      b.addEventListener("click", function () { enter(m.id); });
      gridEl.appendChild(b);
    });
    updatePhotoCount();
  }

  function updatePhotoCount() {
    window.Store.countPhotos().then(function (n) {
      var badge = gridEl.querySelector('.mode-count[data-for="photos"]');
      if (badge) badge.textContent = n ? n + (n === 1 ? " photo" : " photos") : "none yet";
      addBtn.textContent = n ? "Add more photos (" + n + " saved)" : "Add photos";
    });
  }

  /* ---------- mode routing ---------------------------------------------- */
  function enter(id) {
    var sel = modeFor(id);
    if (!sel) return;
    var mode = sel.impl;
    if (window.Sound && window.Sound.hush) window.Sound.hush();
    if (current) current.stop();
    stage.innerHTML = "";
    tctx.clearRect(0,0,W,H); fctx.clearRect(0,0,W,H);
    menuEl.hidden = true;
    playEl.hidden = false;
    guardEl.setAttribute("aria-hidden", "false");
    playEl.setAttribute("data-mode", id);
    resize();
    current = mode;
    mode.start({ stage:stage, tctx:tctx, fctx:fctx, dims:dims }, sel.theme);
    currentId = id;
    /* restart the corner hint animation on every entry */
    var hint = document.getElementById("guard-hint");
    if (hint) { hint.style.animation = "none"; void hint.offsetWidth; hint.style.animation = ""; }
    window.Sound.chime();
  }

  function toMenu() {
    /* Nothing should follow her out of the game: a word left mid-sentence
       keeps playing over the menu otherwise, and the guard that protects it
       from being interrupted is what makes that possible. */
    if (window.Sound && window.Sound.hush) window.Sound.hush();
    if (current) { current.stop(); current = null; currentId = null; }
    stage.innerHTML = "";
    tctx.clearRect(0,0,W,H); fctx.clearRect(0,0,W,H);
    playEl.hidden = true;
    playEl.removeAttribute("data-mode");
    guardEl.setAttribute("aria-hidden", "true");
    menuEl.hidden = false;
    updatePhotoCount();
  }

  /* ---------- exit guard ------------------------------------------------
     Rewritten to use TOUCH events, not Pointer events.

     WHY: iOS Safari fires `pointercancel` on the first finger the moment a
     second finger lands. The old implementation cancelled the hold on
     pointercancel, so the two-corner gesture cancelled itself at the exact
     instant it was completed. It worked on desktop and never once worked on
     an iPad.

     `TouchEvent.touches` is a live list of every finger currently on the
     glass, so instead of tracking press/release bookkeeping we just ask each
     frame: is there a finger in the left corner AND one in the right corner?
     That is immune to the cancel behaviour entirely.
     ---------------------------------------------------------------------- */
  var holdStart = 0, holdRaf = null, holding = false;

  /* Each corner is a REAL element that sits above the play surface and owns
     its own touch handlers.

     WHY: the previous version listened on `document` and worked out corner
     membership from coordinates. In Bubbles the corners are empty space so it
     worked; in Animals, Me and Photos a tile or the image covers the corner
     and swallowed the touch before the document listener could act. Owning
     the element removes the guesswork entirely — it works identically in
     every mode because nothing can sit on top of it. */
  var cornerEls = {
    left:  guardEl.querySelector('.guard-corner[data-corner="left"]'),
    right: guardEl.querySelector('.guard-corner[data-corner="right"]')
  };
  var down = { left:false, right:false };

  function setCorner(side, isDown) {
    down[side] = isDown;
    if (cornerEls[side]) cornerEls[side].classList.toggle("pressed", isDown);
    evaluate();
  }

  function evaluate() {
    if (playEl.hidden) { if (holding) cancelHold(); return; }
    var both = down.left && down.right;
    if (both && !holding) {
      holding = true;
      holdStart = Date.now();
      guardEl.classList.add("active");
      if (!holdRaf) holdRaf = requestAnimationFrame(tickHold);
    } else if (!both && holding) {
      cancelHold();
    }
  }

  function wireCorner(side) {
    var el = cornerEls[side];
    if (!el) return;
    /* touch first (the real path on iPad), pointer as the desktop fallback */
    el.addEventListener("touchstart", function (e) { e.preventDefault(); setCorner(side, true); },  { passive:false });
    el.addEventListener("touchend",   function () { setCorner(side, false); });
    el.addEventListener("touchcancel",function () { setCorner(side, false); });
    el.addEventListener("pointerdown",function (e) { e.preventDefault(); setCorner(side, true); });
    el.addEventListener("pointerup",  function () { setCorner(side, false); });
    el.addEventListener("pointerleave", function () { setCorner(side, false); });
  }

  /* Safety net: if a touch that started on a corner is released anywhere
     else on screen, clear both. Prevents a stuck "held" state. */
  function releaseAll() { setCorner("left", false); setCorner("right", false); }

  function cancelHold() {
    holding = false;
    if (holdRaf) cancelAnimationFrame(holdRaf);
    holdRaf = null;
    guardEl.classList.remove("active");
    setRing(0);
  }

  function setRing(p) {
    var C = 2 * Math.PI * 52;
    ringFg.style.strokeDasharray = C;
    ringFg.style.strokeDashoffset = C * (1 - p);
  }

  function tickHold() {
    if (!holding) { holdRaf = null; return; }
    var p = Math.min(1, (Date.now() - holdStart) / CFG.guardHoldMs);
    setRing(p);
    if (p >= 1) { cancelHold(); down.left = down.right = false;
                  if (cornerEls.left) cornerEls.left.classList.remove("pressed");
                  if (cornerEls.right) cornerEls.right.classList.remove("pressed");
                  toMenu(); return; }
    holdRaf = requestAnimationFrame(tickHold);
  }

  /* ---------- photo import (parent-facing, menu only) ------------------- */
  addBtn.addEventListener("click", function () { fileIn.click(); });

  fileIn.addEventListener("change", function () {
    var files = [...(fileIn.files || [])];
    if (!files.length) return;
    addBtn.disabled = true;
    addBtn.textContent = "Saving 0/" + files.length + "…";
    var done = 0, failed = 0;
    files.reduce(function (chain, f) {
      return chain.then(function () {
        return window.Store.importFile(f)
          .then(function(){ done++; }, function(){ failed++; })
          .then(function(){ addBtn.textContent = "Saving " + (done+failed) + "/" + files.length + "…"; });
      });
    }, Promise.resolve()).then(function () {
      addBtn.disabled = false;
      fileIn.value = "";
      updatePhotoCount();
      if (failed) addBtn.textContent = done + " added, " + failed + " skipped";
    });
  });

  /* ---------- custom character (parent-facing) --------------------------
     The parent supplies an illustration of their own child. It is stored on
     THIS DEVICE only — never uploaded, never in the repository. Choosing a
     new picture clears the old tap positions, because they belonged to the
     old image and would silently be wrong. */
  var charBtn = document.getElementById("character-btn");
  var charIn  = document.getElementById("character-input");
  var recalBtn = document.getElementById("recalib-btn");

  function refreshCharacterUi() {
    window.Store.getCharacter().then(function (rec) {
      var has = !!(rec && rec.blob);
      charBtn.textContent = has ? "Change her picture" : "Set her picture";
      recalBtn.hidden = !has;
    });
  }

  if (charBtn) charBtn.addEventListener("click", function () { charIn.click(); });

  if (charIn) charIn.addEventListener("change", function () {
    var f = (charIn.files || [])[0];
    if (!f) return;
    charBtn.disabled = true;
    charBtn.textContent = "Saving\u2026";
    window.Store.setCharacter(f).then(function () {
      window.Store.clearCalibration();   /* old positions belong to the old image */
      charIn.value = "";
      charBtn.disabled = false;
      refreshCharacterUi();
      charBtn.textContent = "Saved \u2014 open Me to place the parts";
      setTimeout(refreshCharacterUi, 3200);
    }, function () {
      charIn.value = "";
      charBtn.disabled = false;
      charBtn.textContent = "Could not read that image";
      setTimeout(refreshCharacterUi, 2600);
    });
  });

  if (recalBtn) recalBtn.addEventListener("click", function () {
    window.Store.clearCalibration();
    recalBtn.textContent = "Cleared \u2014 open Me to place them again";
    setTimeout(function(){ recalBtn.textContent = "Redo tap positions"; }, 3000);
  });

  /* ---------- sound check (parent-facing diagnostic) ---------------------
     Speech depends on the device's own voice engine, which cannot be tested
     from a development machine. This turns "there's no sound" into something
     specific enough to act on. */
  var scBtn = document.getElementById("sound-check-btn");
  var scOut = document.getElementById("sound-report");
  if (scBtn) scBtn.addEventListener("click", function () {
    window.Sound.unlock();
    window.Sound.note(523.25, 1);
    setTimeout(function () { window.Sound.pop(); }, 350);
    var spoke = false;
    setTimeout(function () { spoke = window.Sound.say("Hello"); }, 700);
    setTimeout(function () {
      var st = window.Sound.status();
      scOut.hidden = false;
      scOut.textContent =
        "You should have heard: a chime, a pop, then the word \u201cHello\u201d.\n\n" +
        "audio engine   : " + st.audioContext + (st.ready ? " (ready)" : " (NOT ready)") + "\n" +
        "audio session  : " + st.sessionType + "\n" +
        "speech support : " + (st.speechSupported ? "yes" : "NO") + "\n" +
        "speech primed  : " + (st.speechPrimed ? "yes" : "no") + "\n" +
        "voices found   : " + st.voices + "\n" +
        "speak accepted : " + (spoke ? "yes" : "no") + "\n\n" +
        (st.voices === 0
          ? "No voices found \u2014 words will be silent, but tones still work."
          : "If you heard nothing at all, check the mute switch and volume.");
    }, 1500);
  });

  /* ---------- screen wake ----------------------------------------------- */
  function keepAwake() {
    try {
      if (navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request("screen").then(function (l) { wakeLock = l; },
                                                  function () {});
      }
    } catch (e) {}
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && started) keepAwake();
  });

  /* ---------- start ------------------------------------------------------ */
  function begin() {
    if (started) return;
    started = true;
    window.Sound.unlock();
    window.Store.requestPersistence();
    keepAwake();
    curtain.classList.add("gone");
    setTimeout(function () { curtain.style.display = "none"; }, 450);
    menuEl.hidden = false;
  }

  function init() {
    resize();
    buildMenu();
    refreshCharacterUi();
    /* No preventDefault before begin(): it suppresses the click iOS treats as
       a full user activation, and begin() is where the speech engine is
       primed with a real, audible utterance. */
    curtain.addEventListener("pointerdown", function () { begin(); });
    curtain.addEventListener("click", function (e) { e.preventDefault(); begin(); });

    wireCorner("left");
    wireCorner("right");

    /* Keyboard exit, for desktop use and automated testing. A toddler using
       an iPad has no keyboard, so this costs nothing in safety; if one is
       attached, Escape is not a key she will find and hold. */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !playEl.hidden) { e.preventDefault(); toMenu(); }
    });
    /* A visible way out, but ONLY on a machine with a mouse.

       The two-corner hold is a touchscreen gesture - with a mouse you have
       one pointer, so there is no way to press both corners and the guard is
       unopenable. This button appears only where the browser reports a fine
       pointer and no touch screen, so it can never show up on her iPad; a
       toddler cannot find what is not rendered. */
    var mouseOnly = !("ontouchstart" in window) && navigator.maxTouchPoints === 0 &&
                    window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    if (mouseOnly) {
      var back = document.createElement("button");
      back.type = "button";
      back.id = "mouse-back";
      back.textContent = "\u2190 Menu";
      back.addEventListener("click", function () { toMenu(); });
      document.body.appendChild(back);
      var sync = function () { back.hidden = playEl.hidden; };
      new MutationObserver(sync).observe(playEl, { attributes:true, attributeFilter:["hidden"] });
      sync();
    }

    /* clear a stuck corner if the finger is released anywhere else */
    document.addEventListener("touchend", function (e) {
      if (e.touches.length === 0) releaseAll();
    }, { capture:true, passive:true });
    document.addEventListener("pointerup", function () {
      if (down.left || down.right) setTimeout(releaseAll, 0);
    }, true);

    /* Block gestures that would take her out of the app's own interaction
       model. user-scalable=no does nothing on iOS; these do. */
    ["gesturestart","gesturechange","gestureend"].forEach(function (n) {
      document.addEventListener(n, function (e) { e.preventDefault(); });
    });
    document.addEventListener("contextmenu", function (e) { e.preventDefault(); });

    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", function () { setTimeout(resize, 120); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  /* exposed for automated testing only */
  window.__app = { enter:enter, toMenu:toMenu, begin:begin,
                   get current(){ return currentId; } };
})();
