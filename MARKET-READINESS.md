# Market readiness audit — Playtime

**Audited at:** version 3.23.0 · 1 October 2026
**Scope:** every file that ships (12 code files, 177 voice clips, 46 sound
effects, 63 images, 4 icons, 2 manifests), plus App Store Review Guidelines
and children's-privacy obligations.

**I am not a lawyer and this is not legal advice.** Where I could read a
licence I quote it. Where I could not, I say so rather than guess. The items
under "Blockers" are the ones I would not ship past.

---

## Verdict

**You cannot sell this today.** Four blockers, one of them hard.

The app's *engineering* posture is unusually clean — no third-party code, no
network dependencies, no tracking, nothing to leak. Every problem below is in
the **assets**, and all four trace to one root cause: `ASSETS.md` stopped being
maintained on 28 September, and ~285 third-party-derived files were added
after that date with no register entry. That file's own opening line is "nothing
ships in this app unless it has a row in this table." It stopped being true
three days later.

---

## Blockers

### 1. The voice is licensed for research only — HARD BLOCKER

All 177 spoken clips were generated with piper's `en_US-lessac-medium`. That
model was trained on the Lessac Blizzard 2013 corpus. Its licence, from
`cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html`,
restricts use to "Research Purposes" and expressly excludes

> "any commercial purpose, including the development, marketing,
> commercialisation, sale or licencing of voice synthesis or speech
> recognition products or services"

and excludes "developing, adapting, amending or otherwise using the Materials
for any commercial purpose." Licensor: Voice Factory International, Inc. and
Lessac Technologies, Inc.

**How exposed you are.** Whether a trained model's *output* is legally a
derivative of its training data is genuinely unsettled, and I will not tell you
it is decided. But two things are not unsettled: the licence text covers
"developing" and "adapting" the materials, and the licensor is itself a
speech-synthesis company — precisely the party with both standing and motive.
That is the wrong bet to carry into a paid App Store listing.

**Fix:** re-bake all 177 clips in a voice whose training corpus permits
commercial use. Six were checked at the dataset — not at the model, which is
where this went wrong the first time — and all six are clear:

| Voice | Accent | Corpus | Licence | Obligation |
|---|---|---|---|---|
| **Cori** (high) | British | LibriVox | public domain | none |
| Kathleen | American | rhasspy/dataset-voice-kathleen | CC0 | none |
| Kristin | American | LibriVox | public domain | none |
| LibriTTS-R sp. 12 / 33 | American | OpenSLR 141 | CC BY 4.0 | credit the dataset |
| Alba | Scottish | Edinburgh DataShare | CC BY 4.0 | credit the dataset |

Rejected during the same check, so nobody tries them later:
`en_US-hfc_female-medium` (HiFi-CAPTAIN, **CC BY-NC-SA** — non-commercial),
`en_GB-southern_english_female-low` (**CC BY-SA** — viral share-alike),
`en_GB-jenny_dioco-medium` (licence stated only as "see URL"; unresolved),
and `en_US-ljspeech-high` (public domain and perfectly usable, but rejected on
sound).

My recommendation is **Cori**: public domain, no attribution, the only *high*
quality model of the set, and at 190 Hz the closest to the voice already in the
app. All six are on the Voice Clearance page to hear.

*Residual uncertainty:* I verified each **dataset** licence from its model
card. I did not independently verify the licence on the trained weights; the
piper-voices repository is MIT overall, which I believe covers them, but if you
want certainty that is worth confirming.

### 2. The 46 sound effects have no licence record

Not "known bad" — **known unevidenced**, which for a commercial release is the
same problem.

When these were sourced I filtered for CC0 and public-domain only, and worked
from BigSoundBank, Wikimedia Commons, and Freesound narrowed to
`license:"Creative Commons 0"`. I also rejected one candidate at the time — an
archive.org "Lucasfilm Sound Effects Library" collection tagged Public Domain
Mark, which is a mislabelled commercial Sound Ideas library.

