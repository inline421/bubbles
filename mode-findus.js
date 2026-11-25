/* ===========================================================================
   mode-findus.js - "Find Us!": Sabrina's search-and-find book.

   - An opening page introduces Mom, Dad, Sabrina and Indie, then seven
     picture pages where she finds them.
   - Pinch to zoom (1x-4x), one finger to pan while zoomed in.
   - Tapping a person says their name. Each name has a 4 second cooldown and
     there is a 1.2 second lock between any two names, so double and triple
     taps say the name once.
   - Next / back are HOLD buttons fixed to the bottom corners. They sit
     outside the zoomed picture, so they never move when she zooms. A quick
     tap does nothing; holding for 0.7s turns the page.
   - The top corners stay free for the app's own exit guard.
   =========================================================================== */
window.ModeFindUs = (function () {
  "use strict";

  var DIR = "findus/";
  var NAMES = { mom:"Mom", dad:"Dad", sabrina:"Sabrina", indie:"Indie" };

  /* boxes are in the 1254 x 1254 page image: [x0, y0, x1, y1] */
  var PAGES = [
    { img:"01_park", hot:{
        mom:[401,445,538,868], sabrina:[646,725,733,948], indie:[479,890,641,1058], dad:[923,410,1076,828] } },
    { img:"02_japan", hot:{
        mom:[140,330,290,742], dad:[552,220,678,565], indie:[248,845,640,1070], sabrina:[885,768,1030,1155] } },
    { img:"03_beach", hot:{
        mom:[114,420,265,848], sabrina:[470,730,569,953], indie:[629,905,810,1058], dad:[945,475,1094,898] } },
    { img:"04_grocery", hot:{
        mom:[367,450,572,888], sabrina:[576,820,664,1048], indie:[726,955,853,1138], dad:[953,765,1167,1223] } },
    { img:"05_pumpkin", hot:{
        mom:[224,493,442,996], sabrina:[415,695,554,945], indie:[773,555,926,713], dad:[902,330,1047,698] } },
    { img:"06_christmas", hot:{
        mom:[248,435,388,798], indie:[495,830,625,1018], sabrina:[856,970,934,1158], dad:[910,780,1089,1168] } },
    { img:"07_daycare", hot:{
        mom:[664,325,796,723], sabrina:[777,556,903,760], indie:[549,840,730,993], dad:[1097,418,1254,866] } }
  ];
  var SIZE = 1254;
  var COOLDOWN_MS = 4000, LOCK_MS = 1200, HOLD_MS = 700, MAX_ZOOM = 4;

  var host, view, wrap, img, hotLayer, bubble, nextBtn, prevBtn, dotsEl;
  var page = 0;                 /* 0 = intro, 1..n = picture pages */
  var scale = 1, tx = 0, ty = 0;
  var pointers = new Map(), pinch = null, pan = null, tapStart = null;
  var lastSaid = {}, lockUntil = 0, bubbleTimer = null;

  function pages() { return PAGES.filter(function (p) { return p.hot; }); }

  /* ---- speech --------------------------------------------------------- */
  function sayName(key) {
    var now = Date.now();
    if (now < lockUntil) return false;
    if (lastSaid[key] && now - lastSaid[key] < COOLDOWN_MS) return false;
    lastSaid[key] = now; lockUntil = now + LOCK_MS;
    try { window.Sound.say(NAMES[key]); } catch (e) {}
    return true;
  }

  /* ---- layout --------------------------------------------------------- */
  function fit() {
    if (!view || !wrap) return;
    var W = view.clientWidth, H = view.clientHeight;
    var s = Math.min(W, H);
    wrap.style.width = s + "px"; wrap.style.height = s + "px";
    wrap.style.left = ((W - s) / 2) + "px"; wrap.style.top = ((H - s) / 2) + "px";
    constrain(); apply();
  }
  function apply() {
    if (wrap) wrap.style.transform = "translate3d(" + tx + "px," + ty + "px,0) scale(" + scale + ")";
  }
  function constrain() {
    if (!wrap || !view) return;
    if (scale <= 1.001) { scale = 1; tx = 0; ty = 0; return; }
    var s = wrap.offsetWidth, W = view.clientWidth, H = view.clientHeight;
    /* picture is centred; it may pan until its edge reaches the screen edge */
    var mx = Math.max(0, (s * scale - W) / 2), my = Math.max(0, (s * scale - H) / 2);
    tx = Math.min(mx, Math.max(-mx, tx));
    ty = Math.min(my, Math.max(-my, ty));
  }
  function resetZoom() { scale = 1; tx = 0; ty = 0; apply(); }

  /* ---- pages ---------------------------------------------------------- */
  function render() {
    var list = pages();
    resetZoom();
    hideBubble();
    lastSaid = {}; lockUntil = 0;
    hotLayer.innerHTML = "";
    if (page === 0) {
      view.classList.add("fu-intro-on");
      img.removeAttribute("src"); img.hidden = true;
      hotLayer.innerHTML = introHTML();
    } else {
      view.classList.remove("fu-intro-on");
      var p = list[page - 1];
      img.hidden = false;
      img.src = DIR + p.img + ".webp" + (window.CONFIG.assetVersion || "");
      img.alt = "Find us page " + page;
      Object.keys(p.hot).forEach(function (k) {
        var b = p.hot[k], d = document.createElement("div");
        d.className = "fu-hot"; d.setAttribute("data-who", k);
        d.style.left = (b[0] / SIZE * 100) + "%"; d.style.top = (b[1] / SIZE * 100) + "%";
        d.style.width = ((b[2] - b[0]) / SIZE * 100) + "%"; d.style.height = ((b[3] - b[1]) / SIZE * 100) + "%";
        hotLayer.appendChild(d);
      });
      /* warm the next picture so the page turn is instant */
      var nx = list[page % list.length];
      if (nx) { var pre = new Image(); pre.src = DIR + nx.img + ".webp" + (window.CONFIG.assetVersion || ""); }
    }
    renderDots();
  }
  function introHTML() {
    var who = [["mom","Mom","intro_mom"],["dad","Dad","intro_dad"],["sabrina","Sabrina","intro_sabrina"],["indie","Indie","intro_indie"]];
    return '<div class="fu-intro">' +
      '<h2 class="fu-title">Meet the Scumaci family!</h2>' +
      '<div class="fu-cast">' + who.map(function (w) {
        return '<div class="fu-person fu-hot" data-who="' + w[0] + '">' +
               '<img src="' + DIR + w[2] + '.webp' + (window.CONFIG.assetVersion || "") + '" alt="' + w[1] + '" draggable="false">' +
               '<span>' + w[1] + '</span></div>';
      }).join("") + '</div>' +
      '<p class="fu-sub">We are hiding on the next pages.<br>Can you find us?</p></div>';
  }
  function renderDots() {
    var n = pages().length, h = "";
    for (var i = 0; i <= n; i++) h += '<span class="fu-dot' + (i === page ? " on" : "") + '"></span>';
    dotsEl.innerHTML = h;
  }
  function go(d) {
    var n = pages().length;
    page = (page + d + n + 1) % (n + 1);
    render();
    try { window.Sound.chime(); } catch (e) {}
  }

  /* ---- name bubble ---------------------------------------------------- */
  function showBubble(el, key) {
    hideBubble();
    el.classList.add("fu-found");
    var r = el.getBoundingClientRect(), vr = view.getBoundingClientRect();
    bubble.textContent = NAMES[key];
    bubble.style.left = (r.left - vr.left + r.width / 2) + "px";
    bubble.style.top = Math.max(70, r.top - vr.top - 12) + "px";
    bubble.hidden = false;
    bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
    bubbleTimer = setTimeout(function () { hideBubble(); }, 1800);
  }
  function hideBubble() {
    if (bubbleTimer) clearTimeout(bubbleTimer); bubbleTimer = null;
    if (bubble) bubble.hidden = true;
    if (hotLayer) [].forEach.call(hotLayer.querySelectorAll(".fu-found"), function (e) { e.classList.remove("fu-found"); });
  }

  function tapAt(x, y) {
    var els = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [document.elementFromPoint(x, y)];
    for (var i = 0; i < els.length; i++) {
      var h = els[i] && els[i].closest && els[i].closest(".fu-hot");
      if (h && view.contains(h)) {
        var key = h.getAttribute("data-who");
        if (sayName(key)) showBubble(h, key);
        return;
      }
    }
  }

  /* ---- gestures (pinch / pan / tap) ----------------------------------- */
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function onDown(e) {
    if (e.target.closest && e.target.closest(".fu-nav")) return;
    e.preventDefault();
    try { view.setPointerCapture(e.pointerId); } catch (er) {}
    pointers.set(e.pointerId, { x:e.clientX, y:e.clientY });
    var p = [...pointers.values()];
    if (p.length === 1) {
      tapStart = { x:e.clientX, y:e.clientY, t:Date.now() };
      pan = { x:e.clientX, y:e.clientY, tx:tx, ty:ty };
    } else if (p.length === 2) {
      tapStart = null; pan = null;
      var vr = view.getBoundingClientRect();
      var m = { x:(p[0].x + p[1].x) / 2 - vr.left - vr.width / 2, y:(p[0].y + p[1].y) / 2 - vr.top - vr.height / 2 };
      pinch = { d:dist(p[0], p[1]) || 1, s:scale, tx:tx, ty:ty, m:m };
    }
  }
  function onMove(e) {
    if (!pointers.has(e.pointerId)) return;
    e.preventDefault();
    pointers.set(e.pointerId, { x:e.clientX, y:e.clientY });
    var p = [...pointers.values()];
    if (p.length >= 2 && pinch) {
      var ns = Math.min(MAX_ZOOM, Math.max(1, pinch.s * dist(p[0], p[1]) / pinch.d));
      var vr = view.getBoundingClientRect();
      var m = { x:(p[0].x + p[1].x) / 2 - vr.left - vr.width / 2, y:(p[0].y + p[1].y) / 2 - vr.top - vr.height / 2 };
      /* keep the point under the fingers fixed while scaling */
      var k = ns / pinch.s;
      tx = m.x - (pinch.m.x - pinch.tx) * k;
      ty = m.y - (pinch.m.y - pinch.ty) * k;
      scale = ns; constrain(); apply();
    } else if (p.length === 1 && pan && scale > 1.01) {
      tx = pan.tx + (e.clientX - pan.x); ty = pan.ty + (e.clientY - pan.y);
      constrain(); apply();
    }
    if (tapStart && Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > 14) tapStart = null;
  }
  function onUp(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size === 0) {
      if (tapStart && Date.now() - tapStart.t < 600) tapAt(e.clientX, e.clientY);
      tapStart = null; pan = null; pinch = null;
    } else if (pointers.size === 1) {
      pinch = null;
      var q = [...pointers.values()][0];
      pan = { x:q.x, y:q.y, tx:tx, ty:ty };
    }
  }

  /* ---- hold-to-turn buttons ------------------------------------------- */
  function holdButton(el, dir) {
    var t0 = 0, raf = null, id = null;
    var ring = el.querySelector(".fu-ring-fg");
    var C = 2 * Math.PI * 44;
    function set(p) { ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C * (1 - p); }
    function tick() {
      var p = Math.min(1, (Date.now() - t0) / HOLD_MS);
      set(p);
      if (p >= 1) { end(); go(dir); return; }
      raf = requestAnimationFrame(tick);
    }
    function start(e) {
      e.preventDefault(); e.stopPropagation();
      if (raf) return;
      id = e.pointerId; t0 = Date.now(); el.classList.add("holding");
      try { el.setPointerCapture(e.pointerId); } catch (er) {}
      raf = requestAnimationFrame(tick);
    }
    function end() {
      if (raf) cancelAnimationFrame(raf); raf = null; id = null;
      el.classList.remove("holding"); set(0);
    }
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("lostpointercapture", end);
    el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    set(0);
  }
  function navHTML(cls, arrow) {
    return '<button type="button" class="fu-nav ' + cls + '" aria-label="' + (cls === "fu-next" ? "Hold for next page" : "Hold for previous page") + '">' +
      '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="fu-ring-bg" cx="50" cy="50" r="44"/>' +
      '<circle class="fu-ring-fg" cx="50" cy="50" r="44"/>' +
      '<path d="' + arrow + '" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
  }

  /* ---- lifecycle ------------------------------------------------------ */
  function start(h) {
    host = h;
    page = 0; lastSaid = {}; lockUntil = 0;
    view = document.createElement("div");
    view.className = "fu-view";
    view.innerHTML =
      '<div class="fu-wrap"><img class="fu-img" alt="" draggable="false"><div class="fu-hots"></div></div>' +
      '<div class="fu-bubble" hidden></div>' +
      navHTML("fu-prev", "M58 30 L38 50 L58 70") +
      navHTML("fu-next", "M42 30 L62 50 L42 70") +
      '<div class="fu-dots"></div>';
    host.stage.appendChild(view);
    wrap = view.querySelector(".fu-wrap"); img = view.querySelector(".fu-img");
    hotLayer = view.querySelector(".fu-hots"); bubble = view.querySelector(".fu-bubble");
    nextBtn = view.querySelector(".fu-next"); prevBtn = view.querySelector(".fu-prev");
    dotsEl = view.querySelector(".fu-dots");
    holdButton(nextBtn, 1); holdButton(prevBtn, -1);
    view.addEventListener("pointerdown", onDown, { passive:false });
    view.addEventListener("pointermove", onMove, { passive:false });
    view.addEventListener("pointerup", onUp);
    view.addEventListener("pointercancel", onUp);
    fit(); render();
    /* the intro greets her once */
    setTimeout(function () { try { window.Sound.say("Can you find us?"); } catch (e) {} }, 500);
  }
  function stop() {
    hideBubble();
    if (view && view.parentNode) view.parentNode.removeChild(view);
    view = wrap = img = hotLayer = bubble = nextBtn = prevBtn = dotsEl = null;
    pointers.clear(); pinch = pan = tapStart = null;
  }
  function resize() { fit(); }

  /* exposed for testing */
  return { id:"findus", start:start, stop:stop, resize:resize, _pages:PAGES,
           _go:go, _tap:tapAt, get _page(){ return page; } };
})();
