# OOVERT Craft Pass — synthesis (working doc)

Each item: [source principle] → concrete change. Verified against current code.

## From Agent: IMAGE PRESENTATION (report 1/8) ✅

### I1. Image reveal system (Exo Ape / Codrops pattern)
- Below-fold plates ONLY (never LCP hero): clip-path wipe bottom-up `inset(0 0 100% 0)` → `inset(0)`,
  1.0s cubic-bezier(0.16,1,0.3,1) + inner img scale 1.06→1.0 over 1.4s cubic-bezier(0.22,1,0.36,1).
- Grid siblings stagger 90–120ms via inline transition-delay.
- prefers-reduced-motion: none.

### I2. Grain overlay (CSS-Tricks recipe + Hermès principle: imperfection = human)
- SVG feTurbulence data-URI tile 240px, baseFrequency 0.72, numOctaves 3, stitchTiles stitch.
- opacity 0.045 (0.03–0.06 range), mix-blend overlay (soft-light on dark).
- Apply: work-feature scrim area, manifesto flat gradient, NOWA duotone sections. NOT on UI screenshots.
- STATIC only — never animate.

### I3. Hover asymmetry on plates (in ≠ out)
- img base scale(1.001) guard; hover scale(1.04); transition out 0.45s cubic-bezier(0.33,1,0.68,1), in 0.7s.
- ONE secondary cue only (underline slide OR arrow nudge, not both + filters).
- Feature hero: scale 1.02 @ 1.2s slow drift.

### I4. Caption voice (Pentagram/Locomotive)
- figure>figcaption, two-part: tabular-num index in accent + sentence-case editorial line.
- Caption aligns to image left edge, not page margin.

### I5. Ratio discipline (COLLINS/MoMA)
- One ratio per index (16/10 plates). Artifact class (UI/logos): contain, never cropped, on paper-dim.
- Cadence: contained → contained → full-bleed.

---
## From Agent: HERO CHOREOGRAPHY (report 2/8) ✅

### H1. Fonts-ready gate (Trionn principle: gated single causal sequence)
- Inline head: `document.fonts.ready.then(()=>html.classList.add('fonts-ready'))` + 600ms failsafe.
- `.js [data-entrance] { animation-play-state: paused }` until `.fonts-ready`.

### H2. Three motion treatments by hierarchy (Spitzer build values)
- Headline lines: mask rise 120%, 1050ms (L1) / 1150ms (L2), cubic-bezier(0.19,1,0.22,1) true expo.
- Lede: own mask, rise 105%, 750ms, same curve.
- Meta/CTA/strip: fade only or ≤10px rise, 500–600ms, --ease-hover (0.33,1,0.68,1).
- Staggered starts, near-synchronized landings (L2 longer so both settle together).

### H3. Shaped cadence, not metronome (Codrops stagger thesis)
- New --d ladder: .12 → .24 → (breath: headline owns 400ms) → .64 → .76 → .90 → 1.06.
- Meta spans stagger +70ms each (sub-100ms feels crafted).

### H4. "prey." lands last (Obys: choreography = copywriting)
- Own mask span, starts .34s, settles slowest 1250ms. Sentence lands on the serif italic.

### H5. One counter-move only (Exo Ape direction discipline)
- CTA ↓ arrow drops down -8px→0, 400ms, delay +140ms. Nothing else moves down.
- Scroll-pulse loop delayed to 1.9s (no ambient loops during entrance).

### H6. Return visits compressed (sessionStorage)
- `is-return` class → delays ×0.3, durations 450ms. Same move, no wait.
- Total: first visit settles ~1.76s; returns ~650ms.

### H7. Curve roles (Snellenberg two-curve system)
- --ease-out: masked risers ONLY (upgrade value to 0.19,1,0.22,1).
- --ease-hover: fades/micro ONLY. --ease-inout: reserved for "mass" moves (strip hairline scaleY).

---
## From Agent: SPACING & ASYMMETRY (report 3/8) ✅
Diagnosis: micro-layouts already asymmetric; SECTION-SCALE rhythm is the stamp (7 identical chapter openings).
Caution: statements contain .line>.line__inner spans — use PADDING offsets, never make them grid containers.
All desktop-gated ≥821px; mobile untouched.

### S1. Fork --space-section into 3 registers (Boulton active whitespace + Zell rhythm)
- --space-section-lite: clamp(3.5rem, 2.5rem+5vw, 7rem) → packages lead + FAQ (candour register).
- --space-section-deep: clamp(9rem, 6rem+16vw, 21rem) → ONE place only: contact statement (the drumroll).
- .faq-section padding-bottom → lite (tighten seam before the peak).

