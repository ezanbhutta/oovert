/**
 * Scroll reveals.
 * Elements opt in via [data-reveal] / [data-reveal-lines] / [data-reveal-head];
 * CSS owns the transitions (and disables them under prefers-reduced-motion),
 * so this module only flags visibility.
 *
 * Two observer bands, by element mass: type leads (headlines and chapter
 * heads fire early), body copy holds to the reading line. And anything
 * already well in view on first paint (anchor jumps, mid-page loads) appears
 * instantly — entrance choreography playing on content you are already
 * reading is a tell, not a delight.
 */
export function initReveal() {
  const arrivedAt = performance.now();

  const makeObserver = (options) =>
    new IntersectionObserver((entries, obs) => {
      const early = performance.now() - arrivedAt < 600;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (early && entry.intersectionRatio > 0.5) {
          entry.target.classList.add('is-instant');
        }
        entry.target.classList.add('is-inview');
        obs.unobserve(entry.target);
      }
    }, options);

  // Headlines and chapter heads: fire early — type leads.
  const heads = document.querySelectorAll('[data-reveal-head], [data-reveal-lines]');
  if (heads.length) {
    const obs = makeObserver({ rootMargin: '0px 0px -8% 0px', threshold: [0, 0.5] });
    heads.forEach((el) => obs.observe(el));
  }

  // Body copy and blocks: hold to the reading line.
  const blocks = document.querySelectorAll('[data-reveal]');
  if (blocks.length) {
    const obs = makeObserver({ rootMargin: '0px 0px -12% 0px', threshold: [0.05, 0.5] });
    blocks.forEach((el) => obs.observe(el));
  }
}
