/**
 * Seen again — the rebranding page's signature.
 * The strategy line is scroll-scrubbed from cover (condensed, veiled toward
 * the paper) to overt as it crosses the reading band: the exact inverse of
 * the homepage hero, which takes cover as it leaves. The homepage conjugates
 * disappearing; this line conjugates being seen again — which is the pitch.
 *
 * One element, quantized writes, early-out when the band is off screen, and
 * the CSS side registers short --wdth/--veil interpolations so the rAF steps
 * glide. Base state is the finished overt reading (no-JS / reduced-motion).
 */
export function initUnveil({ reducedMotion } = {}) {
  const el = document.querySelector('[data-unveil]');
  if (!el || reducedMotion) return;

  const COVER = 74;
  const OVERT = 112;
  const VEIL = 62;
  const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

  let lastW = null;
  let lastV = null;
  let ticking = false;

  const frame = () => {
    ticking = false;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < -80 || r.top > vh + 80) return; // idle outside the band
    const p = clamp01((vh * 0.92 - r.top) / (vh * 0.47)); // resolved by ~45% up
    const e = p * p * (3 - 2 * p); // smoothstep arrival
    const w = Math.round(COVER + e * (OVERT - COVER));
    const v = ((1 - e) * VEIL).toFixed(1);
    if (w !== lastW) { el.style.setProperty('--wdth', w); lastW = w; }
    if (v !== lastV) { el.style.setProperty('--veil', v); lastV = v; }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  frame();
}
