/**
 * Wheel inertia. Native scroll stays authoritative, keyboard, touch,
 * scrollbar, and anchors all behave normally; only wheel input is eased,
 * and any external scroll immediately wins over the inertia loop.
 * Gated to fine pointers without reduced-motion (see main.js).
 */
const EASE = 0.115;

export function initSmoothScroll() {
  let target = window.scrollY;
  let current = window.scrollY;
  let raf = null;

  const maxScroll = () =>
    document.documentElement.scrollHeight - window.innerHeight;

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    target = current = window.scrollY;
  };

  const loop = () => {
    if (document.body.classList.contains('menu-open')) {
      stop();
      return;
    }

    // The document may have shrunk mid-animation (e.g. viewport resize).
    const max = maxScroll();
    if (target > max) target = max;
    if (current > max) current = max;

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

  // In-page anchor navigation always outranks a running inertia tail.
  document.addEventListener('click', (e) => {
    if (raf && e.target.closest('a[href*="#"]')) stop();
  });

  // Re-sync on scrolls that didn't come from the inertia loop: keyboard,
  // scrollbar drag, browser find, anchor jumps. A divergence larger than
  // the loop's own step means an external actor moved the page, yield.
  window.addEventListener(
    'scroll',
    () => {
      if (raf && Math.abs(window.scrollY - current) > 2) stop();
      if (!raf) target = current = window.scrollY;
    },
    { passive: true }
  );
}
