# Asset licence register — Playtime

**Rule: nothing ships in this app unless it has a row in this table.**

This file is the difference between "we can sell this" and "we have to rebuild
it." Log every asset the day you add it, not later — sources vanish, uploaders
delete accounts, and licences get changed retroactively.

> **Status, 1 October 2026: this register is incomplete and the app is not
> clear for commercial release.** It was last accurate on 28 September, when
> every asset really was original or generated at runtime. Between then and
> version 3.23.0 the app gained 177 recorded voice clips, 46 recorded sound
> effects and 63 raster images, none of which were logged. The rows below mark
> what is settled and what is not. See `MARKET-READINESS.md` for the full
> audit and the order of work.

---

## Current inventory

| File | Type | Source | Licence | Commercial OK | Verified |
|------|------|--------|---------|---------------|----------|
| `voice/*.mp3` (177) | Audio | Synthesised with piper `en_US-lessac-medium` | Lessac Blizzard 2013 corpus — **research only**, commercial use expressly excluded | **NO** | 2026-10-01 |
| `sfx/*.mp3` (46) | Audio | BigSoundBank / Wikimedia Commons / Freesound, filtered to CC0 at download time. Commits of 30 Sept–1 Oct record "CC0 / public domain" and "CC0, freesound"; originals still on the author's PC under `Downloads\pt2`–`pt7`, `pt_sfx` with dates | **Unrecorded per file.** No source URL or uploader was logged; the files carry no useful metadata | **UNPROVEN** | — |
| `sfx/shark.mp3` | Audio | Synthesised by us — but reproduces the two-note *Jaws* motif | Our recording; the underlying **composition** is not ours | **NO** | 2026-10-01 |
| `objects/**/*.webp`, `scenes/**/*.webp` (62) | Image | **Unknown.** Raster originals with white backgrounds, cut out by us. All metadata stripped by the webp encode | Unknown | **UNKNOWN** | — |
| `character.webp` | Image | Drawn from the parent's own photographs of his child | No third-party rights in the photos either way | Yes | 2026-10-01 |
| `icon-*.png`, `apple-touch-icon.png` | Image | Generated procedurally for this project | Original work, ours | Yes | 2026-09-03 |
| _(scenery: trees, ponds, roads, clouds)_ | Image | Inline SVG in `mode-scene.js` | Original work, ours | Yes | 2026-09-28 |
| _(bubble sprites, menu art)_ | Image | Inline SVG in `sprites.js` / `app.js` | Original work, ours | Yes | 2026-09-28 |
| _(musical notes, pops, ticks)_ | Audio | Synthesised at runtime in `audio.js` | Original work, ours | Yes | 2026-09-28 |
| _(all typefaces)_ | Font | System font stack | N/A — not bundled | Yes | 2026-09-03 |
| _(no libraries)_ | Code | None bundled, none loaded | N/A | Yes | 2026-10-01 |
| _(user photos)_ | Image | Supplied by the parent, stored on-device only | Not ours, never distributed | N/A | 2026-09-28 |

### Cleared replacements, ready to use

Checked at the **dataset**, which is where the lessac mistake was made — the
model card tells you the corpus and its licence, and that is the thing to read
before baking anything.

| Voice | Corpus | Licence | Obligation |
|---|---|---|---|
| piper `en_GB-cori-high` | LibriVox | **public domain** | none |
| piper `en_US-kathleen-low` | rhasspy/dataset-voice-kathleen | **CC0** | none |
| piper `en_US-kristin-medium` | LibriVox | **public domain** | none |
| piper `en_US-ljspeech-high` | LJ Speech (Keith Ito) | **public domain** | none — rejected on sound, not licence |
| piper `en_US-libritts_r-medium` | OpenSLR 141 | **CC BY 4.0** | credit the dataset |
| piper `en_GB-alba-medium` | Edinburgh DataShare | **CC BY 4.0** | credit the dataset |

