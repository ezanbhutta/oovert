/**
 * Break Cover — the hero refuses to hide.
 *
 * The wordmark paints instantly at its overt rest width (LCP-safe, no reveal to
 * wait through). Then ONE choreographed beat at peak attention: it re-condenses
 * and veils toward the paper (taking cover) and un-flattens back to overt —
 * slower than any load reflex, so it can never read as a font-swap flash — the
 * serif "prey." surfacing LAST, the sentence's own subject the last to give
 * itself away. Thereafter it lives: as you scroll the hero out of frame the
 * wordmark compresses and quiets back into the paper (re-taking cover behind
 * you), reversible on scroll-up.
 *
 * One rAF owns --wdth/--veil the whole time (no WAAPI/inline cascade fight):
 * a time-based beat first, then scroll-driven exit. Reduced motion ships static
 * at rest width, full ink — also the fastest possible hero.
 */
export function initBreakCover({ reducedMotion } = {}) {
  const title = document.querySelector('.hero__title');
  if (!title || reducedMotion) return;

  const prey = title.querySelector('em');
  const isReturn = document.documentElement.classList.contains('is-return');
  const BEAT = isReturn ? 900 : 1650;
  const REST = 112;
  const COVER = 70;
  const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
  const expo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const apply = (wdth, veil, preyO) => {
    title.style.setProperty('--wdth', Math.round(wdth));
    title.style.setProperty('--veil', veil.toFixed(1));
    if (prey && preyO != null) prey.style.opacity = preyO.toFixed(3);
  };

  let beatStart = null;
  let beatDone = false;

  const beatFrame = (ts) => {
    if (beatStart == null) beatStart = ts;
    const t = clamp01((ts - beatStart) / BEAT);
    let wdth;
    let veil;
    if (t < 0.32) {
      const u = expo(t / 0.32); // take cover
      wdth = REST - u * (REST - COVER);
      veil = u * 55;
    } else {
      const u = expo((t - 0.32) / 0.68); // break cover
      wdth = COVER + u * (REST - COVER);
      veil = 55 - u * 55;
    }
    // "prey." (serif, no width axis) holds veiled, then surfaces last.
    const preyO = prey ? (t < 0.5 ? 0.16 : clamp01((t - 0.5) / 0.5)) : null;
    apply(wdth, veil, preyO);
    if (t < 1) {
      requestAnimationFrame(beatFrame);
    } else {
      beatDone = true;
      if (prey) prey.style.opacity = '';
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  };

  // Exit re-camouflage: hero compresses and quiets back into the paper.
  let ticking = false;
  const liveFrame = () => {
    ticking = false;
    const r = title.getBoundingClientRect();
    const p = clamp01(-r.top / (window.innerHeight * 0.85));
    apply(REST - p * (REST - 68), p * 46);
  };
  const onScroll = () => {
    if (!ticking && beatDone) {
      ticking = true;
      requestAnimationFrame(liveFrame);
    }
  };

  const start = () => requestAnimationFrame(beatFrame);
  if (document.documentElement.classList.contains('fonts-ready')) start();
  else if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else setTimeout(start, 300);
}
