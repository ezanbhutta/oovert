# OVERT®

**Camouflage is for prey.**

Marketing site for OVERT, a brand strategy & identity studio.
A single-page editorial experience — hand-built, zero dependencies, zero build step.

## Stack

- Semantic HTML, one page, one story.
- Modular CSS on a token-driven design system (`css/foundation.css` → `components.css` → `sections.css`).
- Vanilla ES modules for motion (`js/main.js` + `js/modules/*`), all progressive enhancement:
  the page is fully readable and navigable with JavaScript disabled.
- Two self-hosted typefaces (133 KB total): Archivo Variable (wght 100–900 × wdth 62–125%)
  and Instrument Serif. Three of the four case-study "identities" (Fathom, Caldera,
  Halden) are cut from the single Archivo variable file — condensed, expanded, and
  hairline; Loam is deliberately set in the serif.

## Run it

Any static file server from the repo root:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

No install, no build.

## Accessibility & performance

- Fully keyboard-navigable: skip link, focus-visible rings, focus-managed menu overlay.
- `prefers-reduced-motion` disables every animation, the wheel inertia, the parallax,
  the counters, and the custom cursor. Content never depends on motion.
- All copy is server-rendered in the markup; stat counters ship with their final values.
- No external requests of any kind: fonts, styles, and scripts are all first-party.
- Contrast: every text/background pair meets WCAG AA (checked per surface,
  including the four case-study color fields and dark chapters).

See [DESIGN.md](DESIGN.md) for the design system.
