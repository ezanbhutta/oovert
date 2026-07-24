/**
 * Living backdrop for the manifesto band.
 * A slow, domain-warped flow field mapped through OOVERT's ink -> violet
 * palette, drawn to a small offscreen buffer and upscaled (the browser's
 * bilinear pass does the smoothing), so it stays cheap. It drifts on its own
 * and shifts as the section scrolls through the viewport.
 *
 * Only runs while the section is on screen and the tab is visible. Under
 * reduced motion it paints a single still frame. No WebGL, no dependency.
 */
export function initBackdrop({ reducedMotion } = {}) {
  const canvas = document.querySelector('.manifesto__bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true; // idempotent context flag — set once, not per frame
  const section = canvas.closest('.manifesto');

  const LW = 96;
  const LH = 56;
  const buf = document.createElement('canvas');
  buf.width = LW;
  buf.height = LH;
  const bctx = buf.getContext('2d');
  const img = bctx.createImageData(LW, LH);
  // Alpha is always opaque and never changes — seed it once, not per pixel per frame.
  for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255;

  // ink -> deep violet -> violet -> pale violet
  const stops = [
    [22, 20, 15],
    [40, 22, 104],
    [96, 66, 214],
    [190, 172, 255],
  ];
  const palette = (v) => {
    v = v < 0 ? 0 : v > 0.999 ? 0.999 : v;
    const f = v * (stops.length - 1);
    const i = Math.floor(f);
    const t = f - i;
    const a = stops[i];
    const b = stops[i + 1];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  };

  let scroll = 0;
  const computeScroll = () => {
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    scroll = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
  };

  const draw = (time) => {
    computeScroll();
    const t = (reducedMotion ? 0.6 : time * 0.00016) + (reducedMotion ? 0 : scroll * 1.15);
    const d = img.data;
    for (let y = 0; y < LH; y++) {
      for (let x = 0; x < LW; x++) {
        const u = x / LW;
        const w = y / LH;
        const wx = Math.sin(w * 3.0 + t * 0.9) * 0.6 + Math.sin(u * 2.0 - t * 0.5) * 0.4;
        const wy = Math.cos(u * 3.2 - t * 0.7) * 0.6;
        let n =
          Math.sin((u * 3.4 + wx) * 1.6 + t) +
          Math.sin((w * 3.0 + wy) * 1.8 - t * 0.8) +
          Math.sin(((u + w) * 2.4 + wx + wy) + t * 0.6);
        n = (n / 3) * 0.5 + 0.5;
        n = Math.pow(n, 1.5); // bias dark so the type stays legible
        const c = palette(n);
        const vig = 1 - 0.55 * Math.hypot(u - 0.5, w - 0.5);
        const k = (0.5 + 0.5 * vig) * 0.92;
        const idx = (y * LW + x) * 4;
        d[idx] = c[0] * k;
        d[idx + 1] = c[1] * k;
        d[idx + 2] = c[2] * k;
      }
    }
    bctx.putImageData(img, 0, 0);
    ctx.drawImage(buf, 0, 0, canvas.width, canvas.height);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.4);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  };

  let raf = 0;
  let visible = false;
  const loop = (time) => {
    draw(time);
    if (visible && !reducedMotion) raf = requestAnimationFrame(loop);
  };
  const start = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  };
  const stop = () => cancelAnimationFrame(raf);

  resize();
  window.addEventListener('resize', () => { resize(); if (!visible || reducedMotion) draw(performance.now()); }, { passive: true });

  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      if (!visible) { stop(); return; }
      if (reducedMotion) draw(0);
      else start();
    },
    { threshold: 0 }
  );
  io.observe(section);

  if (!reducedMotion) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (visible) start();
    });
  }
}