Weights ship from the MIT-licensed `rhasspy/piper-voices`; the weight licence
itself was not independently confirmed.

---

## Rejected candidates — recorded so nobody tries them again

| Candidate | Why rejected | Date |
|---|---|---|
| archive.org "Lucasfilm Sound Effects Library – LF01 Animal Sounds" | Tagged Public Domain Mark on archive.org, but it is a mislabelled commercial Sound Ideas library | 2026-09-30 |
| piper `en_US-hfc_female-medium` | HiFi-CAPTAIN corpus is **CC BY-NC-SA 4.0** — non-commercial | 2026-10-01 |
| piper `en_GB-southern_english_female-low` | **CC BY-SA 4.0** — viral share-alike, excluded by our own rule below | 2026-10-01 |
| piper `en_GB-jenny_dioco-medium` | Model card states the licence only as "See URL"; unresolved | 2026-10-01 |

---

## Before adding anything, check it against this list

### Safe sources (verified CC0 / commercial-OK)

- **kenney.nl** — game art and audio, CC0, commercial use explicitly fine,
  attribution optional. The single best source. Only restriction: don't use
  Kenney's own logo.
- **Freesound.org — filtered to CC0 only.** The filter is per-sound; a batch
  download can silently include a CC-BY-NC file. Check every single one, and
  **write down the sound's ID and uploader at the moment you download it** —
  that is exactly the step whose absence broke this register.
- **openclipart.org** — CC0.
- **Google Fonts under SIL OFL 1.1** — bundling in an app is explicitly
  permitted, and you may sell the app containing it. You must include the
  copyright statement and licence text. If you *modify* the font you must
  rename it (Reserved Font Names). Some Google Fonts are Apache 2.0 instead —
  check per family.

### Traps — these look free and are not

- **TTS voices trained on challenge or research corpora.** Piper, Coqui and
  friends make the model trivially easy to use and say nothing at the point of
  use about the corpus underneath. Read the model card's dataset licence
  **before** you bake 177 files with it. Blizzard Challenge datasets in
  particular are research-only.
- **Re-recording a melody yourself does not clear it.** You avoid the sound
  recording copyright and not the composition copyright. A recognisable tune is
  a reproduction however you played it.
- **Pixabay is NOT CC0.** Only content published before 2019-01-09 is. Newer
  content is under Pixabay's own licence, which forbids distributing content
  "on a standalone basis" and puts the burden of clearing rights on you.
- **BBC Sound Effects are NOT commercially usable.** All 33,000 of them are
  under the RemArc licence: personal and non-commercial only. Commercial use
  requires written permission and possibly a fee. This one catches everybody.
- **"Royalty-free" ≠ free.** It means no *per-use* royalty. It does not mean
  no licence fee and it does not mean no attribution.
- **CC-BY-SA and GPL assets are viral.** Avoid entirely in a commercial app.
- **AI-generated assets** — copyrightability is unsettled and some generators'
  terms restrict commercial use. Not a safe foundation for a paid app.
- **"Free font" aggregator sites** are full of ripped commercial fonts. Trace
  any font back to its original OFL/Apache/CC0 release or don't use it.
- **archive.org's "Public Domain Mark"** is applied by uploaders, not verified
  by archive.org. It is a claim, not a clearance.

### CC-BY is usable but has a catch here

Attribution is fine — put a credits screen in the app. But in an App Store
**Kids Category** app, a credits screen must not contain links out (that would
require a parental gate). Keep credits as static text with no clickable links.

---

## When adding a row

Record: **file path · what it is · exact source URL · exact licence name ·
uploader/author · date you downloaded it.** If the licence page is likely to
change, save a PDF of it into `docs/licences/` too.

Do this in the same action that downloads the file. The register in this
project failed not because anyone decided to skip it, but because logging was
left until "after the sounds work" — and the notes lived in a sandbox that was
wiped before that happened.
