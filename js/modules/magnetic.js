/**
 * Magnetic hover for [data-magnetic] elements — the element leans toward
 * the pointer and springs back on leave. The center is measured once per
 * hover (before any transform is applied), so pointer frames do no layout
 * work and the element's own offset never feeds back into the math. The
 * element's stylesheet transitions are preserved alongside the inline one.
 */
const STRENGTH = 0.32;

export function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const base = getComputedStyle(el).transition;
    let cx = 0;
    let cy = 0;
    let raf = null;

    el.addEventListener('mouseenter', () => {
      const rect = el.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
    });

    const move = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        el.style.transition = `${base}, transform 120ms ease-out`;
        el.style.transform = `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`;
      });
    };

    const reset = () => {
      el.style.transition = `${base}, transform 500ms cubic-bezier(0.16, 1, 0.3, 1)`;
      el.style.transform = '';
    };

    el.addEventListener('mousemove', move, { passive: true });
    el.addEventListener('mouseleave', reset);
    el.addEventListener('blur', reset);
  });
}
