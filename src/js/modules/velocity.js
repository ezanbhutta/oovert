/**
 * Scroll weight — display type has mass.
 * The big statement lines shear a fraction of a degree in the direction of
 * scroll and settle back as it slows, so fast scrolling feels like moving
 * something heavy rather than sliding a screenshot. The shear tracks the
 * page's *instantaneous* velocity (read per frame, time-normalized, so the
 * feel is identical at 60Hz and 120Hz) — not an accumulator, which would top
 * up across a long inertia glide and pin the type at full tilt.
 *
 * Transform-only on a handful of elements and completely silent at rest: the
 * loop stops and the inline transform is removed once the motion decays.
 * Capped at ±1.35deg — past that it stops reading as weight and starts
 * reading as a broken layout.
 */
const MAX_DEG = 1.35;
const FULL_TILT = 48; // px per 60fps-frame of scroll speed that maps to the cap
const RESPONSE = 0.14; // how quickly the shear follows the current speed

const TARGETS = [
  '.premise__statement',
  '.premise__counter',
  '.packages__lead',
  '.work-more__line',
  '.studio-thesis__line',
  '.cost-why__text',
  '.cost-range__average',
].join(', ');

export function initVelocity({ reducedMotion } = {}) {
  if (reducedMotion) return;
  const els = Array.from(document.querySelectorAll(TARGETS));
  if (!els.length) return;

  let prevY = window.scrollY;
  let prevT = performance.now();
  let shear = 0;
  let idle = 0;
  let raf = null;

  const loop = (now) => {
    const y = window.scrollY;
    const dt = Math.max(8, now - prevT);
    const vel = ((y - prevY) / dt) * 16.7; // px per normalized frame
    prevY = y;
    prevT = now;

    const target = Math.max(-1, Math.min(1, vel / FULL_TILT)) * MAX_DEG;
    shear += (target - shear) * RESPONSE;

    if (Math.abs(shear) > 0.015 || Math.abs(target) > 0.015) {
      idle = 0;
      const t = `skewY(${shear.toFixed(3)}deg)`;
      for (const el of els) el.style.transform = t;
      raf = requestAnimationFrame(loop);
    } else if (++idle < 12) {
      // brief grace window so a resumed scroll doesn't restart from a cleared
      // transform mid-gesture
      raf = requestAnimationFrame(loop);
    } else {
      for (const el of els) el.style.transform = '';
      raf = null;
    }
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!raf) {
        prevY = window.scrollY;
        prevT = performance.now();
        raf = requestAnimationFrame(loop);
      }
    },
    { passive: true }
  );
}
