/**
 * Wheel inertia. Native scroll stays authoritative — keyboard, touch,
 * scrollbar, and anchors all behave normally; only wheel input is eased.
 * Gated to fine pointers without reduced-motion (see main.js).
 */
const EASE = 0.115;

export function initSmoothScroll() {
  let target = window.scrollY;
  let current = window.scrollY;
  let raf = null;

  const maxScroll = () =>
    document.documentElement.scrollHeight - window.innerHeight;

  const loop = () => {
    current += (target - current) * EASE;

    if (Math.abs(target - current) < 0.5) {
      current = target;
      window.scrollTo({ top: current, behavior: 'instant' });
      raf = null;
      return;
    }

    window.scrollTo({ top: current, behavior: 'instant' });
    raf = requestAnimationFrame(loop);
  };

  window.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) return; // pinch-zoom
      if (document.body.classList.contains('menu-open')) return;
      if (e.defaultPrevented) return;

      e.preventDefault();

      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      target = Math.max(0, Math.min(maxScroll(), target + e.deltaY * scale));
      if (!raf) raf = requestAnimationFrame(loop);
    },
    { passive: false }
  );

  // Re-sync when scroll happens outside the wheel loop (keyboard, anchors,
  // scrollbar drag, browser find).
  window.addEventListener(
    'scroll',
    () => {
      if (!raf) target = current = window.scrollY;
    },
    { passive: true }
  );
}
