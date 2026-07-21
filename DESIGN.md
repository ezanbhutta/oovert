# OVERT, Design System

The brand idea is the word itself: *overt*, done or shown openly.
Everything on the page argues one thesis: **visibility is economics**.
The design proves the thesis by being what it sells, typography loud enough
to need no photography, restraint sharp enough to read as confidence.

## Voice & concept

- Copy platform: *camouflage vs. overtness*. Prey hides; brands shouldn't.
- Structure: six numbered chapters (Premise → Work → Practice → Evidence →
  Studio → Invitation), paced like a magazine feature, not a SaaS template.
- Nothing decorative. Every motion event marks either arrival (reveals),
  hierarchy (parallax depth), or affordance (magnetic, cursor).

## Color

| Token | Value | Role |
|---|---|---|
| `--paper` | `#F3F0E9` | Ground. Warm ivory, not white. |
| `--paper-dim` | `#E9E5DA` | Recessed surfaces (dictionary card, Halden field). |
| `--ink` | `#16140F` | Figure. Warm near-black, used as ground in dark chapters. |
| `--ink-soft` | `#55503F` | Secondary text on paper (≥ 7:1). |
| `--ink-invert-soft` | `#A9A294` | Secondary text on ink (≥ 6.5:1). |
| `--accent` | `#815EFA` | Brand violet. The signal. Large display + UI on light grounds. |
| `--accent-deep` | `#6039CE` | Violet for small text on light grounds (AA, 5.6:1+). |
| `--accent-invert` | `#9B7BFF` | Violet brightened for dark grounds (AA, 5.6:1+). |
| `--secondary` | `#C99A2C` | Warm gold. The violet's counterpoint (the Loam identity). |
| `--field-violet / ochre / char` | case fields | One color per case study, portfolio art direction. Fathom rides the brand violet at full bleed. |

Rule: one signal color per surface. Violet appears as punctuation
(chapter numbers, an underline, one italic word), never as decoration.
Because violet is bright, small text uses the AA-safe `--accent-deep` on
light and `--accent-invert` on dark; only large display type uses the pure
brand `--accent`.

## Typography

Two families, four voices:

- **Archivo Variable**, the workhorse. Width axis 62-125% is the identity trick:
  three of the four client wordmarks (Fathom condensed 62, Caldera expanded 125,
  Halden hairline weight-275) plus OVERT's own mark (wdth 116-118) all come from
  the one font file. Loam is the deliberate exception, set in the serif.
- **Instrument Serif**, the editorial voice. Reserved for the words doing
  persuasion (*prey*, *the opposite*, *out loud*, pull quotes) and for the one
  case identity, Loam, that wanted warmth over engineering.

Scale: fluid clamp() steps with editorial jumps (`--text-2xl` ≈ 11.5rem max,
next step down is less than half). Display leading 0.92-0.96, tracking −2.5%.
Labels: 12px caps, +18% tracking. Body measure ≤ 34em.

## Space & grid

- 8px rhythm (`--space-1..8`), fluid section spacing `clamp(6rem → 14rem)`.
- 12-column grid, offsets are deliberate: premise body starts col 7,
  practice descriptions col 8, quote cols 3-10. Asymmetry with a spine.
- Page margin `clamp(1.25rem → 4rem)`; hairlines (`--line`) do the framing.

## Motion

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Every entrance. |
| `--dur-fast` | 200ms | Hover, micro. |
| `--dur-med` | 450ms | Underlines, arrows. |
| `--dur-slow` | 900ms | Masked line reveals. |

- Text enters through overflow masks (`.line > .line__inner`), staggered 90ms.
- Wheel inertia (lerp 0.115) on fine pointers only; native scroll untouched
  for keyboard, touch, scrollbar.
- Case deck: `position: sticky` card-over-card, the one "wow" structure,
  built without JS.
- `prefers-reduced-motion: reduce` turns all of it off. No exceptions.

## Components

- **Header**: white + `mix-blend-mode: difference`, legible over every field
  without a background bar.
- **Chapter head**: hairline + number (accent) + small-caps label. Repeats as
  the page's pagination.
- **Dictionary card**: the concept set piece, bordered, recessed, serif.
- **Chapter rail**: fixed right, active state via IntersectionObserver.
- **Logo**: the OVERT mark (a stylised O built from two mirrored halves,
  set next to "VERT" in Gellix). Inlined as `currentColor` SVG so the
  difference-blend header and the paper-coloured footer both drive it from
  one file. The O-mark alone becomes the favicon.
