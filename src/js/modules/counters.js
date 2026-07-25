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
    if (el._countRaf) cancelAnimationFrame(el._countRaf);
    const target = parseFloat(el.dataset.countTo);
    const decimals = parseInt(el.dataset.countDecimals ?? '0', 10);
    let start = null;

    const tick = (now) => {
      start ??= now;
      const progress = Math.min((now - start) / DURATION, 1);
      el.textContent = (target * easeOutExpo(progress)).toFixed(decimals);
      el._countRaf = progress < 1 ? requestAnimationFrame(tick) : null;
    };

    el._countRaf = requestAnimationFrame(tick);
  };

  // Re-count on every pass: armed while off-screen, fires on entry, re-arms when
  // it leaves — so scrolling back up and down runs the count-up again, not once.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (entry.target._armed !== false) {
            entry.target._armed = false;
            animate(entry.target);
          }
        } else {
          entry.target._armed = true;
        }
      }
    },
    { threshold: 0.6 }
  );

  els.forEach((el) => observer.observe(el));
}