### S2. Column-offset two statements (Ernest Journal occupation variety)
- --colg: calc((100% - 2*var(--margin) + var(--gutter)) / 12).
- .studio__statement padding-left: margin + 2 cols; .evidence__hold + __note: margin + 4 cols.
- Hero/premise/practice/contact stay flush (anchors that make offsets legible).

### S3. Editorial paragraph indents (Rutter/Bringhurst)
- p + p { margin-top:0; text-indent: 2.2em; font-size: var(--text-base) } on premise body, faq answers, case-study prose.

### S4. Numbers cross the frame (Real Review owned-constraint)
- ≥1081px: .principles__num, .practice__num { transform: translateX(calc(-0.45 * var(--margin))) }.

### S5. Measure varies by voice
- .quote__text 22em (oratory narrows); .evidence__note 26em; functional prose stays --measure.

### DO NOT TOUCH: chapter-head spine (the OK-RM constant), ledger internals, hero, ≤820px.

---
## From Agent: SCROLL CONTINUITY (report 4/8) ✅
Core rules: scrubbed = linear + reversible; triggered = eased + one-way; NEVER invert.
Text never sits on interpolating background. Every bridge 40-80vh max. Reduced-motion → hard cuts/650ms fade.

### C1. One bridge per boundary, all DIFFERENT (Repeat/Studio Freight principle)
- premise→manifesto: scroll-scrubbed bg interpolation paper→ink in OKLAB (color-mix in oklab; sRGB goes muddy).
  CSS scroll-driven where supported (@supports animation-timeline: view(), range entry 20%→90%) + JS fallback in manifesto rAF.
- practice→packages: rounded-top overlap slide — .packages { z-index:2; margin-top:-12vh; border-radius: clamp(20px,4vw,44px) top }.
  No shadow (flat palette). data-parallax -0.08 on practice inner = occlusion depth.
- packages→evidence: KEEP hard cut (decisive slam) — one boundary should stay hard.
- evidence→studio: discrete theme cross-fade via IO rootMargin -50%/-50%, wrapper bg transition 650ms (0.22,1,0.36,1).
  (Scope carefully or skip — requires transparent section bgs.)
- faq→contact: footer curtain reveal — contact fixed bottom z-0, main z-1 with margin-bottom = contact height.
  Skip on short viewports + reduced-motion.

### C2. Reveal desynchronization (three observer bands by mass)
- data-reveal routes: head (rootMargin -8%, thr 0, fire early), copy (-14%, 0.05), media (-6%, thr 0.2).
- Motion scale ∝ type scale: labels 12-14px rise 450ms; masked lines 800ms; images NO translate — opacity+scale(1.04→1) 1000ms.
- Uneven ladders: 0/70/160/280 (cap total 400ms). Grid delays from geometry: (rect.left/innerWidth)*90 + row*70 (diagonal wash).
- Mid-page load/anchor jump: intersectionRatio>0.5 on first callback → is-instant (zero duration). Keep unobserve.

### C3. Parallax ratios
- Images in masked frames 0.06-0.12 (current 0.1 ✓); ornaments/numerals ≤0.18; headlines ≤0.04; body text NEVER.
- Max 2 moving layers/viewport; ≥0.05 separation; consistent sign convention site-wide.

---
## From Agent: TYPOGRAPHY (report 5/8) ✅

### T1. Measure scale in ch (Butterick)
- --measure-lede: 32ch (lh 1.4) / --measure-body: 62ch (lh 1.6) / --measure-note: 44ch. Kill accidental 34em/32ch/24em mix.

### T2. Optical italic compensation per register (Typewolf)
- body/lede em: font-size 1.06em, ls 0.01em (Instrument runs small at text sizes).
- .display em 0.96em; hero title em 0.93em. font-synthesis: none on body.
- Deploy italic ONCE outside a headline per page (pull-quote/aside) so it reads as voice not decoration.

### T3. Width axis = hierarchy channel (Cooper Hewitt)
- Three width stations: meta/ledger-meta wdth 90; display 112 (keep); big numerals wdth 72 fw 560.
- Mobile ≤640px: display wdth 98, ls -0.015em (narrow instead of only shrinking).

### T4. One sanctioned break per page (NYT Mag/Bichler)
- Home: ONE statement in Instrument Serif ROMAN lowercase --text-xl lh 1.02 (only serif-dominant moment).
- Work: vertical-rl rotated chapter label. Approach: one wdth-62 full-bleed line. Studio: one right-aligned lede.
- Document as "sanctioned breaks" in CSS comments.

### T5. Meta voice (Typewolf studio survey)
- .meta-voice: fw 500, ls 0.02em, tabular-nums slashed-zero, wdth 94.
- Tracking ramp: 12px caps 0.16em / 14px 0.10em / ≥20px caps 0.04em max / lowercase ≤0.02em.

