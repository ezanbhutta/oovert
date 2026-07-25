/**
 * Hero re-camouflage on scroll.
 *
 * The wordmark simply IS at its overt rest on load — no entrance beat, because a
 * reload should not perform. The only life is the exit: as the hero scrolls out
 * of frame the wordmark re-condenses and quiets toward the paper (taking cover
 * behind you), fully reversible on scroll up. One rAF owns --wdth/--veil, and
 * only writes when the quantized value changes (the width axis repaints the
 * largest text on the page). Reduced motion ships the static overt rest.
 */
export function initBreakCover({ reducedMotion } = {}) {
  const title = document.querySelector('.hero__title');
  if (!title || reducedMotion) return;

  const REST = 112;
  const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

  let lastW = null;
  let lastV = null;
  const apply = (wdth, veil) => {
    const w = Math.round(wdth);
    const v = veil.toFixed(1);
    if (w !== lastW) { title.style.setProperty('--wdth', w); lastW = w; }
    if (v !== lastV) { title.style.setProperty('--veil', v); lastV = v; }
  };

  let ticking = false;
  const liveFrame = () => {
    ticking = false;
    const r = title.getBoundingClientRect();
    const p = clamp01(-r.top / (window.innerHeight * 0.85));
    apply(REST - p * (REST - 68), p * 46);
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(liveFrame);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  liveFrame();
}
