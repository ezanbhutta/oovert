/**
 * Live timezone clocks. Any [data-clock][data-tz] element gets its local time
 * in that IANA zone, refreshed every 15s. Fails soft to --:-- on an unknown
 * zone. No-JS shows the markup's static fallback.
 */
export function initClocks() {
  const clocks = document.querySelectorAll('[data-clock][data-tz]');
  if (!clocks.length) return;

  const fmt = (tz) =>
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: tz,
    });

  const tick = () => {
    const now = new Date();
    clocks.forEach((el) => {
      try {
        el.textContent = fmt(el.dataset.tz).format(now);
      } catch (e) {
        el.textContent = '--:--';
      }
    });
  };

  tick();
  setInterval(tick, 15000);
}
