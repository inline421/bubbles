/* ===========================================================================
   mode-photos.js — view-only photo album.

   What she can do:  swipe between photos, pinch to zoom, drag to pan.
   What she cannot do:  delete, edit, share, favourite, or leave the app.
   There is no control on screen that does anything except change the picture.

   Gestures are implemented by hand rather than by re-enabling browser zoom,
   because browser zoom would let her scale the whole interface and strand
   herself in a corner of a zoomed page with no way back.

   Photos are read from IndexedDB on this device. Nothing is ever uploaded.
   =========================================================================== */
window.ModePhotos = (function () {
  "use strict";
  var stage, host, CFG;
  var photos = [], urls = [], index = 0;
  var imgEl, wrapEl, emptyEl, dotsEl;
  var scale = 1, tx = 0, ty = 0;
  var pointers = new Map();
  var startDist = 0, startScale = 1, startMid = null, startTx = 0, startTy = 0;
  var swipeStart = null;

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function applyTransform() {
    if (!imgEl) return;
    imgEl.style.transform = "translate3d(" + tx + "px," + ty + "px,0) scale(" + scale + ")";
  }

  function resetView() { scale = 1; tx = 0; ty = 0; applyTransform(); }

  function show(i) {
    if (!photos.length) return;
    index = (i + photos.length) % photos.length;
    imgEl.src = urls[index];
    imgEl.alt = "Photo " + (index + 1) + " of " + photos.length;
    resetView();
    renderDots();
    window.Sound.tick(window.CONFIG.scale[index % window.CONFIG.scale.length]);
  }

  function renderDots() {
    if (!dotsEl) return;
    if (photos.length < 2 || photos.length > 30) { dotsEl.innerHTML = ""; return; }
    var h = "";
    for (var i = 0; i < photos.length; i++) {
      h += '<span class="dot' + (i === index ? " on" : "") + '"></span>';
    }
    dotsEl.innerHTML = h;
  }

  /* ---- gestures -------------------------------------------------------- */
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function mid(a, b)  { return { x:(a.x + b.x)/2, y:(a.y + b.y)/2 }; }

  function onDown(e) {
    e.preventDefault();
    pointers.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (pointers.size === 1) {
      swipeStart = { x:e.clientX, y:e.clientY, t:Date.now(), tx:tx, ty:ty };
    } else if (pointers.size === 2) {
      var p = [...pointers.values()];
      startDist = dist(p[0], p[1]) || 1;
      startScale = scale;
      startMid = mid(p[0], p[1]);
      startTx = tx; startTy = ty;
      swipeStart = null;            /* two fingers is a zoom, never a swipe */
    }
  }

  function onMove(e) {
    if (!pointers.has(e.pointerId)) return;
    e.preventDefault();
    pointers.set(e.pointerId, { x:e.clientX, y:e.clientY });
    var p = [...pointers.values()];

    if (p.length >= 2) {
      var d = dist(p[0], p[1]) || 1;
      scale = clamp(startScale * (d / startDist), 1, window.CONFIG.photoMaxZoom);
      var m = mid(p[0], p[1]);
      tx = startTx + (m.x - startMid.x);
      ty = startTy + (m.y - startMid.y);
      constrain();
      applyTransform();
    } else if (p.length === 1 && scale > 1.02 && swipeStart) {
      /* one finger while zoomed in = pan */
      tx = swipeStart.tx + (p[0].x - swipeStart.x);
      ty = swipeStart.ty + (p[0].y - swipeStart.y);
      constrain();
      applyTransform();
    }
  }

  /* Keep the image from being dragged off screen entirely. */
  function constrain() {
    if (!wrapEl) return;
    var r = wrapEl.getBoundingClientRect();
    var maxX = Math.max(0, (r.width  * scale - r.width)  / 2);
    var maxY = Math.max(0, (r.height * scale - r.height) / 2);
    tx = clamp(tx, -maxX, maxX);
    ty = clamp(ty, -maxY, maxY);
  }

  function onUp(e) {
    var was = pointers.get(e.pointerId);
    pointers.delete(e.pointerId);

    /* A quick horizontal flick with one finger, not zoomed, changes photo. */
    if (pointers.size === 0 && swipeStart && was && scale <= 1.02) {
      var dx = was.x - swipeStart.x;
      var dy = was.y - swipeStart.y;
      var dt = Date.now() - swipeStart.t;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4 && dt < 900) {
        show(index + (dx < 0 ? 1 : -1));
      } else if (Math.abs(dx) < 14 && Math.abs(dy) < 14 && dt < 400) {
        show(index + 1);            /* a plain tap also advances */
      }
    }
    if (pointers.size < 2) { startMid = null; }
    if (pointers.size === 0) { swipeStart = null; if (scale <= 1.02) resetView(); }
  }

  /* ---- lifecycle ------------------------------------------------------- */
  function releaseUrls() { urls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch(e){} }); urls = []; }

  function start(h) {
    CFG = window.CONFIG;
    host = h; stage = h.stage;

    wrapEl = document.createElement("div");
    wrapEl.className = "photo-wrap";

    imgEl = document.createElement("img");
    imgEl.className = "photo-img";
    imgEl.decoding = "async";
    imgEl.draggable = false;

    emptyEl = document.createElement("div");
    emptyEl.className = "photo-empty";
    emptyEl.innerHTML = '<div class="photo-empty-icon"></div>' +
      '<p>No photos yet</p>' +
      '<p class="sub">Go back to the menu and tap <b>Add photos</b>.</p>';

    dotsEl = document.createElement("div");
    dotsEl.className = "photo-dots";

    wrapEl.appendChild(imgEl);
    stage.appendChild(wrapEl);
    stage.appendChild(emptyEl);
    stage.appendChild(dotsEl);

    wrapEl.addEventListener("pointerdown", onDown, { passive:false });
    wrapEl.addEventListener("pointermove", onMove, { passive:false });
    wrapEl.addEventListener("pointerup", onUp);
    wrapEl.addEventListener("pointercancel", onUp);

    window.Store.allPhotos().then(function (rows) {
      photos = rows || [];
      releaseUrls();
      urls = photos.map(function (r) { return URL.createObjectURL(r.blob); });
      if (!photos.length) {
        emptyEl.style.display = "flex";
        wrapEl.style.display = "none";
      } else {
        emptyEl.style.display = "none";
        wrapEl.style.display = "";   /* keep the stylesheet flex centring */
        show(0);
      }
    });
  }

  function stop() {
    if (wrapEl) {
      wrapEl.removeEventListener("pointerdown", onDown);
      wrapEl.removeEventListener("pointermove", onMove);
      wrapEl.removeEventListener("pointerup", onUp);
      wrapEl.removeEventListener("pointercancel", onUp);
    }
    releaseUrls();
    pointers.clear();
    photos = []; index = 0; scale = 1; tx = 0; ty = 0;
    stage.innerHTML = "";
    imgEl = wrapEl = emptyEl = dotsEl = null;
  }

  function resize() { constrain(); applyTransform(); }

  return { id:"photos", start:start, stop:stop, resize:resize };
})();
