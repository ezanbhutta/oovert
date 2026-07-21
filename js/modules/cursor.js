/**
 * Trailing cursor dot. The native cursor stays — this is an accent,
 * not a replacement. Fine pointers only (gated in main.js).
 */
export function initCursor() {
  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  const label = cursor.querySelector('.cursor__label');
  const HOVER_SELECTOR = 'a, button, [data-hover]';

  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let raf = null;

  const loop = () => {
    x += (targetX - x) * 0.22;
    y += (targetY - y) * 0.22;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

    if (Math.abs(targetX - x) < 0.1 && Math.abs(targetY - y) < 0.1) {
      raf = null;
      return;
    }
    raf = requestAnimationFrame(loop);
  };

  document.addEventListener(
    'mousemove',
    (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!cursor.classList.contains('is-on')) {
        x = targetX;
        y = targetY;
        cursor.classList.add('is-on');
      }
      if (!raf) raf = requestAnimationFrame(loop);
    },
    { passive: true }
  );

  document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(HOVER_SELECTOR);
    cursor.classList.toggle('is-hover', Boolean(target));
    if (label) label.textContent = target?.dataset.cursorLabel ?? '';
  });
}