The commit messages from the day are contemporaneous and say so in writing —
"real recordings (CC0 / public domain)", "lion, monkey, snake, mouse, bat
recordings (CC0, freesound)", "dolphin, giraffe, rabbit, crab, fox, water
(CC0)" — and all 48 source files are still on your PC with their download
dates intact. That is better than recollection.

What does not exist is the per-file evidence: source URL, uploader, exact
licence name. The working notes were lost when the session
container was reclaimed, and I checked for recovery — the files carry no
useful metadata (three say `genre=Blues`, two name the converter software,
three have numeric titles, none names a source or a licence). The original
downloads are still on your PC under `Downloads\pt2` … `pt7` and
`Downloads\pt_sfx`, which pins down *when* each arrived but not *from where*.

**Fix, in order of preference:**

1. Re-source the set from one blanket-CC0 origin and write the register row as
   each file lands. Slower, but it ends with evidence instead of recollection.
2. Re-identify each of the 46 against the three source sites and record the
   URL and licence per file.

Option 1 is what I would do. A register assembled from memory is exactly the
kind of document that fails when someone actually asks.

### 3. The shark cue reproduces the *Jaws* motif

You asked for the "da-na, da-na" and I built it — synthesised from sine
partials, alternating E2/F2, accelerating. I did not sample the film, and at
the time I noted that it is not a recording of the Williams score.

That protects you from the **sound-recording** copyright and does nothing about
the **composition** copyright. Playing a recognisable melody on your own
instrument is still a reproduction of the underlying musical work. The
accelerating semitone ostinato is about as recognisable as a two-note figure
gets, and the rights are held by a studio with an active licensing operation.

**Fix:** replace `sfx/shark.mp3`. The shark can take the same water/bubble
treatment as the octopus, turtle and starfish, or an ominous low pulse that is
not that interval pattern. This one is cheap to fix and expensive to lose.

### 4. The images cannot be proved original — though they almost certainly are

I sourced and prepared these, so this is mine to answer. Here is what I can
establish and where it stops.

**What the evidence shows.** Every clipart and stock-art host is unreachable
from the sandbox I work in — openclipart, Kenney, Wikimedia, freesvg,
publicdomainvectors, Pixabay and svgrepo all refuse the connection, and did
then too. That is precisely why the *sound* effects had to be downloaded
through your own browser, and why all 48 of them are still sitting on your PC
under `Downloads\pt2` … `pt7` and `Downloads\pt_sfx`, dated. **There is no
corresponding folder of sticker downloads.** Nothing was downloaded, because
nothing could be.

The images as first committed carry no metadata at all — no EXIF, no XMP, no
ICC, no software tag — which is what you get from a file written out by a
script rather than exported by a drawing tool. And the same flat, uniform-
outline style is still in the repository **as hand-written SVG source**: the
trees, palms, pond, fence, seaweed, coral and road in `mode-scene.js` are the
same hand as the cow and the fire truck.

**What that adds up to.** The stickers were almost certainly drawn in the
sandbox as SVG and rasterised — which also explains the white halos that had to
be flood-filled off later, since that artefact comes from rasterising over
white. Original work, in other words, like the scenery that is still in the
source.

**Why I am still calling it a blocker.** "Almost certainly" is a reconstruction,
not a record. The working files were in the sandbox when it was reclaimed, so
the one thing that would settle it is gone, and I will not have you ship on my
recollection of something I cannot show you.

**Fix, and it is a clean one:** redraw the stickers as SVG committed to the
repository. Then the source *is* the evidence — anyone can open the file and
see the paths — and the register row becomes "original work, ours" with
something behind it. I would do one scene first, eight files, so you can
confirm the art still looks right to her before I do the other fifty-four.

`character.webp` is derived from your own photographs, so there is no
third-party rights question there either way.

---

## Clean — no action needed

These I verified directly against the shipping files.

