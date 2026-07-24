# OOVERT — Signature Moments Dossier

Output of a 69-agent research → ideate → adversarial-critique → synthesize workflow
(Refero branding sites, Clutch agencies, Awwwards/FWA/CSSDA, luxury/museum/architecture,
experimental/editorial). Every moment below survived a 4-lens adversarial panel
(creative-director / originality / craft-feasibility / brand-fit).

## The one idea (the throughline)

**The Archivo width axis (wdth 62–125) becomes the site's only grammar of visibility.**
One rule governs every moment:

> **condensed + quiet = camouflaged / prey** (holding still, in cover)
> **expanded + full-ink = overt** (seen, out loud)

Nothing fades — opacity is the generic AI tell we refuse. Everything changes
**proportion**, and **movement is always the betrayal**: the thing that moves is the
thing that gives itself away. The verb is conjugated across four scales, so the set
reads as *authored*, not assembled. None can be lifted onto another brand without the
"camouflage is for prey" thesis and the width axis coming with it — that non-portability
is the answer to "why is it so RIGHT for THIS brand."

---

## #1 — Break Cover  ·  hero scale  ·  avg 7.3  ·  IDENTITY-DEFINING
The hero paints instantly at rest width (LCP-safe, no reveal to wait through). Then one
choreographed beat *at peak attention*: the wordmark re-condenses to ~wdth 68, low-contrast,
and un-flattens back to rest — slower than any load reflex so it can't read as a font-swap
flash — the serif "prey." surfacing **last**, the sentence's own subject last to give itself
away. Thereafter it lives: scrolling the hero out compresses it back into the paper
(re-taking cover), reversible on scroll-up.
- **Mechanism:** `@property --wdth` + WAAPI for the beat; exit compression off scroll progress. Replaces the current hero masked line-rise only.
- **Guards:** `white-space:nowrap` + reserved metrics box (zero CLS); integer-quantize width (no shimmer); reduced-motion ships static at rest width.

## #2 — The Eclipse Aperture  ·  portfolio scale  ·  avg 6.8  ·  IDENTITY-DEFINING · HIGH effort
At a case study's end, the next project is concealed *behind the mark itself*. Scroll on
with intent and the eclipse "oo" opens — the two circles dilate + counter-rotate outward,
the viewport reading as the living mark's eye opening onto the next target, which bleeds up
out of a real disruptive **camouflage field** that coheres into full colour as the aperture
fills. One target recedes as the next emerges; no page cut. The portfolio becomes one hunt.
- **Mechanism:** intent-gated **committed** GSAP timeline (velocity+direction gate, ~250ms cancel window) playing as the real cross-document nav; eclipse promoted to a shared `view-transition-name`. Case studies only (GSAP allowed there).
- **Two non-negotiables:** the two circles must be the visible pivot *throughout* (never a clean circle wipe); the incoming field must resolve from a real camouflage pattern (never a plain fade).
- **Build call:** committed intent-timeline (recommended, jank-free) vs reversible-scrub (richest feel).

## #3 — The Tell  ·  glyph scale  ·  avg 7.8 (highest)  ·  IDENTITY-DEFINING
One interior chapter word. Letters rest condensed (wdth ~70) but full-ink and legible; only
the letters nearest your attention (cursor on desktop, scroll-centred band on touch) widen
toward 125 in a travelling wave with an asymmetric wake and a reluctant re-camouflage trail
(prey re-freezing). Reading the word means watching it surface letter by letter and re-hide
behind you. **Movement is the tell; the letter you look at is the one that gives itself away.**
- **Mechanism:** per-letter spans; one rAF maps distance-from-focus → per-letter width, pinned influence radius + ~5-unit quantization so only 2–3 glyphs re-shape per frame.
- **Guards:** legible-at-rest (width carries the tell, brief ink pop only at the wave peak); fine-pointer only; mobile + reduced-motion ship the word static at full width.

## #4 — The Quiet Index  ·  navigation scale  ·  avg 6.5  ·  connective tissue · LOW effort
The section index/nav rests in cover (items condensed + quiet); the one item matching your
current section breaks to full width + full ink — the spotted target. Move between chapters
and the active item widens/re-inks while the rest re-condense. Wayfinding in the same grammar.
- **Mechanism:** IntersectionObserver + `.is-current` transitions `--wdth` 66→112 on house easing. Vanilla, zero LCP impact. Extends the existing compressing header.

---

## Cut list (rejected by the panel)
- **Out of Cover / a third width-reveal hero** — would fracture the single hero into competing versions. One hero, not three.
- **The Aperture (generic centre/cursor opening)** — the mark-anchored Eclipse Aperture owns this and escapes the recognizable Codrops wipe; a second is duplication.
- **Reading Exposes It / Spotted / Look Closely** — same verb as The Tell; keeping them is kinetic-type-twice, breaking the "motion as scarce accent" discipline.
- **Break the Pattern** — glitch/pattern-break lives outside the width grammar; a second visual language the others would fight.
- **The Sightline / Focus Field / One Thing Moves / The Hunt** — low scores, off-thesis, or literal illustration of the metaphor rather than the mechanism *being* the thesis.

## Why these four cohere
The meaning lives in the **direction** of the gesture (gaze/scroll-as-predator,
proportion-as-visibility) and in this specific type system arguing this specific tagline —
not in any surface effect. Four scales, one verb: brand (Break Cover) → glyph (The Tell) →
portfolio (Aperture) → navigation (Quiet Index).
