/**
 * Stat count-ups for [data-count-to]. Markup ships with the final value,
 * so no JS (or reduced motion) means the number is simply already there.
 */
const DURATION = 1400;

export function initCounters({ reducedMotion }) {
  if (reducedMotion) return;

  const els = document.querySelectorAll('[data-count-to]');
  if (!els.length) return;

  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const animate = (el) => {
    const target = parseFloat(el.dataset.countTo);
    const decimals = parseInt(el.dataset.countDecimals ?? '0', 10);
    let start = null;

    const tick = (now) => {
      start ??= now;
      const progress = Math.min((now - start) / DURATION, 1);
      el.textContent = (target * easeOutExpo(progress)).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.6 }
  );

  els.forEach((el) => observer.observe(el));
}
