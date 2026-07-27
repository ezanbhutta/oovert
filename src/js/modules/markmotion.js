/**
 * The mark, in space — pointer drive for the sub-page hero figure.
 *
 * All this module does is translate pointer position into four custom
 * properties on the figure; CSS owns every transform, so the work stays on the
 * compositor and the whole thing degrades to a composed still frame when the
 * properties never change.
 *
 *   --rx / --ry  tilt of the stage, in degrees
 *   --conv       0 at the edges, 1 at the centre: how far the two rings have
 *                pulled into register (the mark resolving)
 *   --lit        the same curve, used for opacity and the lens core
 *
 * Written once per frame from a rAF, and the loop stops as soon as the values
 * have settled, so an untouched page costs nothing. Fine pointers only; touch
 * and reduced-motion keep the static composition the CSS already sets.
 */
export function initMarkMotion({ reducedMotion } = {}) {
  const figs = [...document.querySelectorAll('[data-mark3d]')];
  if (!figs.length) return;
  if (reducedMotion) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const MAX_TILT = 13; // degrees; past ~15 the rings read as skewed, not tilted

  for (const fig of figs) {
    const host = fig.closest('.work-hero') || fig.parentElement;
    if (!host) continue;

    const state = { rx: 0, ry: 0, k: 0 };
    const target = { rx: 0, ry: 0, k: 0 };
    let raf = null;

    const write = () => {
      fig.style.setProperty('--rx', state.rx.toFixed(2) + 'deg');
      fig.style.setProperty('--ry', state.ry.toFixed(2) + 'deg');
      fig.style.setProperty('--conv', state.k.toFixed(3));
    };

    const frame = () => {
      raf = null;
      let moving = false;
      for (const key of ['rx', 'ry', 'k']) {
        const d = target[key] - state[key];
        if (Math.abs(d) > 0.002) {
          state[key] += d * 0.12; // weight, without lag
          moving = true;
        } else {
          state[key] = target[key];
        }
      }
      write();
      if (moving) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    host.addEventListener(
      'pointermove',
      (e) => {
        const r = fig.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Normalised offset from the figure's centre, clamped to a sane range
        // so a pointer far across the hero does not fold the stage in half.
        const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width * 0.9)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height * 0.9)));
        target.ry = nx * MAX_TILT;
        target.rx = -ny * MAX_TILT;
        // Convergence: full at the centre, gone by the edge of the figure.
        const d = Math.min(1, Math.hypot(nx, ny));
        const t = 1 - d;
        target.k = t * t * (3 - 2 * t);
        kick();
      },
      { passive: true }
    );

    host.addEventListener(
      'pointerleave',
      () => {
        target.rx = 0;
        target.ry = 0;
        target.k = 0;
        kick();
      },
      { passive: true }
    );
  }
}
