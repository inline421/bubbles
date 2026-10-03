/* ===========================================================================
   storage.js — the ONLY place this app touches persistent storage.

   Two stores:
     Prefs  — small settings, localStorage.
     Photos — image blobs, IndexedDB.

   *** PRIVACY — THE IMPORTANT PART ***
   Photos are read from the device's own file picker and written to IndexedDB
   ON THIS DEVICE. They are never uploaded, never sent over the network, never
   committed to the repository, and never leave the iPad. The app makes zero
   network requests of any kind. This matters especially because the GitHub
   repo hosting this app is public — a child's photos must never go near it.

   Everything is behind this one module so that swapping localStorage for
   @capacitor/preferences later is a change to this file alone.
   =========================================================================== */
window.Store = (function () {
  "use strict";

  /* ---------------- small preferences ---------------- */
  var PREFIX = "playtime.";
  var memory = {};
  var hasLocal = (function () {
    try { localStorage.setItem("__t","1"); localStorage.removeItem("__t"); return true; }
    catch (e) { return false; }   /* private mode / embedded webviews throw */
  })();

  function get(key, fallback) {
    try {
      if (hasLocal) {
        var raw = localStorage.getItem(PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      }
    } catch (e) {}
    return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : fallback;
  }
  function set(key, value) {
    memory[key] = value;
    try { if (hasLocal) localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) {}
  }

  /* Ask the browser not to evict our data. WebKit is far more likely to grant
     this to an app installed on the Home Screen than to a plain tab. Never
     assume it succeeded — if it is refused, photos can still be evicted and
     the parent simply re-adds them. */
  function requestPersistence() {
    try {
      if (navigator.storage && navigator.storage.persist) return navigator.storage.persist();
    } catch (e) {}
    return Promise.resolve(false);
  }

  /* ---------------- image store (IndexedDB) ----------------
     Two object stores in one database: the photo album, and the single
     custom character image. Both live ON THIS DEVICE ONLY — never uploaded,
     never sent over the network, never committed to the repository. That
     matters especially for the character, which is a likeness of the child. */
  var DB = "playtime-photos", STORE = "photos", CHAR = "character", VER = 2;
  var dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error("IndexedDB unavailable"));
      var req = indexedDB.open(DB, VER);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(CHAR)) {
          db.createObjectStore(CHAR, { keyPath: "id" });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbp;
  }

  function tx(mode, fn, which) {
    var name = which || STORE;
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var t = db.transaction(name, mode);
        var store = t.objectStore(name);
        var out = fn(store);
        t.oncomplete = function () { resolve(out && out.result !== undefined ? out.result : out); };
        t.onerror = function () { reject(t.error); };
        t.onabort = function () { reject(t.error); };
      });
    });
  }

  function addPhoto(blob) {
    var rec = { id: "p" + Date.now() + "-" + Math.random().toString(36).slice(2,8),
                blob: blob, added: Date.now() };
    return tx("readwrite", function (s) { s.put(rec); return rec.id; });
  }

  function allPhotos() {
    return tx("readonly", function (s) { return s.getAll(); })
      .then(function (rows) {
        rows = rows || [];
        rows.sort(function (a,b) { return a.added - b.added; });
        return rows;
      })
      .catch(function () { return []; });   /* never let a storage failure break play */
  }

  function countPhotos() {
    return tx("readonly", function (s) { return s.count(); }).catch(function(){ return 0; });
  }

  function clearPhotos() {
    return tx("readwrite", function (s) { s.clear(); return true; }).catch(function(){ return false; });
  }

  /* Downscale before storing. A modern iPhone photo is ~4MB; at 1600px on the
     long edge it is a few hundred KB and still sharper than the iPad screen.
     This is what keeps a few hundred photos comfortably inside the quota. */
  function importFile(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) return reject(new Error("not an image"));
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var max = window.CONFIG.photoMaxEdge;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var w = Math.max(1, Math.round(img.width * scale));
          var h = Math.max(1, Math.round(img.height * scale));
          var c = document.createElement("canvas");
          c.width = w; c.height = h;
          c.getContext("2d").drawImage(img, 0, 0, w, h);
          c.toBlob(function (blob) {
            URL.revokeObjectURL(url);
            if (!blob) return reject(new Error("encode failed"));
            addPhoto(blob).then(resolve, reject);
          }, "image/jpeg", window.CONFIG.photoQuality);
        } catch (e) { URL.revokeObjectURL(url); reject(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("decode failed")); };
      img.src = url;
    });
  }

  /* ---------------- custom character ---------------- */

  /* Store the illustration the parent chose. Downscaled like the photos, for
     the same reason: a full-resolution export is megabytes and the screen
     cannot show the difference. */
  function setCharacter(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) return reject(new Error("not an image"));
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var max = window.CONFIG.characterMaxEdge;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var w = Math.max(1, Math.round(img.width * scale));
          var h = Math.max(1, Math.round(img.height * scale));
          var c = document.createElement("canvas");
          c.width = w; c.height = h;
          c.getContext("2d").drawImage(img, 0, 0, w, h);
          c.toBlob(function (blob) {
            URL.revokeObjectURL(url);
            if (!blob) return reject(new Error("encode failed"));
            tx("readwrite", function (st) {
              st.put({ id:"character", blob:blob, w:w, h:h, added:Date.now() });
              return true;
            }, CHAR).then(function(){ resolve({ w:w, h:h }); }, reject);
          }, "image/png");
        } catch (e) { URL.revokeObjectURL(url); reject(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("decode failed")); };
      img.src = url;
    });
  }

  function getCharacter() {
    return tx("readonly", function (st) { return st.get("character"); }, CHAR)
      .catch(function () { return null; });
  }

  function clearCharacter() {
    return tx("readwrite", function (st) { st.delete("character"); return true; }, CHAR)
      .catch(function () { return false; });
  }

  /* Calibration: where each body part sits on THAT image, as percentages.
     Kept in prefs rather than the image record so re-cropping the image does
     not silently invalidate it — it is small and easy to inspect. */
  function getCalibration() { return get("calibration", null); }
  function setCalibration(map) { set("calibration", map); }
  function clearCalibration() { set("calibration", null); }

  return {
    get:get, set:set, requestPersistence:requestPersistence,
    setCharacter:setCharacter, getCharacter:getCharacter, clearCharacter:clearCharacter,
    getCalibration:getCalibration, setCalibration:setCalibration, clearCalibration:clearCalibration,
    addPhoto:addPhoto, allPhotos:allPhotos, countPhotos:countPhotos,
    clearPhotos:clearPhotos, importFile:importFile
  };
})();
