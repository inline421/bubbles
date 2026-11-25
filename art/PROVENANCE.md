# Where the seasonal art came from

**The 17 Thanksgiving and Christmas stickers** in `objects/thanksgiving/` and
`objects/christmas/` were generated on 25 November 2026 with **Google Gemini**,
from a written description of the style. No existing image was used as a
reference or input.

That last point is deliberate. The app's other 62 stickers have no traceable
source — a reverse image search on them returns "no exact matches found" —
so feeding one in as a style reference would have made the new work a
derivative of art whose licence cannot be established, which is the exact
problem this was meant to solve.

The prompt, in substance, for every one of them:

> Flat vector cartoon sticker, kawaii children's-picture-book style, for a
> toddler app. Thick uniform near-black outline as the outermost edge; no
> white die-cut border. Flat colour fills only, no gradients: one darker
> tone for shading, one pale tone on front surfaces. Chunky rounded
> proportions, nothing thin or spindly. Centred, filling the frame.
> Pure flat white background, no shadow, no text, no border.

Turkey, Santa and the snowman additionally: large plain oval black eyes, a
small curved smile, soft round pink cheeks. Everything else is an object and
was explicitly given no face.

Post-processing, all in `art2/` and `gen/` in the working tree:
background removed by flooding in from the frame edges and stopping at the
dark outline (so enclosed whites such as Santa's beard survive), enclosed
flat-white regions such as the gaps between the sleigh bells cleared by a
brightness-and-flatness test, edge colour bled outward to stop a white
fringe, then trimmed and written as webp.

## Still to confirm before release

**I have not verified Google's current terms for commercial use of Gemini
image output, and I am not able to give a legal opinion on it.** The
position needs checking against Google's published terms as they stand at
submission, and ideally by someone qualified. Treat this file as a record of
how the images were made, not as a clearance.

## The hand-drawn SVG set in this folder is SUPERSEDED

`art/christmas/`, `art/thanksgiving/`, `_style.txt` and `_style.py` are an
earlier attempt: the seasonal stickers drawn by hand in SVG. **Nothing in
the app is rendered from them any more.** They were not good enough next to
the rest of the set and were replaced by the generated images described
above.

They are still here only because the GitHub web upload flow this repo has to
use cannot delete files. Do not treat them as the source of the shipped
webp. If you get push access working, delete them.
