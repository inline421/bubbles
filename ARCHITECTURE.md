# Playtime — how the app is put together

> **STOP — read before uploading config.js or index.html.** Twice on 11/25 (3.27.0 and
> 3.28.0 bumps) a stale copy was uploaded and silently deleted the Find Us! tile
> (`{ id:"findus" ... }` in CONFIG.modes and `<script src="mode-findus.js">`). Fetch
> main first, edit that copy, and `grep findus config.js index.html` before committing.


A single-page, offline touch toy for a toddler. No build step, no framework,
no network at runtime. Open `index.html` and it runs.

Live: https://inline421.github.io/bubbles/
Repo: https://github.com/inline421/bubbles (public, flat)

This file exists so a second person — or a second AI session — can add
something without reading every file first. If you change how any of this
works, change this file in the same commit.

---

## The shape of it

```
index.html      the only page. Loads every script with ?v=<assetVersion>.
config.js       ALL content, as data. window.CONFIG. Adding an object is
                adding a row; it should almost never need code.
app.js          menu, mode switching, canvas sizing, the exit guard.
audio.js        window.Sound. Baked mp3 clips + a synth for noises.
sprites.js      image loading and the drawn fallback figure.
storage.js      localStorage wrapper (custom photo, custom character).
mode-*.js       one file per kind of screen. Each exposes a global.

objects/<theme>/<f>.webp     float-mode stickers
scenes/<scene>/<f>.webp      scene-mode stickers
voice/<slug>.mp3             spoken words, + voice/manifest.json
sfx/<name>.mp3               real recordings, + sfx/manifest.json
art/<theme>/<name>.svg       the SOURCE for every sticker drawn in-house
character.webp               the bundled figure for the "Me" screen
```

## Adding a tile

1. Add a row to `CONFIG.modes` in `config.js`:
   `{ id:"ispy", title:"I Spy" }`
   Order in that array is the order on the menu.

2. Teach `modeFor(id)` in `app.js` which implementation to use. It is a
   plain if-chain around line 74 — add one line:
   `if (id === "ispy") return { impl: window.ModeISpy };`

3. Write `mode-ispy.js` exposing `window.ModeISpy`, an object with:

   ```js
   { id: "ispy",
     start: function (host, theme) { /* host = {stage, tctx, fctx, dims} */ },
     stop:  function () { /* tear down; called with no argument */ },
     resize: function () { } }
   ```

   `host.stage` is a DOM element you own — put your markup in it and clear
   it in `stop()`. `host.tctx` / `host.fctx` are 2D canvas contexts already
   sized for device pixel ratio; all drawing is in CSS pixels. `host.dims()`
   returns the current size.

4. Add `<script src="mode-ispy.js?v=..."></script>` to `index.html` BEFORE
   `app.js`, and bump the version on EVERY script tag — see below.

## The version string — read this before shipping

`config.js` carries `assetVersion: "?v=3.26.0"`, appended to every image and
audio URL at runtime. `index.html` hard-codes the SAME string on every
`<script src>`.

**Bump both together.** They are in different files and nothing enforces it.
A returning visitor whose browser cached `config.js` at the old version will
run old data against new assets — new tiles simply will not appear, and the
page will look fine while being wrong. This has already been shipped broken
once.

## Rules that are not obvious

- **The exit guard.** Both top corners held for 3 seconds returns to the
  menu (`guardHoldMs`, `guardCornerSize`). Nothing may be drawn or made
  tappable in the top corners — a toddler must not be able to leave by
  accident, and an adult must always be able to.

- **Tap policy.** `CONFIG.tapPolicy` is `"wait"`: a spoken NAME always
  finishes, and only the noise after it can be cut short by the next tap.
  She taps far faster than the app can talk, and without this the words
  chopped themselves into fragments. If you play audio, go through
  `window.Sound` — do not call `speechSynthesis` or create your own
  AudioContext, or you will defeat the guard.

- **Say words through the manifest.** `Sound.say("Cow")` looks "Cow" up in
  `voice/manifest.json` and plays the baked clip; it falls back to the
  device voice only if there is no clip. Baked clips sound the same on every
  device, the device voice does not. New words need baking, not a new
  code path — ask, do not ship a `speechSynthesis` call.

- **Offline.** No fonts, scripts, analytics or images from anywhere but this
  repo. PRIVACY.md says so and the App Store submission will rest on it.

