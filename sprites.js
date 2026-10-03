/* ===========================================================================
   sprites.js — every drawable object, as inline SVG. One registry, four
   themes. Adding an object is adding a function here plus a row in config.

   All art is original and drawn in code: no image files, no licensing.
   viewBox is 0 0 100 100 for every sprite.
   =========================================================================== */
window.Sprites = (function () {
  "use strict";

  function wrap(inner) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }

  /* Eyes with a real highlight — the single biggest difference between
     "emoji" and "illustrated". */
  function eye(cx, cy, r, tilt) {
    var t = tilt ? ' transform="rotate(' + tilt + ' ' + cx + ' ' + cy + ')"' : '';
    return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+r+'" ry="'+(r*1.12)+'" fill="#fffdf8"'+t+'/>' +
           '<ellipse cx="'+cx+'" cy="'+(cy+r*0.10)+'" rx="'+(r*0.56)+'" ry="'+(r*0.74)+'" fill="#2a2620"'+t+'/>' +
           '<circle cx="'+(cx-r*0.28)+'" cy="'+(cy-r*0.40)+'" r="'+(r*0.24)+'" fill="#ffffff"/>' +
           '<circle cx="'+(cx+r*0.26)+'" cy="'+(cy+r*0.34)+'" r="'+(r*0.11)+'" fill="#ffffff" opacity=".55"/>';
  }

  /* ---------------------------------------------------------- ANIMALS ---- */

  function cat() { return wrap(
    /* ears with inner pink, set into the skull line */
    '<path d="M20 46 L23 12 L47 28 Z" fill="#e8963f"/>' +
    '<path d="M80 46 L77 12 L53 28 Z" fill="#e8963f"/>' +
    '<path d="M26 42 L28 22 L41 31 Z" fill="#f4b8a8"/>' +
    '<path d="M74 42 L72 22 L59 31 Z" fill="#f4b8a8"/>' +
    /* head: wider than tall, with cheek tufts */
    '<path d="M50 24 C74 24 88 40 88 57 C88 76 71 88 50 88 C29 88 12 76 12 57 C12 40 26 24 50 24 Z" fill="#f0a44a"/>' +
    /* forehead stripes */
    '<path d="M44 30 q6 8 0 16 M56 30 q-6 8 0 16 M50 27 v14" stroke="#d1823049" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    /* cheek tufts */
    '<path d="M12 57 l-9 -6 l9 2 l-8 -9 l10 6 Z" fill="#e8963f"/>' +
    '<path d="M88 57 l9 -6 l-9 2 l8 -9 l-10 6 Z" fill="#e8963f"/>' +
    /* muzzle */
    '<ellipse cx="50" cy="68" rx="19" ry="13" fill="#ffe0bb"/>' +
    eye(37,52,8.5,-6) + eye(63,52,8.5,6) +
    /* nose + mouth */
    '<path d="M46 62 h8 l-4 5 Z" fill="#e0788a"/>' +
    '<path d="M50 67 v4 M50 71 q-6 5 -10 1 M50 71 q6 5 10 1" stroke="#7a5230" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    /* whiskers */
    '<g stroke="#8a6340" stroke-width="1.5" stroke-linecap="round" opacity=".8">' +
    '<path d="M31 65 L10 60 M31 69 L9 70 M31 73 L11 79"/>' +
    '<path d="M69 65 L90 60 M69 69 L91 70 M69 73 L89 79"/></g>'); }

  function dog() { return wrap(
    /* long floppy ears behind the head */
    '<path d="M22 34 C6 38 4 66 14 80 C22 90 32 84 31 70 Z" fill="#8a5a2e"/>' +
    '<path d="M78 34 C94 38 96 66 86 80 C78 90 68 84 69 70 Z" fill="#8a5a2e"/>' +
    /* head */
    '<path d="M50 20 C71 20 84 34 84 52 C84 72 69 86 50 86 C31 86 16 72 16 52 C16 34 29 20 50 20 Z" fill="#b8813f"/>' +
    /* brow patch */
    '<ellipse cx="50" cy="38" rx="26" ry="12" fill="#c99a5a" opacity=".55"/>' +
    /* long muzzle */
    '<ellipse cx="50" cy="70" rx="22" ry="15" fill="#e8c79b"/>' +
    eye(38,47,8,-4) + eye(62,47,8,4) +
    /* big nose */
    '<ellipse cx="50" cy="62" rx="8" ry="6" fill="#3a2b20"/>' +
    '<ellipse cx="47.5" cy="60" rx="2" ry="1.4" fill="#6b5545"/>' +
    '<path d="M50 68 v5 M50 73 q-8 6 -13 1 M50 73 q8 6 13 1" stroke="#6b4a2c" stroke-width="2.2" fill="none" stroke-linecap="round"/>'); }

  function cow() { return wrap(
    /* ears out to the sides */
    '<ellipse cx="14" cy="46" rx="13" ry="8" fill="#e9e9ec" transform="rotate(-18 14 46)"/>' +
    '<ellipse cx="86" cy="46" rx="13" ry="8" fill="#e9e9ec" transform="rotate(18 86 46)"/>' +
    /* horns */
    '<path d="M28 26 q-8 -10 -2 -15 q6 2 8 12 Z" fill="#e0d4b8"/>' +
    '<path d="M72 26 q8 -10 2 -15 q-6 2 -8 12 Z" fill="#e0d4b8"/>' +
    /* head */
    '<path d="M50 22 C72 22 84 36 84 54 C84 72 70 84 50 84 C30 84 16 72 16 54 C16 36 28 22 50 22 Z" fill="#f7f7f9"/>' +
    /* spots, placed clear of the eyes */
    '<ellipse cx="28" cy="34" rx="11" ry="9" fill="#4a4a52" opacity=".85" transform="rotate(-20 28 34)"/>' +
    '<ellipse cx="74" cy="62" rx="8" ry="7" fill="#4a4a52" opacity=".8"/>' +
    eye(38,47,8,0) + eye(62,47,8,0) +
    /* big soft muzzle */
    '<ellipse cx="50" cy="70" rx="23" ry="15" fill="#f4b6c4"/>' +
    '<ellipse cx="41" cy="67" rx="3.6" ry="4.6" fill="#c4798c"/>' +
    '<ellipse cx="59" cy="67" rx="3.6" ry="4.6" fill="#c4798c"/>' +
    '<path d="M40 79 q10 6 20 0" stroke="#c4798c" stroke-width="2.2" fill="none" stroke-linecap="round"/>'); }

  function duck() { return wrap(
    /* body hint behind */
    '<ellipse cx="50" cy="74" rx="34" ry="22" fill="#f2c73c"/>' +
    /* wing */
    '<path d="M20 72 q10 -12 26 -6 q-8 12 -26 6 Z" fill="#dba91f"/>' +
    /* head */
    '<circle cx="50" cy="40" r="26" fill="#ffd84a"/>' +
    /* bill */
    '<path d="M28 48 q22 -7 44 0 q-6 15 -22 15 q-16 0 -22 -15 Z" fill="#f08a2c"/>' +
    '<path d="M31 51 q19 5 38 0" stroke="#cf6d18" stroke-width="1.6" fill="none"/>' +
    eye(40,33,7,0) + eye(60,33,7,0)); }

  function frog() { return wrap(
    /* bulging eyes sit ON TOP of the head — the defining frog feature */
    '<circle cx="28" cy="30" r="17" fill="#7ed07a"/>' +
    '<circle cx="72" cy="30" r="17" fill="#7ed07a"/>' +
    /* wide flat head */
    '<path d="M50 34 C78 34 94 48 94 64 C94 80 74 90 50 90 C26 90 6 80 6 64 C6 48 22 34 50 34 Z" fill="#8cd985"/>' +
    /* belly */
    '<ellipse cx="50" cy="74" rx="28" ry="13" fill="#c6efb4"/>' +
    eye(28,29,11,0) + eye(72,29,11,0) +
    /* wide grin */
    '<path d="M22 64 q28 22 56 0" stroke="#3f7a3c" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
    '<circle cx="36" cy="57" r="2.2" fill="#3f7a3c"/>' +
    '<circle cx="64" cy="57" r="2.2" fill="#3f7a3c"/>'); }

  function bee() { return wrap(
    /* wings behind */
    '<ellipse cx="26" cy="38" rx="17" ry="11" fill="#dff1ff" opacity=".85" transform="rotate(-28 26 38)"/>' +
    '<ellipse cx="74" cy="38" rx="17" ry="11" fill="#dff1ff" opacity=".85" transform="rotate(28 74 38)"/>' +
    /* antennae */
    '<path d="M40 24 q-6 -12 -12 -15" stroke="#3a3126" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M60 24 q6 -12 12 -15" stroke="#3a3126" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="27" cy="8" r="4.5" fill="#3a3126"/><circle cx="73" cy="8" r="4.5" fill="#3a3126"/>' +
    /* striped body */
    '<ellipse cx="50" cy="58" rx="31" ry="34" fill="#ffcf3f"/>' +
    '<path d="M22 46 h56 M20 60 h60 M25 74 h50" stroke="#3a3126" stroke-width="9" stroke-linecap="round"/>' +
    /* face panel */
    '<ellipse cx="50" cy="38" rx="24" ry="16" fill="#ffdc6b"/>' +
    eye(41,38,7,0) + eye(59,38,7,0) +
    '<path d="M44 47 q6 5 12 0" stroke="#3a3126" stroke-width="2.2" fill="none" stroke-linecap="round"/>'); }

  function sheep() { return wrap(
    /* wool: overlapping puffs around the outside */
    (function(){ var w='',i,a; for(i=0;i<11;i++){ a=(Math.PI*2*i)/11-Math.PI/2;
      w+='<circle cx="'+(50+Math.cos(a)*32).toFixed(1)+'" cy="'+(54+Math.sin(a)*30).toFixed(1)+'" r="15" fill="#f4f3f0"/>'; }
      return w; })() +
    '<circle cx="50" cy="54" r="27" fill="#fbfaf8"/>' +
    /* floppy ears */
    '<ellipse cx="20" cy="50" rx="11" ry="6.5" fill="#3f3b38" transform="rotate(-24 20 50)"/>' +
    '<ellipse cx="80" cy="50" rx="11" ry="6.5" fill="#3f3b38" transform="rotate(24 80 50)"/>' +
    /* dark face */
    '<ellipse cx="50" cy="58" rx="20" ry="22" fill="#4a4540"/>' +
    eye(42,53,6.5,0) + eye(58,53,6.5,0) +
    '<ellipse cx="50" cy="68" rx="6" ry="4.2" fill="#2c2825"/>' +
    '<path d="M50 72 v3 M50 75 q-5 4 -8 1 M50 75 q5 4 8 1" stroke="#2c2825" stroke-width="1.8" fill="none" stroke-linecap="round"/>'); }

  function pig() { return wrap(
    /* triangular ears */
    '<path d="M22 36 L20 12 L44 26 Z" fill="#f2a8bd"/>' +
    '<path d="M78 36 L80 12 L56 26 Z" fill="#f2a8bd"/>' +
    '<path d="M27 33 L26 20 L38 28 Z" fill="#e0879f"/>' +
    '<path d="M73 33 L74 20 L62 28 Z" fill="#e0879f"/>' +
    '<path d="M50 24 C73 24 86 40 86 58 C86 76 70 88 50 88 C30 88 14 76 14 58 C14 40 27 24 50 24 Z" fill="#f7b9cb"/>' +
    eye(37,50,8,0) + eye(63,50,8,0) +
    /* the snout */
    '<ellipse cx="50" cy="68" rx="18" ry="14" fill="#ea90ab"/>' +
    '<ellipse cx="43.5" cy="67" rx="3.4" ry="5" fill="#c4677f"/>' +
    '<ellipse cx="56.5" cy="67" rx="3.4" ry="5" fill="#c4677f"/>'); }

  /* ------------------------------------------------------ SPORTS BALLS --- */

  function soccer() { return wrap(
    '<circle cx="50" cy="50" r="42" fill="#fbfbfb" stroke="#d4d4d8" stroke-width="2"/>' +
    '<path d="M50 28 L64 38 L59 55 L41 55 L36 38 Z" fill="#23242a"/>' +
    '<path d="M50 28 L36 38 L22 31 L33 16 Z" fill="#23242a" opacity=".92"/>' +
    '<path d="M50 28 L64 38 L78 31 L67 16 Z" fill="#23242a" opacity=".92"/>' +
    '<path d="M41 55 L36 72 L50 82 L64 72 L59 55 Z" fill="#23242a" opacity=".22"/>' +
    '<g stroke="#23242a" stroke-width="2.4" fill="none" opacity=".75">' +
    '<path d="M50 28 V9 M64 38 L82 32 M59 55 L72 70 M41 55 L28 70 M36 38 L18 32"/></g>' +
    '<circle cx="36" cy="34" r="11" fill="#ffffff" opacity=".18"/>'); }

  function basketball() { return wrap(
    '<circle cx="50" cy="50" r="42" fill="#e07a2c"/>' +
    '<g stroke="#2a1a10" stroke-width="3" fill="none">' +
    '<circle cx="50" cy="50" r="42"/>' +
    '<path d="M50 8 V92 M8 50 H92"/>' +
    '<path d="M18 20 q22 30 0 60" /><path d="M82 20 q-22 30 0 60"/></g>' +
    '<ellipse cx="36" cy="30" rx="13" ry="9" fill="#ffffff" opacity=".2" transform="rotate(-30 36 30)"/>'); }

  function baseball() { return wrap(
    '<circle cx="50" cy="50" r="42" fill="#fdfdfb" stroke="#d8d4cc" stroke-width="2"/>' +
    '<path d="M24 18 q14 32 0 64" stroke="#c8352e" stroke-width="2.6" fill="none"/>' +
    '<path d="M76 18 q-14 32 0 64" stroke="#c8352e" stroke-width="2.6" fill="none"/>' +
    '<g stroke="#c8352e" stroke-width="2.2" stroke-linecap="round">' +
    '<path d="M27 28 l-6 3 M26 40 l-7 2 M26 52 l-7 1 M27 64 l-6 3 M28 74 l-5 4"/>' +
    '<path d="M73 28 l6 3 M74 40 l7 2 M74 52 l7 1 M73 64 l6 3 M72 74 l5 4"/></g>' +
    '<circle cx="36" cy="32" r="11" fill="#ffffff" opacity=".35"/>'); }

  function tennis() { return wrap(
    '<circle cx="50" cy="50" r="42" fill="#d4e64a"/>' +
    '<path d="M14 26 q22 24 0 48" stroke="#fbfbf6" stroke-width="3.4" fill="none"/>' +
    '<path d="M86 26 q-22 24 0 48" stroke="#fbfbf6" stroke-width="3.4" fill="none"/>' +
    '<circle cx="50" cy="50" r="42" fill="none" stroke="#b6c93a" stroke-width="2"/>' +
    '<ellipse cx="37" cy="31" rx="12" ry="8" fill="#ffffff" opacity=".28" transform="rotate(-30 37 31)"/>'); }

  function football() { return wrap(
    '<ellipse cx="50" cy="50" rx="43" ry="28" fill="#7a4420"/>' +
    '<ellipse cx="50" cy="50" rx="43" ry="28" fill="none" stroke="#5c3116" stroke-width="2.5"/>' +
    '<path d="M16 50 h12 M72 50 h12" stroke="#fbfbf6" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M38 50 h24" stroke="#fbfbf6" stroke-width="3" stroke-linecap="round"/>' +
    '<g stroke="#fbfbf6" stroke-width="3" stroke-linecap="round">' +
    '<path d="M42 44 v12 M50 43 v14 M58 44 v12"/></g>' +
    '<ellipse cx="36" cy="38" rx="12" ry="6" fill="#ffffff" opacity=".14" transform="rotate(-18 36 38)"/>'); }

  function volleyball() { return wrap(
    '<circle cx="50" cy="50" r="42" fill="#fcfcfa" stroke="#d6d6d2" stroke-width="2"/>' +
    '<g stroke="#2f6fb8" stroke-width="3.2" fill="none">' +
    '<path d="M50 8 q-18 30 -6 84"/><path d="M8 50 q34 -14 60 -38"/>' +
    '<path d="M22 80 q18 -30 66 -22"/></g>' +
    '<circle cx="36" cy="32" r="11" fill="#ffffff" opacity=".35"/>'); }

  /* --------------------------------------------------------- HALLOWEEN --- */

  function pumpkin() { return wrap(
    '<path d="M50 20 q3 -10 12 -12 q-4 8 -8 12 Z" fill="#4a7a2c"/>' +
    '<rect x="46" y="14" width="8" height="14" rx="3" fill="#5c8a34"/>' +
    '<ellipse cx="50" cy="58" rx="40" ry="34" fill="#f07c1e"/>' +
    '<ellipse cx="28" cy="58" rx="15" ry="33" fill="#d8681a" opacity=".5"/>' +
    '<ellipse cx="72" cy="58" rx="15" ry="33" fill="#d8681a" opacity=".5"/>' +
    '<path d="M28 50 L42 50 L35 62 Z" fill="#3a2410"/>' +
    '<path d="M72 50 L58 50 L65 62 Z" fill="#3a2410"/>' +
    '<path d="M30 70 L38 66 L44 72 L50 66 L56 72 L62 66 L70 70 q-20 14 -40 0 Z" fill="#3a2410"/>'); }

  function ghost() { return wrap(
    '<path d="M50 12 C70 12 80 28 80 46 L80 84 L70 76 L60 84 L50 76 L40 84 L30 76 L20 84 L20 46 C20 28 30 12 50 12 Z" fill="#f2f4f8"/>' +
    '<ellipse cx="38" cy="44" rx="7" ry="9" fill="#2a2a34"/>' +
    '<ellipse cx="62" cy="44" rx="7" ry="9" fill="#2a2a34"/>' +
    '<circle cx="40" cy="41" r="2.4" fill="#ffffff"/><circle cx="64" cy="41" r="2.4" fill="#ffffff"/>' +
    '<ellipse cx="50" cy="62" rx="8" ry="10" fill="#2a2a34"/>' +
    '<circle cx="27" cy="56" r="5" fill="#f4b8c4" opacity=".55"/>' +
    '<circle cx="73" cy="56" r="5" fill="#f4b8c4" opacity=".55"/>'); }

  function bat() { return wrap(
    '<path d="M50 44 C36 22 18 20 6 32 q10 2 10 12 q-8 2 -6 12 q16 10 30 0 Z" fill="#3a2a4a"/>' +
    '<path d="M50 44 C64 22 82 20 94 32 q-10 2 -10 12 q8 2 6 12 q-16 10 -30 0 Z" fill="#3a2a4a"/>' +
    '<path d="M40 26 L44 12 L50 24 L56 12 L60 26 Z" fill="#2c1f38"/>' +
    '<ellipse cx="50" cy="48" rx="18" ry="20" fill="#4a3660"/>' +
    '<circle cx="43" cy="44" r="5.5" fill="#ffd84a"/><circle cx="57" cy="44" r="5.5" fill="#ffd84a"/>' +
    '<circle cx="43" cy="45" r="2.4" fill="#2a1a10"/><circle cx="57" cy="45" r="2.4" fill="#2a1a10"/>' +
    '<path d="M44 58 l3 5 l3 -5 l3 5 l3 -5" stroke="#ffffff" stroke-width="1.8" fill="none"/>'); }

  function spider() { return wrap(
    '<g stroke="#2a2434" stroke-width="4" fill="none" stroke-linecap="round">' +
    '<path d="M32 46 L10 30 M30 56 L6 52 M32 68 L10 78 M38 76 L26 92"/>' +
    '<path d="M68 46 L90 30 M70 56 L94 52 M68 68 L90 78 M62 76 L74 92"/></g>' +
    '<ellipse cx="50" cy="62" rx="24" ry="20" fill="#332b42"/>' +
    '<circle cx="50" cy="40" r="16" fill="#3f3450"/>' +
    '<circle cx="44" cy="37" r="5" fill="#ffffff"/><circle cx="56" cy="37" r="5" fill="#ffffff"/>' +
    '<circle cx="44.6" cy="38" r="2.4" fill="#2a1a10"/><circle cx="56.6" cy="38" r="2.4" fill="#2a1a10"/>' +
    '<circle cx="39" cy="46" r="2.6" fill="#ffffff" opacity=".8"/>' +
    '<circle cx="61" cy="46" r="2.6" fill="#ffffff" opacity=".8"/>'); }

  function candy() { return wrap(
    '<path d="M50 12 L74 88 L26 88 Z" fill="#fdfaf2"/>' +
    '<path d="M50 12 L61 46 L39 46 Z" fill="#ffd84a"/>' +
    '<path d="M39 46 L61 46 L68 68 L32 68 Z" fill="#f79024"/>' +
    '<path d="M32 68 L68 68 L74 88 L26 88 Z" fill="#fdfaf2"/>' +
    '<path d="M50 12 L74 88 L26 88 Z" fill="none" stroke="#e8d9b8" stroke-width="2"/>'); }

  function moon() { return wrap(
    '<path d="M62 12 A40 40 0 1 0 62 88 A32 32 0 1 1 62 12 Z" fill="#f7e9a8"/>' +
    '<circle cx="40" cy="34" r="6" fill="#e5d18a" opacity=".8"/>' +
    '<circle cx="30" cy="56" r="4.4" fill="#e5d18a" opacity=".8"/>' +
    '<circle cx="44" cy="68" r="5" fill="#e5d18a" opacity=".7"/>' +
    '<path d="M80 22 l2.6 6.4 l6.4 2.6 l-6.4 2.6 L80 40 l-2.6 -6.4 L71 31 l6.4 -2.6 Z" fill="#fff6cc"/>'); }

  /* ------------------------------------------------------ BODY (float) --- */

  function handSprite() { return wrap(
    '<path d="M32 56 v-22 a5 5 0 0 1 10 0 v18 M42 50 V26 a5 5 0 0 1 10 0 v24 M52 50 V28 a5 5 0 0 1 10 0 v22 M62 52 V36 a5 5 0 0 1 10 0 v22" stroke="#e0a97c" stroke-width="2" fill="#f2c9a0"/>' +
    '<path d="M32 50 q-10 -6 -14 2 q-2 6 6 12 l10 20 q6 10 18 10 h10 q14 0 14 -16 V48 h-10 v6 h-10 v-4 h-10 v4 h-10 Z" fill="#f2c9a0"/>' +
    '<path d="M46 74 q10 6 20 0" stroke="#dba87f" stroke-width="2" fill="none" stroke-linecap="round"/>'); }

  function footSprite() { return wrap(
    '<path d="M30 30 q22 -10 36 4 q10 10 8 28 q-2 20 -20 26 q-18 6 -28 -8 q-8 -12 -4 -30 Z" fill="#f2c9a0"/>' +
    '<circle cx="34" cy="26" r="7" fill="#f2c9a0"/><circle cx="46" cy="21" r="6" fill="#f2c9a0"/>' +
    '<circle cx="57" cy="20" r="5.4" fill="#f2c9a0"/><circle cx="67" cy="23" r="4.8" fill="#f2c9a0"/>' +
    '<circle cx="75" cy="29" r="4.2" fill="#f2c9a0"/>' +
    '<ellipse cx="50" cy="66" rx="18" ry="14" fill="#f7d9b8" opacity=".7"/>'); }

  function faceSprite() { return wrap(
    '<circle cx="50" cy="50" r="38" fill="#f2c9a0"/>' +
    '<path d="M14 42 a36 36 0 0 1 72 0 q-18 -12 -36 -7 q-18 -5 -36 7 Z" fill="#6b4a2f"/>' +
    eye(38,46,9,0) + eye(62,46,9,0) +
    '<ellipse cx="50" cy="60" rx="4.2" ry="3.2" fill="#dba87f"/>' +
    '<path d="M40 70 q10 9 20 0" stroke="#c4585f" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="28" cy="62" r="6" fill="#f2a0a8" opacity=".5"/>' +
    '<circle cx="72" cy="62" r="6" fill="#f2a0a8" opacity=".5"/>'); }

  /* A soap bubble: a nearly clear middle, a bright rim where the film turns
     away from you, and two highlights. The old one was a filled ball.

     Every gradient id is unique per bubble. They all used id="bg" before, so
     the whole screen referenced ONE definition - and when that bubble popped
     and left the DOM, every other bubble lost its fill and became just its
     stray highlight ellipse. That is the "they are ellipses now" bug. */
  var bubbleSeq = 0;
  function bubbleSprite(c1, c2) {
    var u = "b" + (++bubbleSeq);
    return wrap(
      '<defs>' +
        '<radialGradient id="film' + u + '" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%"   stop-color="' + c1 + '" stop-opacity=".06"/>' +
          '<stop offset="58%"  stop-color="' + c1 + '" stop-opacity=".20"/>' +
          '<stop offset="84%"  stop-color="' + c2 + '" stop-opacity=".62"/>' +
          '<stop offset="95%"  stop-color="#ffffff" stop-opacity=".95"/>' +
          '<stop offset="100%" stop-color="' + c2 + '" stop-opacity=".45"/>' +
        '</radialGradient>' +
        '<radialGradient id="sheen' + u + '" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%"   stop-color="#ffffff" stop-opacity=".9"/>' +
          '<stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<circle cx="50" cy="50" r="46" fill="url(#film' + u + ')"/>' +
      '<circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" stroke-opacity=".5" stroke-width="1.5"/>' +
      '<circle cx="50" cy="50" r="42" fill="none" stroke="' + c1 + '" stroke-opacity=".35" stroke-width="2.4"/>' +
      '<ellipse cx="35" cy="29" rx="16" ry="11" fill="url(#sheen' + u + ')" transform="rotate(-28 35 29)"/>' +
      '<circle cx="67" cy="70" r="4.5" fill="#ffffff" opacity=".4"/>');
  }

  var REG = {
    cat:cat, dog:dog, cow:cow, duck:duck, frog:frog, bee:bee, sheep:sheep, pig:pig,
    soccer:soccer, basketball:basketball, baseball:baseball, tennis:tennis,
    football:football, volleyball:volleyball,
    pumpkin:pumpkin, ghost:ghost, bat:bat, spider:spider, candy:candy, moon:moon,
    hand:handSprite, foot:footSprite, face:faceSprite
  };

  function draw(id, opts) {
    if (id === "bubble") return bubbleSprite(opts.c1, opts.c2);
    var f = REG[id];
    return f ? f() : "";
  }

  return { draw:draw, has:function(id){ return !!REG[id] || id==="bubble"; } };
})();
