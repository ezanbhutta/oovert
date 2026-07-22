/**
 * Scroll reveals.
 * Elements opt in via [data-reveal] or [data-reveal-lines]; CSS owns the
 * transitions (and disables them under prefers-reduced-motion), so this
 * module only flags visibility.
 */
export function initReveal() {
  const targets = document.querySelectorAll(
    '[data-reveal], [data-reveal-lines], [data-reveal-head]'
  );
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
  );

  targets.forEach((el) => observer.observe(el));
}