- **Licensing.** Every asset must be something we can prove we may ship
  commercially. Anything drawn in-house keeps its SVG source in `art/`.
  Do not add an image or sound without recording where it came from —
  see MARKET-READINESS.md for what is still outstanding.

- **Sizing.** Stickers are cut out, transparent, and roughly 400-550px on
  the long edge. Scene coordinates in `config.js` are percentages of the
  scene box, so they hold at any screen size.

## Testing before you show anyone

There is a standing rule on this project: nothing gets shown until it has
been driven in a real browser. Load the page, dismiss the "Tap to start"
curtain (the menu is `display:none` until it lifts), click the actual tile,
and assert on something that proves you are on the right screen — which
files the browser fetched, not just that no error was thrown. A test that
checks the wrong screen for errors will pass and tell you nothing.

## Find Us! (added 3.27.0)

`mode-findus.js` / `window.ModeFindUs` — Sabrina's search-and-find book.
Intro page + 7 picture pages in `findus/*.webp` (1254x1254). Tap boxes are in
`PAGES` in that file, in page-image pixels; if a page image is rebuilt with
people moved, update its boxes. Names go through `Sound.say` and are baked
(`voice/fu-*.mp3`, piper `en_US-lessac-medium`, length_scale 1.1, 32 kHz 96k — same voice as the rest of the app; Jarred rejected kathleen-low on sound). Each name has a 4s
cooldown plus a 1.2s lock between names. Page turns are hold-to-turn buttons
in the bottom corners, outside the zoom layer so they never move; the top
corners stay free for the exit guard. Pinch zoom 1-4x, one-finger pan.

## Before you upload: start from the live copy (3.28.0)

The web upload replaces whole files. On 11/25 at 7:27 AM a 3.27.0 bump was uploaded
from an older copy of config.js and index.html, which silently removed the Find Us!
tile row and its <script> tag. Before uploading any shared file (config.js,
index.html, app.js, style.css, voice/manifest.json), fetch the current version from
main and edit that, then diff against main to make sure you only add your change.

## Two sessions, one repo — the rule that would have prevented all of this

Neither session can `git push`: Anthropic's proxy refuses this repo, so both
of us upload whole files through github.com/.../upload/main. **A whole-file
upload replaces what is on main with your local copy.** If your local copy
predates the other session's work, their work is gone and nothing warns you.

That is how the Find Us! tile was deleted three times — 3.27.0, 3.28.0 and
3.29.0 — all three by the seasonal-content session uploading a `config.js`
and `index.html` it had edited locally hours earlier. The third time also
rolled the version backwards from 3.31.0 to 3.29.0.

**Before you upload ANY file, fetch the current one from main and apply your
change to that copy.** Not to the copy in your working tree.

    curl -s https://raw.githubusercontent.com/inline421/bubbles/main/config.js -o config.js
    # now make your edit, then upload

**Then check you did not drop the other session's work:**

    grep -c findus config.js index.html app.js      # expect 1 1 3
    grep -o '?v=[0-9.]*' index.html | sort -u       # expect exactly ONE version
    grep assetVersion config.js                      # must match it

`lab/findustest.mjs` does all of that in a real browser and fails loudly.
Run it before every upload that touches config.js or index.html.

**The version number lives on main, not in your tree.** Read it off main and
go up by one. Never bump from your local copy — that is how 3.31.0 became
3.29.0.

**Shared files, highest risk first:** `config.js`, `index.html` (both
sessions edit these), `voice/manifest.json` (both add words), `app.js`,
`ARCHITECTURE.md`. Files under `objects/`, `scenes/`, `findus/`, `sfx/` and
the `mode-*.js` modules belong to one session each and are safe.

### Never reuse a version number the other session might have used

On 26 November both sessions independently bumped to **3.33.0** within
minutes of each other. GitHub Pages' CDN had already cached
`config.js?v=3.33.0` from the first commit, so the second one arrived at a
URL that was already in cache and the live app kept serving the older file —
while `raw.githubusercontent.com` showed the new one. The whole point of the
version string is to make the URL change, and it cannot do that if two
people pick the same number.

**Read the version off main immediately before you upload, not when you
start work**, and if it has moved since you began, go above whatever is
there now. If the live app disagrees with raw.githubusercontent for the same
file, this is why: bump again rather than waiting for the cache.
