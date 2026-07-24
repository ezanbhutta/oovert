/**
 * Hero light field.
 * A whisper of drifting luminance on the ivory ground: the same flow-field
 * idea as the manifesto, but a high-key paper/violet/gold palette kept light
 * enough that the black headline never loses contrast. Drifts on its own and
 * shifts gently as you scroll the hero. Canvas 2D, no dependency.
 *
 * Runs only while the hero is on screen and the tab is visible; paints a
 * single still frame under reduced motion.
 */
export function initHeroField({ reducedMotion } = {}) {
  const canvas = document.querySelector('.hero__bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true; // idempotent context flag — set once, not per frame
  const hero = canvas.closest('.hero');

  const LW = 80;
  const LH = 48;
  const buf = document.createElement('canvas');
  buf.width = LW;
  buf.height = LH;
  const bctx = buf.getContext('2d');
  const img = bctx.createImageData(LW, LH);
  // Alpha is always opaque and never changes — seed it once instead of writing
  // it for every pixel on every frame.
  for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255;

  // High-key palette: paper -> pale violet -> warm ivory -> soft violet.
  const stops = [
    [243, 240, 233],
    [224, 214, 241],
    [241, 232, 214],
    [208, 192, 238],
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
    const r = hero.getBoundingClientRect();
    scroll = Math.max(0, Math.min(1, -r.top / (r.height || window.innerHeight)));
  };

  const draw = (time) => {
    computeScroll();
    const t = (reducedMotion ? 0.4 : time * 0.0001) + (reducedMotion ? 0 : scroll * 0.6);
    const d = img.data;
    for (let y = 0; y < LH; y++) {
      for (let x = 0; x < LW; x++) {
        const u = x / LW;
        const w = y / LH;
        const wx = Math.sin(w * 2.6 + t * 0.8) * 0.5 + Math.sin(u * 1.8 - t * 0.4) * 0.35;
        const wy = Math.cos(u * 2.8 - t * 0.6) * 0.5;
        let n =
          Math.sin((u * 2.8 + wx) * 1.4 + t) +
          Math.sin((w * 2.4 + wy) * 1.5 - t * 0.7) +
          Math.sin(((u + w) * 2.0 + wx + wy) + t * 0.5);
        n = (n / 3) * 0.5 + 0.5;
        const c = palette(n);
        const idx = (y * LW + x) * 4;
        d[idx] = c[0];
        d[idx + 1] = c[1];
        d[idx + 2] = c[2];
      }
    }
    bctx.putImageData(img, 0, 0);
    ctx.drawImage(buf, 0, 0, canvas.width, canvas.height);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.3);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  };

  let raf = 0;
  let visible = true;
  const loop = (time) => {
    draw(time);
    if (visible && !reducedMotion) raf = requestAnimationFrame(loop);
  };

  resize();
  window.addEventListener('resize', () => { resize(); if (reducedMotion || !visible) draw(performance.now()); }, { passive: true });

  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      if (!visible) { cancelAnimationFrame(raf); return; }
      if (reducedMotion) draw(0);
      else { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    },
    { threshold: 0 }
  );
  io.observe(hero);

  if (!reducedMotion) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (visible) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    });
  } else {
    draw(0);
  }
}
