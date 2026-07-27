# Parked: the debossed hero ("THE IMPRESSION")

Built and verified, then parked on 2026-07-27 because the mark itself is not
final. The field is rasterised from `src/_includes/mark.njk` at runtime, so
this follows whatever the mark becomes: nothing here is baked against the
current artwork.

What it is: the hero canvas renders the paper itself, and the eclipse is a
blind deboss pressed into it. No ink, no foil, pressure only. The pointer does
not move the mark, it moves the light, so the mark surfaces under a raking key
and submerges under a flat one.

Measured when parked, at 1440x900:
- 18KB minified, no Three.js (a scene graph for this was 479KB / 120KB gzip)
- field build 97ms, sliced across ~24 macrotask yields, no long tasks
- zero document overflow at 1920/1440/1366/1024/900/899/768/390
- gated off below 900px, on coarse pointers, under reduced-motion and no-JS
- flat sheet resolves to exactly --paper, so the canvas seam is invisible

To re-wire, once the mark is final:
1. move `hero3d-src` back to `src/js-src/` and `hero3d-gate.js` back to
   `src/js/modules/`
2. restore the esbuild bundle step in `.eleventy.js` (bundles
   `src/js-src/hero3d.js` to `_site/js/hero3d.js`)
3. in `src/index.njk`, add `<div class="hero__sheet-mount" data-hero3d
   aria-hidden="true"></div>` after the `.hero__bg` canvas
4. in `src/js/main.js`, import and call `initHero3DGate()`
5. restore the `.hero__sheet-mount` / `.hero__sheet` rules in
   `src/css/sections.css`
