/**
 * Hero cursor-parallax — tactile depth under the hand.
 *
 * The paper light-field (back plane) and the Swiss column grid (mid plane) drift
 * a few pixels OPPOSITE the pointer; the headline stays anchored and crisp
 * (front plane). Motion is lerp-to-target, so it is buttery and has no period —
 * it moves only while the pointer moves and settles the instant it stops or
 * leaves. Pure compositor transforms (driven through CSS custom properties the
 * layers already read), so there is no repaint and nothing to jank.
 *
 * Intent-driven only: fine pointers, motion allowed, hero on screen. Touch,
 * reduced motion, or hero off-screen → nothing runs.
 */
export function initHeroParallax({ reducedMotion } = {}) {
  if (reducedMotion) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const BG = 16;   // px of travel for the light field at full offset
  const GRID = 7;  // px for the column grid (nearer plane, moves less)
  const EASE = 0.08;

  let tx = 0, ty = 0; // target, normalised -1..1 (already inverted)
  let cx = 0, cy = 0; // current
  let raf = null;
  let onScreen = true;

  const frame = () => {
    cx += (tx - cx) * EASE;
    cy += (ty - cy) * EASE;
    hero.style.setProperty('--px-bg', (cx * BG).toFixed(2) + 'px');
    hero.style.setProperty('--py-bg', (cy * BG).toFixed(2) + 'px');
    hero.style.setProperty('--px-grid', (cx * GRID).toFixed(2) + 'px');
    hero.style.setProperty('--py-grid', (cy * GRID).toFixed(2) + 'px');
    raf = Math.abs(tx - cx) > 0.0005 || Math.abs(ty - cy) > 0.0005
      ? requestAnimationFrame(frame)
      : null;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  hero.addEventListener('pointermove', (e) => {
    if (!onScreen) return;
    const r = hero.getBoundingClientRect();
    tx = -(((e.clientX - r.left) / r.width) - 0.5) * 2;
    ty = -(((e.clientY - r.top) / r.height) - 0.5) * 2;
    kick();
  }, { passive: true });

  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });

  // Stop reacting (and glide home) once the hero leaves the viewport.
  new IntersectionObserver((entries) => {
    for (const en of entries) {
      onScreen = en.isIntersecting;
      if (!onScreen) { tx = 0; ty = 0; kick(); }
    }
  }, { threshold: 0 }).observe(hero);
}