### T6. Optical alignment (CSS-Tricks hanging-punctuation)
- Quotes: hanging-punctuation first last + @supports-not fallback text-indent -0.42ch.
- .display { margin-left: -0.04em } (round-glyph optical margin).
- Chapter nums hang into margin.

### T7. Wrap control (Chrome guidance)
- balance on unsplit headings ONLY (pre-split .line markup is untouchable — strongest human tell on site).
- pretty on ledes/prose/notes.

### T8. Line-height ramp (deliberate, not flat)
- display 0.94 → md 1.08 → lede 1.4 → body 1.6 → caption 1.5. Fix accidental 1.45/1.5 drift.

---
## From Agent: HOVER LANGUAGE (report 7... actually 6/8) ✅
STANCE: "paper does not float — it inks." No lifts/shadows/glows ever.
HOUSE RULE (Comeau): exit ≈ 1.6-1.8× enter, same easing family. Base rule carries EXIT; :hover overrides enter duration.

### V0. New tokens
- --dur-exit: 420ms; --dur-underline-exit: 480ms; --ease-spring: cubic-bezier(0.34,1.56,0.64,1);
- --dim-text: 0.45; --dim-media: 0.72.

### V1. Underline pass-through (Codrops origin-flip)
- Base: scaleX(0) origin RIGHT, transition 480ms --ease-out. Hover: scaleX(1) origin LEFT, duration 300ms.
- (Check current code — origin flip may exist; the asymmetric timing is the upgrade.)
- 1px under small caps; 2px only under display sizes. .link-quiet stub scaleX(0.35) keeps origin left both ways.

### V2. Button ink fill (replaces translateY lift — our #1 generic tell)
- .btn::before circle inset -12% -6%, radius 50%, from translateY(104%) scaleY(0.55) origin bottom.
- Enter 480ms --ease-inout; exit (drain down) 380ms. Label z-1. :active scale(0.985) compress not lift.

### V3. Arrows: two distances, one timing
- Inline CTAs 0.25em; feature-scale 0.3em max. Enter 320-350ms --ease-out, exit 500ms.
- .btn__arrow ↓ keeps translateY, delayed 60ms after ink.

### V4. Magnetic (validated: STRENGTH 0.32 correct)
- Release: change to 560ms var(--ease-spring) — single overshoot ~6% (the "magnetic" feel vs "dragged").
- Two-layer pull: inner label span extra 0.5× offset. Scope: contact email only (+back-to-top max).

### V5. Image scale: enter 700ms / exit 900ms (asymmetry is the upgrade), values 1.02-1.04 locked.
- Optional filter: saturate(1.06) same transition.

### V6. Sibling dimming (strongest cheap upgrade)
- nav:hover a:not(:hover) → 0.45 (360ms); footer col → 0.55; menu overlay → 0.35; work plates → 0.72 (420ms).
- NOT on ledger rows (disclosure controls). Symmetric-slow correct for opacity choreography.

### V7. Master timing table (see agent report). Reduced-motion: transforms 1ms; color/opacity may remain.

---
## From Agent: FINISHING DETAILS (report 7/8) ✅
GOVERNANCE: whimsy budget ∝ 1/frequency (Family curve). Rare surfaces (404, console, blur) perform; frequent ones whisper.

### D1. Selection fix (current #815EFA = 3.7:1 FAILS AA)
- ::selection { background: var(--accent-deep); color: var(--paper) } (6.2:1).
- Dark fields + manifesto: background var(--secondary) gold, color var(--ink) (7.1:1).
- img::selection rgba violet 0.28.

### D2. Focus two-layer ring: outline 2px --accent-deep offset 3px + box-shadow 0 0 0 3px var(--paper) gasket.
- Dark fields: outline --secondary, gasket --ink.

### D3. Grain kit (Chion/ibelick numbers)
- Tile: feTurbulence fractalNoise bF 0.9 nO 2 (paper tooth) / 0.65 3 (film grain), 300px tile data-URI.
- body::after fixed: opacity 0.04 multiply (light paper tooth).
- .manifesto::after: opacity 0.08 overlay 240px (banding killer on violet radials).
- NEVER animate. Static tile only.

### D4. House easing NAMED + governance
- --ease-reveal (0.16,1,0.3,1 = arrival), --ease-touch (0.33,1,0.68,1 = touch), --ease-curtain (0.83,0,0.17,1 = occlusion).
- No raw ease/linear except ONE sanctioned slow plain-ease register (manifesto).
- Comeau asymmetry as house rule: base carries slow exit, :hover overrides fast enter.