| Area | Finding |
|---|---|
| Third-party code | **None.** No jQuery, React, lodash, Howler, Tone.js. Nothing bundled, nothing loaded. |
| External resources | **None.** No `@font-face`, no Google Fonts, no CDN, no absolute URLs in any CSS, JS or HTML file. |
| Fonts | System stack only (`-apple-system`, `BlinkMacSystemFont`). Nothing bundled, so nothing to license. |
| Analytics / ads / SDKs | None. Satisfies Guideline 1.3 and 5.1.4(a) outright rather than by exception. |
| Accounts, purchases, links out | None. No parental gate needed because there is nothing behind one. |
| Photos | Parent-selected through the OS picker, stored in IndexedDB on the device, never transmitted. The app never reads the photo library on its own. |
| Icons | Generated procedurally for this project. |
| Network | The only requests are same-origin fetches of your own `voice/` and `sfx/` files. Nothing third-party, nothing outbound with data. |
| Piper itself | GPL-3.0, used as a build tool. Running a GPL program does not place its output under the GPL. *(I believe this is correct and uncontroversial; flagging it so you know I considered it.)* |

---

## App Store items that are not blockers but will stop a submission

Quoted from the App Review Guidelines as they read today.

**Guideline 2.5.2** — "Apps should be self-contained in their bundles… nor may
they download, install, or execute code which introduces or changes features or
functionality of the app."

A thin wrapper that loads `index.html` and `app.js` from
`inline421.github.io` at runtime is downloading and executing code. **Bundle
every asset inside the app** and have the web view load from the bundle. Keep
GitHub Pages as the way she uses it today, not as the shipping mechanism.

**Guideline 4.2 / 4.2.3(i)** — the app must be more than a repackaged website
and must "work on its own." Bundling the assets settles 4.2.3(i). On 4.2 your
position is good — five game modes, an on-device photo album, a hold-both-
corners exit guard — but the app must not read as a web clipping, which again
means bundling rather than pointing at a URL.

**Guideline 5.1.4(b)** — an app that can handle "photos… from a minor" must
include a privacy policy. You have one; it needs two corrections below.

**`PRIVACY.md` corrections, both required before submission:**

1. The contact line still reads
   `[ADD A CONTACT EMAIL BEFORE PUBLISHING TO THE APP STORE]`.
2. "**Playtime makes no network requests of any kind**" is **no longer true**
   of the hosted build. It fetches `voice/manifest.json`, `sfx/manifest.json`
   and the audio files from its own origin. No data goes out and no third party
   is involved, but the absolute claim is wrong and a privacy policy is the
   wrong document to be wrong in. The file's own closing note anticipated this
   exact case. In a fully bundled iOS build the claim becomes true again.

Also needed at submission: a support URL, the privacy policy at a public URL
*and* reachable inside the app as static text (no link out, per 1.3), and a 4+
age rating.

---

## Not legal problems, but you should decide deliberately

- **Your daughter's name and likeness.** The letter S says "Sabrina," and
  `character.webp` is a cartoon derived from her photographs. Fine in a private
  app. In a public listing it is a permanent, searchable association between a
  named child and her appearance. A placeholder name in the shipped build and
  her name only in your own copy would cost nothing.
- **`ASSETS.md` is actively misleading** and should be fixed first, before any
  of the above. It currently asserts "Every asset in this app is currently
  original or generated. There is zero third-party licensing exposure." That
  sentence is false for roughly 285 of the files that ship, and anyone reading
  it — including you in six months — would be misled by it.

---

## The order I would do this in

1. **Pick a voice** from the Voice Clearance page, then I re-bake all 177
   clips. One command — synthesis is deterministic now.
2. **Replace the shark cue.** Half an hour, and it removes the only item here
   that is a straightforward infringement rather than a missing record.
3. **Redraw the stickers as SVG**, one scene first for your approval. This is
   mine to do and it is the only way the question gets a real answer.
4. **Re-source the 46 sound effects**, writing the register row as each file
   lands. Needs your PC's browser for the downloads, as before.
5. **Correct `PRIVACY.md`** — the contact email and the network claim.
6. **Only then** start on bundling for iOS.

Nothing on this list is hard. What made it a list is that the register stopped
being written, and three days of work went in behind it unlogged. Step 3 of the
"When adding a row" note in `ASSETS.md` now says to log in the same action that
fetches the file, which is the habit that would have prevented all of this.
