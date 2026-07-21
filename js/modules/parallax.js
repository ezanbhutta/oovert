/**
 * Scroll parallax for [data-parallax="speed"]. Offset is derived from the
 * untransformed parent so the element's own transform never feeds back
 * into the measurement. Transform-only, rAF-throttled.
 */
export function initParallax() {
  const els = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!els.length) return;

  const items = els.map((el) => ({
    el,
    speed: parseFloat(el.dataset.parallax) || 0.1,
    anchor: el.parentElement ?? el,
  }));

  let raf = null;

  const update = () => {
    raf = null;
    const mid = window.innerHeight / 2;
    for (const { el, speed, anchor } of items) {
      const rect = anchor.getBoundingClientRect();
      const delta = rect.top + rect.height / 2 - mid;
      el.style.transform = `translate3d(0, ${(delta * speed).toFixed(1)}px, 0)`;
    }
  };

  const request = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  request();
}