### D5. 404 page ("the page that took our advice's inverse")
- src/404.njk → /404.html. Label: 404 — PERFECTLY CAMOUFLAGED. H1: "This page *blended in.*"
- Dek: camouflage works / what blends in disappears. CTAs: Back to visibility → / Work that refuses to hide.
- Eclipse mark outline-only ~8% ink (logo itself camouflaged). Grain 0.07. Title: Perfectly camouflaged — OOVERT.

### D6. Footer studio clock (Karachi? — CONFIRM studio city w/ user, site says distributed 6 tz)
- Ticks on the minute; tabular-nums; says "we are a real room somewhere."

### D7. Title-on-blur: 'Camouflage is for prey. — OOVERT' (thesis not plea). Adaptive favicon (dark-mode fill swap in SVG).

### D8. Kit: theme-color meta light/dark pair; real underlines (thickness 0.08em offset 0.18em skip-ink, violet 55% → deep on hover);
- html { scrollbar-color: var(--ink-soft) var(--paper) } (recolor only); print styles; one-line console (italic serif violet).
- OG: bake grain into PNG. NO preloader (costume not craft on fast static site).

---
## From Agent: NAV & TRANSITIONS (report 8/8) ✅

### N1. Header hide/reveal (NN/g spec)
- Hide down / reveal up. DELTA 8px, HIDE_FLOOR 160px (never hide in hero), COMPRESS_AT 80px.
- 400ms --ease-out transform; compress state: padding-block space-2, mark 1.25rem (from 1.5).
- Never hide while menu-open; reveal on focusin. NO background tint (difference blend is the signature — compression is the scrolled cue).

### N2. Underline refinement (keep existing origin-flip; add curves)
- --ease-draw (0.7,0,0.2,1) exit; --ease-settle (0.4,1,0.8,1) enter. 300ms both.
- aria-current: static line, opacity 0.55, dimmer than hover.
- Sibling dim @media(hover:hover) only, never :focus-within.

### N3. View-transition asymmetry (Chrome shared-axis)
- main { view-transition-name: page-main }. Old: 180ms depart up -12px (0.4,0,1,1). New: 420ms arrive from +16px, delay 100ms, --ease-out.
- Root crossfade 240ms. Reduced-motion: animation none on all vt pseudos.
- CAVEAT: difference-blend header may shimmer in snapshot — if so: ::view-transition-old(site-head){display:none}, new{animation:none}.

### N4. Menu overlay choreography
- Panel curtain: clip-path inset(0 0 100% 0)→0, 600ms --ease-inout.
- Links: 500ms --ease-out, delays 180/240/300/360/420/480 (start at ~30% of curtain), meta 520ms.
- Exit: whole-panel fade 300ms, no reverse stagger. is-closing + animationend + 400ms fallback.
- Menu/Close label roll: stacked spans translateY(-100%) 400ms --ease-inout; aria-label on button.

---
# ALL 8 REPORTS BANKED. IMPLEMENTATION BATCHES:
B1 Foundation voice: easing governance, selection AA fix, focus ring, scrollbar, theme-color pair, real underlines, grain (body 0.04 multiply + manifesto 0.08 overlay), title-blur, console, favicon dark-mode, dvh.
B2 Header/nav: hide-reveal + compress, underline curves, sibling dim, aria-current, menu choreography, vt asymmetry.
B3 Hero entrance: fonts gate, shaped ladder, 3 treatments, prey. mask, arrow counter-move, return compression.
B4 Hover: btn ink fill, arrows, magnetic spring, image asym, dim (footer/menu/plates).
B5 Space/type: section registers, offsets (studio/evidence), p+p indents, num outdents, measure/em/tabular/balance-pretty/optical margin.
B6 Continuity: premise→manifesto oklab scrub, packages rounded overlap, reveal desync 3 bands + is-instant.
B7 404 page + adaptive favicon + OG grain (footer clock optional).

## From my own audit (confirmed in code)
- A1. Header collision: fixed header + big headlines collide compositionally → hide-on-scroll-down/show-on-scroll-up.
- A2. 31× raw `ease-out` keyword while house tokens --ease-out/--ease-hover/--ease-inout exist → route all through tokens.
- A3. Hero delays perfect 0.1 steps (.42/.52/.62/.72) → human-uneven timing.
- A4. Hard paper↔ink section cuts.
- A5. Flat manifesto gradient, zero texture (see I2).
- A6. Missing: scrollbar styling, 404 page, dvh (uses 100vh), title-on-blur, ::selection refinement partial.

## From ui-ux-pro-max db
- Reveal y-offsets 8–16px max (reads as fade not slide); stagger 0.02–0.04s lists; expo.out for headlines only; micro 150–300ms.

## From 21st.dev (negative reference)
- The "AI aesthetic" to avoid: floating glass rounded headers, generic card heroes, uniform shadcn-style patterns.
