# Playtime

A self-contained play app for very young children (roughly 12–36 months).
Four modes behind a simple menu, an exit guard a toddler cannot trip by
accident, and a photo album that never leaves the device.

**No network requests. No accounts. No ads. No analytics. No third-party code.**

---

## The modes

| Mode | What she does |
|---|---|
| **Bubbles** | Pop floating bubbles, drag to finger-paint, every touch makes a sound |
| **Animals** | Tap a big animal, hear its name spoken |
| **Me** | Tap a nose, an ear, a hand — hear the word |
| **Photos** | Swipe and pinch through photos a parent added. View-only |

## Getting back to the menu

**Hold both top corners for 3 seconds.** A ring fills while you hold, and
releasing either corner cancels it. This needs two hands and deliberate
intent, so she will not do it by accident.

> **This does not replace Guided Access.** No web app — and no native app
> either — can block the iPad's swipe-up-to-home gesture. Guided Access is
> still what locks the iPad itself. The corner guard only keeps her inside
> whichever game you picked.

## Adding photos

Menu → **Add photos** → pick from the iPad.

Photos are downscaled and stored in the browser's local database **on that
iPad**. They are never uploaded, never sent anywhere, and never committed to
this repository. The repository is public; her photos are not in it and must
never be added to it.

---

## Run it locally

No build step. Plain HTML, CSS and JavaScript.

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## On the iPad

1. Open the HTTPS URL in **Safari** (only Safari can install a home-screen app)
2. Share → **Add to Home Screen**
3. Launch from the icon — full screen, no browser bar
4. Triple-click the top button → **Guided Access** → Start

---

## Layout

```
index.html            markup only
style.css             includes the LOCKDOWN block — read its comments
config.js             ALL content: colours, animals, body parts, scale, timings
audio.js              synthesised tones + spoken words
storage.js            the ONLY place that touches storage (prefs + photo DB)
app.js                menu, mode router, exit guard
mode-bubbles.js       \
mode-animals.js        |  each exposes { id, start(host), stop(), resize() }
mode-body.js           |
mode-photos.js        /
```

**Want to change something?** Almost everything worth tuning is in
`config.js` — colours, how many bubbles, drift speed, the musical scale, which
animals exist, where the body-part targets sit, how long the exit hold takes.
Adding an animal is adding one row; there is no drawing code to touch.

---

## Design rules (deliberate, not accidents)

1. **Every touch produces feedback.** A touch that does nothing reads as
   broken and she disengages.
2. **No fail state, no score, no timer, no end.**
3. **Inside a mode, nothing on screen navigates anywhere.**
4. **Targets are enormous** and kept clear of the screen edges where a palm
   rests. The smallest body-part target is over 70px.
5. **Multi-touch is expected.** Toddlers put whole hands on the glass.
6. **The scale is pentatonic**, so no combination of notes sounds wrong.

## Architecture decisions that protect the future

| Decision | Why |
|---|---|
| **No service worker** | They do not work inside Capacitor on iOS — registration throws, because Capacitor serves from a custom URL scheme. Offline logic built on one becomes dead weight. |
| **All audio synthesised** | Zero licensing exposure, zero bytes, nothing to prove ownership of. Real animal calls would need licensed recordings — see `ASSETS.md`. |
| **Everything tappable is a real `<button>`** | Apple's Accessibility Nutrition Labels are becoming mandatory. A bare `<canvas>` app can declare almost none of them. Canvas is decoration only, and `aria-hidden`. |
| **All storage behind `storage.js`** | Web uses localStorage/IndexedDB; Capacitor uses its own. Behind one module that swap is one file. |
| **Content is data in `config.js`** | Adding content should never mean editing logic. |
| **Relative paths only** | Capacitor serves from `capacitor://localhost`. Anything hardcoding a domain breaks there. |
| **Zero third-party code** | Apple's Kids rules effectively forbid third-party analytics and ads, and Apple scans the compiled binary — dead code counts. |

### One rule that bit us already

**CSS animations override inline styles.** JS positions bubbles with an inline
`transform`. Animating `transform` on the same element threw that positioning
away and pinned every respawned bubble to the top-left corner permanently.
Animations now run on `::before`. There is a regression test for it.

---

## Known limits (iOS reality, not bugs)

- **The hardware mute switch silences the app.** Deliberate — overriding it
  would also interrupt whatever the parent is listening to.
- **Orientation cannot be locked** in a web app; Safari does not implement it.
  Every mode works in both orientations.
- **The swipe-up-to-home gesture cannot be blocked.** Guided Access is the
  answer.
- **Spoken words depend on the system voice.** If speech is unavailable, every
  tap still plays its tone, so nothing feels broken.
- **Keeping the screen awake** needs iOS 18.4+ in a home-screen web app.

## Roadmap

- [ ] Test on a real iPad: mute switch, speech, wake lock, both orientations
- [ ] Real CC0 animal sounds to sit alongside the spoken names
- [ ] More body parts; a second character
- [ ] Capacitor 8 wrap (Node 22+, macOS, Xcode 26+) if this goes to the store
