/**
 * Living mark — the footer eclipse.
 * As the oversized wordmark scrolls through the viewport, its two "oo" circles
 * counter-rotate a few degrees, so the sign-off feels alive without ever
 * animating on its own. rAF-throttled; only runs while the mark is near view.
 * Header hover is pure CSS; this handles the footer drift only.
 */
export function initLivingMark({ reducedMotion } = {}) {
  if (reducedMotion) return;
  const svg = document.querySelector('.site-foot__mark svg');
  if (!svg) return;
  const left = svg.querySelector('.mark__o--l');
  const right = svg.querySelector('.mark__o--r');
  if (!left || !right) return;

  const RANGE = 42; // max degrees of counter-rotation across the viewport pass
  let raf = null;
  let near = false;

  const apply = () => {
    raf = null;
    const rect = svg.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // 0 as the mark enters from the bottom, 1 as it leaves past the top.
    const p = 1 - (rect.top + rect.height / 2) / (vh + rect.height);
    const deg = (Math.max(0, Math.min(1, p)) - 0.5) * 2 * RANGE;
    left.style.transform = `rotate(${(-deg).toFixed(2)}deg)`;
    right.style.transform = `rotate(${deg.toFixed(2)}deg)`;
  };

  const onScroll = () => {
    if (near && !raf) raf = requestAnimationFrame(apply);
  };

  // Only listen while the mark is anywhere near the viewport.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        near = entries[0].isIntersecting;
        if (near) onScroll();
      },
      { rootMargin: '40% 0px 40% 0px' }
    ).observe(svg);
  } else {
    near = true;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  apply();
}
