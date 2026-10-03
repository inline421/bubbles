/* ===========================================================================
   mode-animals.js — tap a big animal, hear its name.

   Every animal is drawn by ONE parametric renderer from the data rows in
   config.js. Adding an animal is adding a row — there is no per-animal
   drawing code to write or maintain.

   On sound: real animal noises would need licensed recordings, and a
   synthesised "moo" sounds like a kazoo. So each animal speaks its name and
   plays a tone. Honest, useful at this age (naming is the point), and zero
   licensing exposure. Real CC0 calls can be added later without touching
   this file — see ASSETS.md.
   =========================================================================== */
window.ModeAnimals = (function () {
  "use strict";
  var stage, tiles = [], CFG;

  /* --- SVG primitives. viewBox is 0 0 100 100 for every animal. --------- */
  function eyes(cx1, cx2, cy, r) {
    var e = "";
    [cx1, cx2].forEach(function (cx) {
      e += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#ffffff"/>' +
           '<circle cx="'+cx+'" cy="'+(cy+0.6)+'" r="'+(r*0.55)+'" fill="#2b2b33"/>' +
           '<circle cx="'+(cx-r*0.25)+'" cy="'+(cy-r*0.3)+'" r="'+(r*0.2)+'" fill="#ffffff"/>';
    });
    return e;
  }

  function earShape(kind, a) {
    switch (kind) {
      case "triangle":
        return '<polygon points="24,30 30,6 44,22" fill="'+a.body+'"/>' +
               '<polygon points="76,30 70,6 56,22" fill="'+a.body+'"/>' +
               '<polygon points="28,27 32,14 40,23" fill="'+a.face+'"/>' +
               '<polygon points="72,27 68,14 60,23" fill="'+a.face+'"/>';
      case "round":
        return '<circle cx="22" cy="28" r="11" fill="'+a.body+'"/>' +
               '<circle cx="78" cy="28" r="11" fill="'+a.body+'"/>' +
               '<circle cx="22" cy="28" r="5.5" fill="'+a.face+'"/>' +
               '<circle cx="78" cy="28" r="5.5" fill="'+a.face+'"/>';
      case "floppy":
        return '<ellipse cx="19" cy="52" rx="9" ry="19" fill="'+a.dark+'"/>' +
               '<ellipse cx="81" cy="52" rx="9" ry="19" fill="'+a.dark+'"/>';
      case "tall":
        return '<line x1="36" y1="24" x2="30" y2="6" stroke="'+a.dark+'" stroke-width="3" stroke-linecap="round"/>' +
               '<line x1="64" y1="24" x2="70" y2="6" stroke="'+a.dark+'" stroke-width="3" stroke-linecap="round"/>' +
               '<circle cx="29" cy="5" r="4" fill="'+a.dark+'"/>' +
               '<circle cx="71" cy="5" r="4" fill="'+a.dark+'"/>';
      default: return "";
    }
  }

  function muzzleShape(kind, a) {
    switch (kind) {
      case "round":
        return '<ellipse cx="50" cy="64" rx="16" ry="12" fill="'+a.face+'"/>' +
               '<ellipse cx="50" cy="58" rx="4.5" ry="3.5" fill="#2b2b33"/>' +
               '<path d="M50 61 v4 M50 65 q-5 4 -9 0 M50 65 q5 4 9 0" stroke="#2b2b33" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
      case "wide":
        return '<ellipse cx="50" cy="66" rx="22" ry="12" fill="'+a.face+'"/>' +
               '<ellipse cx="50" cy="59" rx="5" ry="3.8" fill="#2b2b33"/>' +
               '<path d="M50 62 v4 M50 66 q-7 5 -12 0 M50 66 q7 5 12 0" stroke="#2b2b33" stroke-width="1.7" fill="none" stroke-linecap="round"/>';
      case "snout":
        return '<ellipse cx="50" cy="68" rx="20" ry="14" fill="'+a.face+'"/>' +
               '<ellipse cx="43" cy="66" rx="3" ry="4" fill="#2b2b33"/>' +
               '<ellipse cx="57" cy="66" rx="3" ry="4" fill="#2b2b33"/>' +
               '<path d="M42 76 q8 5 16 0" stroke="#2b2b33" stroke-width="1.7" fill="none" stroke-linecap="round"/>';
      case "beak":
        return '<path d="M32 62 q18 -6 36 0 q-18 16 -36 0 z" fill="#f0a244"/>' +
               '<path d="M34 64 q16 6 32 0" stroke="#d9852a" stroke-width="1.4" fill="none"/>';
      default:
        return '<path d="M42 66 q8 7 16 0" stroke="#2b2b33" stroke-width="2" fill="none" stroke-linecap="round"/>';
    }
  }

  function extraShape(kind, a) {
    switch (kind) {
      case "whiskers":
        return '<g stroke="'+a.dark+'" stroke-width="1.4" stroke-linecap="round" opacity=".85">' +
               '<line x1="30" y1="60" x2="14" y2="56"/><line x1="30" y1="64" x2="13" y2="64"/>' +
               '<line x1="30" y1="68" x2="14" y2="72"/>' +
               '<line x1="70" y1="60" x2="86" y2="56"/><line x1="70" y1="64" x2="87" y2="64"/>' +
               '<line x1="70" y1="68" x2="86" y2="72"/></g>';
      case "spots":
        /* kept clear of the eyes at (38,44) and (62,44) */
        return '<ellipse cx="31" cy="66" rx="9" ry="7" fill="'+a.dark+'" opacity=".7"/>' +
               '<ellipse cx="70" cy="30" rx="7.5" ry="6" fill="'+a.dark+'" opacity=".7"/>';
      case "wings":
        /* Low and swept back so they read as wings, not ears. */
        return '<ellipse cx="17" cy="76" rx="15" ry="8" fill="'+a.dark+'" opacity=".5" transform="rotate(-24 17 76)"/>' +
               '<ellipse cx="83" cy="76" rx="15" ry="8" fill="'+a.dark+'" opacity=".5" transform="rotate(24 83 76)"/>';
      case "fins":
        /* tail on one side, dorsal fin on top — reads as a fish in profile-ish */
        return '<polygon points="4,52 24,36 24,68" fill="'+a.dark+'" opacity=".85"/>' +
               '<polygon points="50,16 41,30 59,30" fill="'+a.dark+'" opacity=".7"/>' +
               '<polygon points="82,72 94,62 92,78" fill="'+a.dark+'" opacity=".6"/>';
      case "wool":
        var w = "";
        for (var i = 0; i < 9; i++) {
          var ang = (Math.PI * 2 * i) / 9 - Math.PI / 2;
          w += '<circle cx="'+(50 + Math.cos(ang)*33).toFixed(1)+'" cy="'+(52 + Math.sin(ang)*33).toFixed(1)+'" r="10" fill="'+a.body+'"/>';
        }
        return w;
      default: return "";
    }
  }

  function buildSVG(a) {
    var woolBehind = a.extra === "wool" ? extraShape("wool", a) : "";
    var headFill = a.extra === "wool" ? a.face : a.body;   /* sheep: dark face */
    return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      (a.extra === "wings" || a.extra === "fins" ? extraShape(a.extra, a) : "") +
      woolBehind +
      earShape(a.ears, a) +
      '<circle cx="50" cy="52" r="34" fill="'+headFill+'"/>' +
      (a.extra === "spots" ? extraShape("spots", a) : "") +
      muzzleShape(a.muzzle, a) +
      eyes(38, 62, 44, 7) +
      (a.extra === "whiskers" ? extraShape("whiskers", a) : "") +
      '</svg>';
  }

  /* --------------------------------------------------------------------- */
  function tap(a, el) {
    window.Sound.note(a.note, 0.9);
    window.Sound.say(a.name);
    if (navigator.vibrate) { try { navigator.vibrate(10); } catch(e){} }
    var inner = el.querySelector(".tile-inner");
    inner.classList.remove("bounce");
    void inner.offsetWidth;          /* force reflow so the animation restarts */
    inner.classList.add("bounce");
  }

  function start(host) {
    CFG = window.CONFIG;
    stage = host.stage;
    var grid = document.createElement("div");
    grid.className = "tile-grid";
    tiles = [];
    CFG.animals.forEach(function (a) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tile";
      btn.setAttribute("aria-label", a.name);
      btn.style.setProperty("--tile-bg", a.body);
      btn.innerHTML = '<span class="tile-inner">' + buildSVG(a) + '</span>' +
                      '<span class="tile-label">' + a.name + '</span>';
      btn.addEventListener("pointerdown", function (e) {
        e.preventDefault(); e.stopPropagation(); tap(a, btn);
      });
      btn.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(a, btn); }
      });
      grid.appendChild(btn);
      tiles.push(btn);
    });
    stage.appendChild(grid);
  }

  function stop() { stage.innerHTML = ""; tiles = []; }
  function resize() {}

  return { id:"animals", start:start, stop:stop, resize:resize, _buildSVG:buildSVG };
})();
