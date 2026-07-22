/**
 * OOVERT — page colour flow.
 *
 * The whole homepage reads as one surface whose colour eases from cream →
 * lilac → violet → ink as you scroll. This module drives the CSS custom
 * properties the page paints with (--page-bg / --page-fg / …); pageflow.css
 * points the background, text, lines and accents at them.
 *
 * Foreground (text) crosses from dark to light automatically, keyed to the
 * background's luminance, so copy stays legible the whole way down. The update
 * is scroll-linked (rAF-throttled) so it tracks 1:1 with the scrollbar and
 * never animates on its own — safe under reduced motion.
 */
export function initScrollColor() {
  const root = document.documentElement;

  // Background journey: scroll progress (0–1) → colour.
  const STOPS = [
    { p: 0.00, c: [243, 240, 233] }, // cream  (paper)
    { p: 0.28, c: [217, 203, 250] }, // lilac
    { p: 0.52, c: [129, 94, 250] },  // violet (accent)
    { p: 0.80, c: [46, 33, 83] },    // deep indigo
    { p: 1.00, c: [22, 20, 15] },    // ink
  ];
  const INK = [22, 20, 15];
  const PAPER = [243, 240, 233];
  const ACCENT_DEEP = [96, 57, 206];  // dark violet, legible on light grounds
  const ACCENT_INV = [155, 123, 255]; // light violet, legible on dark grounds

  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
  const rnd = (c) => `${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}`;
  const relLum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };

  function bgAt(p) {
    for (let i = 1; i < STOPS.length; i++) {
      if (p <= STOPS[i].p) {
        const a = STOPS[i - 1], b = STOPS[i];
        return mix(a.c, b.c, smooth(a.p, b.p, p));
      }
    }
    return STOPS[STOPS.length - 1].c;
  }

  function paint() {
    const max = (root.scrollHeight - window.innerHeight) || 1;
    const p = clamp01(window.scrollY / max);
    const bg = bgAt(p);
    // Text lightens as the ground darkens. The flip is held late (until the
    // ground is clearly dark) so copy stays crisply dark through the light
    // lilac/violet stretch, then goes light for the deep violet → ink run.
    const light = smooth(0.60, 0.77, 1 - relLum(bg));
    const fg = mix(INK, PAPER, light);
    const accent = mix(ACCENT_DEEP, ACCENT_INV, light);
    const s = root.style;
    s.setProperty('--page-bg', `rgb(${rnd(bg)})`);
    s.setProperty('--page-fg', `rgb(${rnd(fg)})`);
    s.setProperty('--page-fg-soft', `rgba(${rnd(fg)}, 0.64)`);
    s.setProperty('--page-fg-faint', `rgba(${rnd(fg)}, 0.40)`);
    s.setProperty('--page-line', `rgba(${rnd(fg)}, 0.16)`);
    s.setProperty('--page-accent', `rgb(${rnd(accent)})`);
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { paint(); ticking = false; });
  };

  paint();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', paint);
}
