# Product marks — Mantis and Observatory

Both products used to render the same `#aperture` glyph, so neither mark
distinguished anything. This replaces it with two purpose-built marks and
retires the red square standing in for Cohen in the nav.

## The family rule

Every mark is a form built around one filled point, and the form describes what
that product does to the thing at the point.

| Mark | Form | Relationship to the point |
| --- | --- | --- |
| Mantis | Two arms, open | Holds it without contact. Reads the package and lets go. |
| Observatory | A ring notched by a sight line | Measures it. The point is where the line meets the body. |
| Cohen | — | Not drawn yet. See "Open" below. |

## Construction

| Constraint | Value |
| --- | --- |
| Canvas | `viewBox="0 0 32 32"` for every symbol |
| Stroke | 2.4 units at full size, thickened in the small variants |
| Joins and caps | `miter`, `butt` — declared explicitly, never inherited |
| Edge inset | 2 units minimum |
| Filled shapes | Exactly one: the point |
| Colour | `currentColor` only |
| Forbidden | Gradient, corner radius, shadow, two stroke weights in one mark |

`stroke-linecap="butt"` is set on every stroked path and reasserted in
`styles.css`. Butt caps are load-bearing here, and an inherited
`stroke-linecap: round` from any icon library would silently round them.

## Size thresholds

| Rendered size | Symbol |
| --- | --- |
| 24px and up | `#mantis` / `#observatory` |
| Below 24px | `#mantis-sm` / `#observatory-sm` |

The small variants are separate symbols, not scaled copies. Never CSS-scale a
2.4-weight variant below 24px in place of one.

In use: 30px in `.plock`, 16px in the favicon.

## Two things that changed from the original handoff

**Observatory's point was a blister.** It was `r 2.4` sitting centred on a
`2.4` stroke, so it protruded only 1.2 units past the limb and fused with the
ring instead of reading as a separate element. Worst below 24px, where it
looked like a rendering artefact rather than a mark. The ring is now drawn as
an arc with a gap around the point, the point is `r 2.8`, and the sight line
terminates at the point instead of running past it — which is also a better
account of why the point sits where it does.

**The two marks were not optically matched.** The circle's bounding box was
24.3 units against the bracket form's 22.3 — 9% larger, where a circle wants
1–3% of overshoot, not nine. The circle is now `r 10.2`, giving 22.9 against
22.3, and `mantis-sm` was brought in to 23.9 to sit level with
`observatory-sm`. Measured ink coverage is 17.1% and 16.9%.

Observatory's point is still a computed position, not a placement: it is the
right-hand intersection of the sight line at `y 11` with the circle, which for
`r 10.2` puts it at `x 24.89`. The arc endpoints are computed from that angle.
Do not nudge any of them by hand — recompute.

## Colour

The marks carry no colour of their own. They are white ink on Cohen black and
they inherit, which is why every path uses `currentColor`.

**Neither mark is ever drawn in `--alarm`.** Red is a verdict on this site — a
severity, a review flag, a live sandbox. A product mark in the same red is
indistinguishable from a warning *about* that product.

That is also why the nav square is no longer red. It was `--alarm`, which made
it visually identical to the blip in `.ann`, `.hud` and `.status` that means
the sandbox is observing. It is now `--ash`, and square: the site's marks carry
no corner radius, and neither does this.

## Favicons

`mantis.html` and `observatory.html` carry their own mark at 16px, using the
small variants. Every other page carries a plain unradiused white square on
black — the same placeholder as the nav, not a Cohen mark.

## Open — not done here

**Cohen's own mark.** Three questions, in order:

1. Whether Cohen is drawn fresh or keeps something like the retired aperture.
   It should be drawn fresh, and it should not be circular. Concentric rings
   and a ring-notched-by-a-line both collapse to "circle" at 16px, and Cohen
   would sit beside Observatory constantly.
2. Whether the nav mark carries the wordmark or stands alone.
3. What replaces red as the brand's own colour, now that red is reserved for
   verdicts.

**Header artwork.** The handoff specified replacements for "the two product
page headers, currently darkened stock photographs with a grid masked over
them." Those headers do not exist in this repo — the product pages open
directly on the `.plock` lockup, and the only photograph is the post banner in
`blog.html`. Adding header compositions is a separate change, and the ones as
specified need work first: "The Many" sits entirely inside its frame, which
breaks the handoff's own rule that header geometry must exit on at least two
edges, and "The Gate" crops away the bracket returns, leaving two bare
verticals doing all the work.

**Changelog category cards.** There is no changelog page yet. When there is,
note that the cards as specified put the point about 8 units below the arc
rather than on it, their base sight line never meets the arc at all, the
BREAKING variant's two segments resolve to circle centres ~65 units apart so
the severed ends droop, and the card label ink is `#201e1d` — the print token —
on a black card, which is invisible.
