/* ===========================================================================
   mode-scene.js — a picture she can poke.

   A scene is a coded background plus a handful of cut-out stickers placed at
   known positions. That matters: because the app PLACES each sticker, it also
   knows exactly where each one is, so the tap target is the sticker itself.
   Nothing is measured against a flat illustration and nothing can drift.

   Tapping speaks the word and plays the thing's own sound. One utterance,
   requested synchronously in the handler - the iOS activation rule that the
   body parts taught us.
   =========================================================================== */
window.ModeScene = (function () {
  "use strict";
  var stage, wrap, labelEl, CFG, scene, items = [];

  function make(id) {
    return {
      id: "scene-" + id,
      start: function (host) { start(host, id); },
      stop: stop,
      resize: function () {}
    };
  }


  /* ---- scenery ------------------------------------------------------------
     Flat shapes drawn behind the stickers: a tree for the monkey to sit in, a
     pond for the elephant to drink from, a road for the cars. They are not
     tappable and carry no words - they exist so the picture reads as a place
     rather than as objects on a coloured band.

     Each is drawn in its own 0-100 box and placed by percentage, exactly like
     a sticker, so it scales with the scene. */
  var DECOR = {
    cloud: function () {
      return '<svg viewBox="0 0 100 52" aria-hidden="true">' +
        '<g fill="#ffffff" opacity=".92">' +
        '<circle cx="28" cy="30" r="18"/><circle cx="50" cy="22" r="22"/>' +
        '<circle cx="72" cy="31" r="17"/><rect x="26" y="30" width="48" height="20" rx="10"/>' +
        '</g></svg>';
    },
    tree: function () {                       /* canopy with a sturdy trunk */
      return '<svg viewBox="0 0 100 150" aria-hidden="true">' +
        '<path d="M44 150 V72 q-10 -4 -8 -16 h28 q2 12 -8 16 v78 Z" fill="#8a6239"/>' +
        '<path d="M50 74 q-14 -6 -12 -20" stroke="#8a6239" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<path d="M50 80 q16 -8 14 -24" stroke="#8a6239" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<g fill="#3f8f3c">' +
        '<circle cx="50" cy="30" r="28"/><circle cx="24" cy="46" r="21"/>' +
        '<circle cx="76" cy="46" r="21"/><circle cx="38" cy="56" r="17"/>' +
        '<circle cx="62" cy="56" r="17"/></g>' +
        '<g fill="#4fa649" opacity=".85">' +
        '<circle cx="42" cy="24" r="15"/><circle cx="66" cy="38" r="12"/></g></svg>';
    },
    palm: function () {
      return '<svg viewBox="0 0 100 150" aria-hidden="true">' +
        '<path d="M46 150 q-4 -60 6 -96 h8 q-12 38 -6 96 Z" fill="#9a7042"/>' +
        '<g fill="#3f8f3c">' +
        '<path d="M54 52 q-30 -18 -46 -4 q18 -4 44 10 Z"/>' +
        '<path d="M56 50 q26 -22 44 -8 q-20 -2 -42 14 Z"/>' +
        '<path d="M54 48 q-16 -30 -40 -30 q20 8 36 34 Z"/>' +
        '<path d="M58 48 q16 -32 40 -28 q-22 6 -36 32 Z"/>' +
        '<path d="M56 46 q0 -30 4 -42 q6 14 2 44 Z"/></g>' +
        '<g fill="#a8621f"><circle cx="52" cy="54" r="5"/><circle cx="62" cy="56" r="4.5"/>' +
        '<circle cx="57" cy="62" r="4.5"/></g></svg>';
    },
    bush: function () {
      return '<svg viewBox="0 0 100 58" aria-hidden="true"><g fill="#3d8a3a">' +
        '<circle cx="26" cy="34" r="22"/><circle cx="52" cy="26" r="26"/>' +
        '<circle cx="76" cy="36" r="20"/><rect x="24" y="34" width="54" height="24" rx="12"/>' +
        '</g><g fill="#4fa649" opacity=".7"><circle cx="44" cy="20" r="12"/></g></svg>';
    },
    pond: function () {
      return '<svg viewBox="0 0 100 44" aria-hidden="true">' +
        '<ellipse cx="50" cy="22" rx="49" ry="21" fill="#4f9fd8"/>' +
        '<ellipse cx="50" cy="20" rx="44" ry="17" fill="#6fb8e8"/>' +
        '<path d="M18 16 q10 -4 20 0" stroke="#ffffff" stroke-width="2.6" fill="none" opacity=".6" stroke-linecap="round"/>' +
        '<path d="M56 27 q12 -4 24 0" stroke="#ffffff" stroke-width="2.4" fill="none" opacity=".45" stroke-linecap="round"/></svg>';
    },
    fence: function () {
      var p = '';
      for (var i = 0; i < 9; i++) {
        var x = 3 + i * 11.6;
        p += '<path d="M' + x + ' 46 V10 l3 -5 l3 5 V46 Z" fill="#e8e2d4" stroke="#bfb49d" stroke-width="1"/>';
      }
      return '<svg viewBox="0 0 100 50" aria-hidden="true">' + p +
        '<rect x="0" y="17" width="100" height="5" fill="#e8e2d4" stroke="#bfb49d" stroke-width="1"/>' +
        '<rect x="0" y="31" width="100" height="5" fill="#e8e2d4" stroke="#bfb49d" stroke-width="1"/></svg>';
    },
    seaweed: function () {
      return '<svg viewBox="0 0 100 150" aria-hidden="true"><g fill="none" stroke="#2f8f6a" stroke-linecap="round">' +
        '<path d="M34 150 q-16 -34 4 -60 q16 -22 2 -50" stroke-width="11"/>' +
        '<path d="M62 150 q14 -30 -2 -54 q-14 -22 4 -40" stroke-width="9" stroke="#3aa87e"/>' +
        '<path d="M84 150 q-10 -26 4 -46" stroke-width="7" stroke="#2f8f6a"/></g></svg>';
    },
    coral: function () {
      return '<svg viewBox="0 0 100 80" aria-hidden="true"><g fill="#e8737f">' +
        '<path d="M50 80 V44 q-14 -4 -14 -20 q10 8 14 6 V12 h8 v20 q6 4 16 -6 q0 18 -16 22 V80 Z"/></g>' +
        '<g fill="#f2939c" opacity=".8"><circle cx="30" cy="66" r="10"/><circle cx="72" cy="70" r="8"/></g></svg>';
    },
    rock: function () {
      return '<svg viewBox="0 0 100 56" aria-hidden="true">' +
        '<path d="M6 56 q4 -30 24 -38 q22 -10 38 4 q22 12 26 34 Z" fill="#8f9aa6"/>' +
        '<path d="M22 56 q6 -22 22 -28 q-6 14 -4 28 Z" fill="#a4aeb9" opacity=".8"/></svg>';
    },
    road: function () {
      return '<svg viewBox="0 0 100 11" preserveAspectRatio="none" aria-hidden="true">' +
        '<rect x="0" y="0" width="100" height="11" fill="#5c646d"/>' +
        '<rect x="0" y="0" width="100" height="1" fill="#7d8894"/>' +
        '<g fill="#f3f0e4">' +
        '<rect x="4"  y="4.6" width="9" height="1.8" rx=".9"/>' +
        '<rect x="21" y="4.6" width="9" height="1.8" rx=".9"/>' +
        '<rect x="38" y="4.6" width="9" height="1.8" rx=".9"/>' +
        '<rect x="55" y="4.6" width="9" height="1.8" rx=".9"/>' +
        '<rect x="72" y="4.6" width="9" height="1.8" rx=".9"/>' +
        '<rect x="89" y="4.6" width="9" height="1.8" rx=".9"/></g></svg>';
    },
    tracks: function () {
      var t = '';
      for (var i = 0; i < 16; i++) t += '<rect x="' + (1 + i * 6.3) + '" y="1" width="4" height="7" rx=".8" fill="#8a6239"/>';
      return '<svg viewBox="0 0 100 9" preserveAspectRatio="none" aria-hidden="true">' + t +
        '<rect x="0" y="2.4" width="100" height="1.5" fill="#b4bcc4"/>' +
        '<rect x="0" y="5.6" width="100" height="1.5" fill="#b4bcc4"/></svg>';
    },
    sea: function () {
      return '<svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">' +
        '<rect x="0" y="0" width="100" height="10" fill="#4f9fd8"/>' +
        '<g stroke="#ffffff" stroke-width="1.6" fill="none" opacity=".5" stroke-linecap="round">' +
        '<path d="M6 4 q4 -2.5 8 0 t8 0"/><path d="M40 7 q4 -2.5 8 0 t8 0"/>' +
        '<path d="M74 3.5 q4 -2.5 8 0 t8 0"/></g></svg>';
    },
    sun: function () {
      return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
        '<circle cx="50" cy="50" r="34" fill="#ffe066"/>' +
        '<circle cx="50" cy="50" r="46" fill="#ffe066" opacity=".22"/></svg>';
    }
  };

  function addDecor() {
    (scene.decor || []).forEach(function (d) {
      var el = document.createElement("div");
      el.className = "scene-decor";
      el.setAttribute("aria-hidden", "true");
      el.style.left = d.x + "%";
      el.style.top = d.y + "%";
      el.style.width = d.s + "%";
      if (d.flip) el.style.setProperty("--flip", "-1");
      if (d.o != null) el.style.opacity = String(d.o);
      el.style.zIndex = String(d.z == null ? 2 : d.z);
      el.innerHTML = (DECOR[d.k] || DECOR.bush)();
      wrap.appendChild(el);
    });
  }

  function start(host, sceneId) {
    CFG = window.CONFIG;
    stage = host.stage;
    scene = CFG.scenes.filter(function (s) { return s.id === sceneId; })[0];
    if (!scene) return;

    wrap = document.createElement("div");
    wrap.className = "scene-wrap";
    wrap.style.setProperty("--sky-1", scene.sky[0]);
    wrap.style.setProperty("--sky-2", scene.sky[1]);
    wrap.style.setProperty("--ground", scene.ground);
    wrap.style.setProperty("--ground-top", scene.groundTop + "%");
    if (scene.ground2) wrap.style.setProperty("--ground-2", scene.ground2);
    /* Underwater has no sky, so it gets no sun and no horizon rise. */
    if (scene.sun === false) wrap.classList.add("no-sun");

    /* The word appears BESIDE the thing she touched, not in a bar at the
       bottom where it kept landing behind another animal. It also sits above
       everything, so it is never covered. */
    labelEl = document.createElement("div");
    labelEl.className = "spot-label";
    labelEl.setAttribute("aria-live", "polite");

    addDecor();

    items = [];
    /* Back to front: something lower on the screen is nearer, so it is drawn
       later and wins a tap where two overlap. */
    scene.items.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "scene-item";
      b.setAttribute("aria-label", it.n);
      b.style.left = it.x + "%";
      b.style.top = it.y + "%";
      b.style.width = it.s + "%";
      b.style.zIndex = String(10 + Math.round(it.y));
      b.innerHTML = '<img src="' + CFG.sceneDir + scene.id + "/" + it.f + ".webp" +
                    (CFG.assetVersion || "") + '" alt="" draggable="false">';
      b.addEventListener("pointerdown", function (e) { e.stopPropagation(); tap(it, b); });
      b.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        if (!window.Sound.spokeSince(it._at || 0)) window.Sound.say(it.n);
      });
      wrap.appendChild(b);
      items.push(b);
    });

    stage.appendChild(wrap);
    stage.appendChild(labelEl);
  }

  function tap(it, el) {
    it._at = Date.now();
    /* Name first, then the thing's own noise once the name has finished. */
    window.Sound.sayThen(it.n, it.sound, it.call, it.sfx);
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} }

    items.forEach(function (x) { x.classList.remove("hit"); });
    void el.offsetWidth;
    el.classList.add("hit");

    placeLabel(el, it.n);
  }

  /* Above the thing when there is room, below it when there is not. */
  function placeLabel(el, text) {
    if (!labelEl || !wrap) return;
    var r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    labelEl.textContent = text;
    labelEl.classList.remove("show", "below");
    void labelEl.offsetWidth;
    var above = r.top - w.top - 10;
    if (r.top - 70 < 0) {
      labelEl.classList.add("below");
      labelEl.style.top = (r.bottom - w.top + 10) + "px";
    } else {
      labelEl.style.top = above + "px";
    }
    labelEl.style.left = (r.left - w.left + r.width / 2) + "px";
    labelEl.classList.add("show");
  }

  function stop() {
    if (stage) stage.innerHTML = "";
    wrap = null; labelEl = null; items = [];
  }

  return { make: make };
})();
