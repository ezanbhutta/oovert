/**
 * Magnetic hover for [data-magnetic] elements — the element leans toward
 * the pointer and springs back on leave. Transform-only.
 */
const STRENGTH = 0.32;

export function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    let raf = null;

    const move = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        el.style.transition = 'transform 120ms ease-out';
        el.style.transform = `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`;
      });
    };

    const reset = () => {
      el.style.transition = 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)';
      el.style.transform = '';
    };

    el.addEventListener('mousemove', move, { passive: true });
    el.addEventListener('mouseleave', reset);
    el.addEventListener('blur', reset);
  });
}
