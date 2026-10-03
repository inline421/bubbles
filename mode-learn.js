/* ===========================================================================
   mode-learn.js — two teaching modes that need no artwork at all.

     Letters : A-Z. Tap one and hear its name, its sound, and a word.
     Counting: 1-10. Tap one and hear the number, then the count out loud,
               while that many dots pop in one at a time.

   Both speak in a SINGLE utterance. iOS only lets speech begin inside a short
   window after a real input event, so a second speak() queued on a timer is
   dropped silently — the mistake that made the body parts mute. One utterance
   per tap, requested synchronously in the handler, is the whole rule.
   =========================================================================== */
window.ModeLearn = (function () {
  "use strict";

  /* Colours cycle so neighbouring tiles never match; a toddler tracks colour
     long before she tracks shape. */
  var HUES = ["#4f9fd8","#e0762c","#5cb46b","#b46bd0","#e05a7a","#3ec0c0",
              "#e0a83c","#7a7ae0","#d04f8f","#57a8e0"];

  function build(host, items, cls, onTap, render, hueOf) {
    var stage = host.stage;
    var wrap = document.createElement("div");
    wrap.className = "learn-wrap " + cls;
    var label = document.createElement("div");
    label.className = "body-label";
    label.setAttribute("aria-live","polite");

    items.forEach(function (it, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "learn-tile";
      b.style.setProperty("--hue", hueOf ? hueOf(it) : HUES[i % HUES.length]);
      b.setAttribute("aria-label", it.label);
      b.innerHTML = render(it);

      var fire = function (e) {
        e.stopPropagation();
        onTap(it, b, label);          /* speaks synchronously, inside the event */
      };
      /* No preventDefault: it suppresses the click iOS treats as a full user
         activation, which is the retry path for a dropped utterance. */
      b.addEventListener("pointerdown", fire);
      b.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        if (!window.Sound.spokeSince(it._at || 0)) window.Sound.say(it._said || it.label);
      });
      wrap.appendChild(b);
    });

    stage.appendChild(wrap);
    stage.appendChild(label);
    return { wrap: wrap, label: label };
  }

  function flash(el, label, text) {
    el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit");
    label.textContent = text;
    label.classList.remove("show"); void label.offsetWidth; label.classList.add("show");
  }

  /* ---------------- letters ---------------- */
  var Letters = {
    id: "letters",
    start: function (host) {
      var CFG = window.CONFIG;
      this._stage = host.stage;          /* stop() is called with no argument */
      this._ui = build(host, CFG.letters.map(function (x) {
        return { label: x.l, word: x.w, sound: x.s };
      }), "learn-letters", function (it, b, label) {
        it._at = Date.now();
        /* Three separate utterances, not one sentence: the letter, a beat,
           its sound, a beat, then the word. Said as one string, "C" and
           "kuh" blur into a single noise. */
        it._said = it.label + ". " + it.sound + ". " + it.word + ".";
        window.Sound.sayKey("letter-" + it.label.toLowerCase(),
                            [it.label + ".", it.sound + ".", it.word + "."]);
        flash(b, label, it.label + "  ·  " + it.word);
      }, function (it) {
        return '<span class="learn-glyph">' + it.label + '</span>' +
               '<span class="learn-sub">' + it.word + '</span>';
      });
    },
    stop: function () { if (this._stage) this._stage.innerHTML = ""; this._ui = null; },
    resize: function () {}
  };

  /* ---------------- counting ---------------- */
  var Counting = {
    id: "counting",
    start: function (host) {
      var CFG = window.CONFIG, items = [];
      this._stage = host.stage;          /* stop() is called with no argument */
      for (var n = 1; n <= (CFG.countTo || 10); n++) items.push({ label: String(n), n: n });
      this._ui = build(host, items, "learn-count", function (it, b, label) {
        it._at = Date.now();
        /* Just the number. Counting the whole way up every time was long
           enough that she had moved on before it finished; the dots still
           arrive one at a time, which is where the counting lives now. */
        it._said = CFG.numberWords[it.n - 1];
        window.Sound.sayKey("count-" + it.n, [it._said + "."]);
        flash(b, label, it.label);
        /* the dots arrive one at a time, roughly in step with the counting */
        var dots = b.querySelectorAll(".count-dot");
        for (var i = 0; i < dots.length; i++) {
          dots[i].classList.remove("pop"); void dots[i].offsetWidth;
          (function (d, i) { setTimeout(function () { d.classList.add("pop"); }, 220 + i * 260); })(dots[i], i);
        }
      }, function (it) {
        var dots = "";
        for (var i = 0; i < it.n; i++) dots += '<i class="count-dot"></i>';
        return '<span class="learn-glyph">' + it.label + '</span>' +
               '<span class="count-dots">' + dots + '</span>';
      });
    },
    stop: function () { if (this._stage) this._stage.innerHTML = ""; this._ui = null; },
    resize: function () {}
  };

  /* ---------------- shapes ---------------- */
  /* Drawn as paths rather than emoji so they scale cleanly and look the same
     on every device. Each sits in a 0-100 box. */
  var SHAPE = {
    "Circle":    '<circle cx="50" cy="50" r="42"/>',
    "Square":    '<rect x="10" y="10" width="80" height="80" rx="8"/>',
    "Rectangle": '<rect x="6" y="24" width="88" height="52" rx="7"/>',
    "Triangle":  '<path d="M50 8 L92 88 H8 Z" stroke-linejoin="round" stroke-width="8" stroke="currentColor"/>',
    "Star":      '<path d="M50 6 L61 38 H95 L67 58 L78 91 L50 71 L22 91 L33 58 L5 38 H39 Z" stroke-linejoin="round" stroke-width="7" stroke="currentColor"/>',
    "Heart":     '<path d="M50 88 C18 66 8 47 8 34 A21 21 0 0 1 50 26 A21 21 0 0 1 92 34 C92 47 82 66 50 88 Z"/>',
    "Diamond":   '<path d="M50 6 L92 50 L50 94 L8 50 Z" stroke-linejoin="round" stroke-width="8" stroke="currentColor"/>',
    "Oval":      '<ellipse cx="50" cy="50" rx="44" ry="31"/>'
  };

  var Colours = {
    id: "colours",
    start: function (host) {
      var CFG = window.CONFIG;
      this._stage = host.stage;
      this._ui = build(host, CFG.colours.map(function (x) {
        return { label: x.n, hex: x.c };
      }), "learn-colours", function (it, b, label) {
        it._at = Date.now();
        it._said = it.label;
        window.Sound.say(it.label);
        flash(b, label, it.label);
      }, function (it) {
        return '<span class="swatch-name">' + it.label + '</span>';
      }, function (it) { return it.hex; });
    },
    stop: function () { if (this._stage) this._stage.innerHTML = ""; this._ui = null; },
    resize: function () {}
  };

  var Shapes = {
    id: "shapes",
    start: function (host) {
      var CFG = window.CONFIG;
      this._stage = host.stage;
      this._ui = build(host, CFG.shapes.map(function (x) { return { label: x.n }; }),
        "learn-shapes", function (it, b, label) {
          it._at = Date.now();
          it._said = it.label;
          window.Sound.say(it.label);
          flash(b, label, it.label);
        }, function (it) {
          return '<svg class="shape-art" viewBox="0 0 100 100" aria-hidden="true" fill="#fff">' +
                 (SHAPE[it.label] || SHAPE.Circle) + '</svg>' +
                 '<span class="learn-sub">' + it.label + '</span>';
        });
    },
    stop: function () { if (this._stage) this._stage.innerHTML = ""; this._ui = null; },
    resize: function () {}
  };

  return { letters: Letters, counting: Counting, colours: Colours, shapes: Shapes };
})();
