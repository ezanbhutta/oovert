/**
 * Hero construction field — the drafting table under the headline.
 *
 * The brand's own logic, made live: a scatter of eclipse pairs (the double-o)
 * drawn as hairline construction circles on the paper, the way a mark is
 * actually built. At rest each pair sits out of register, its two circles
 * offset and faint. Move the pointer and the pairs nearest it RESOLVE: they
 * brighten, their construction ticks appear, and the offset closes until the
 * circles sit in true alignment. Move away and they drift back out of
 * register. It is the same gesture as the header mark realigning on hover,
 * scaled up into the room behind the type, so the background says "logos are
 * constructed" without a single word or image.
 *
 * Constraints it respects, because the hero is the most-seen frame on the site:
 * hairline ink at very low alpha so the headline never loses contrast; one
 * canvas, no dependency; the loop runs only while the hero is on screen and
 * the tab is visible, and stops entirely once every pair is at rest; a still,
 * composed frame under reduced motion or without a fine pointer.
 */
export function initHeroMarks({ reducedMotion } = {}) {
  const canvas = document.querySelector('.hero__marks');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const hero = canvas.closest('.hero');
  if (!hero) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Deterministic scatter: a fixed layout reads as composition, a random one
     reads as noise, and it stays identical between visits. Values are
     fractions of the hero box so the field reflows with it. */
  const PAIRS = [
    { x: 0.16, y: 0.24, r: 0.20, gap: 0.42, tilt: -0.22 },
    { x: 0.78, y: 0.18, r: 0.28, gap: 0.34, tilt: 0.14 },
    { x: 0.62, y: 0.72, r: 0.16, gap: 0.50, tilt: 0.38 },
    { x: 0.30, y: 0.82, r: 0.23, gap: 0.30, tilt: -0.10 },
    { x: 0.90, y: 0.56, r: 0.13, gap: 0.55, tilt: 0.26 },
    { x: 0.46, y: 0.38, r: 0.34, gap: 0.26, tilt: -0.30 },
  ];

  const REST = 0.055;   // alpha of a pair sitting out of register
  const LIT = 0.20;     // alpha of a pair fully resolved under the pointer
  const REACH = 0.34;   // pointer influence radius, as a fraction of hero width

  let w = 0, h = 0, dpr = 1, unit = 0;
  let pointer = { x: -9999, y: -9999, on: false };
  let raf = null, running = false, visible = true, onScreen = true;

  const pairs = PAIRS.map((p) => ({ ...p, k: 0, target: 0 }));

  const size = () => {
    const r = hero.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width));
    h = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2); // 2 is plenty; 3 just burns fill rate
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    unit = Math.min(w, h);
  };

  /* One pair. k is how resolved it is, 0 (out of register, faint) to 1 (in
     true alignment, lit, with its construction ticks showing). */
  const drawPair = (p) => {
    const cx = p.x * w;
    const cy = p.y * h;
    const R = p.r * unit * 0.5;
    const spread = R * p.gap * (1 - p.k); // closes to zero as it resolves
    const dx = Math.cos(p.tilt) * spread;
    const dy = Math.sin(p.tilt) * spread;
    const a = REST + (LIT - REST) * p.k;

    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(22, 20, 15, ${a.toFixed(4)})`;
    ctx.beginPath();
    ctx.arc(cx - dx, cy - dy, R, 0, Math.PI * 2);
    ctx.stroke();

    // The second ring carries the brand violet, so resolving reads as the mark
    // finding itself rather than as a generic glow.
    ctx.strokeStyle = `rgba(129, 94, 250, ${(a * 1.15).toFixed(4)})`;
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, R, 0, Math.PI * 2);
    ctx.stroke();

    if (p.k > 0.01) {
      // Construction marks: the axis through the pair and ticks at the poles,
      // fading up only as the pair comes into register.
      const t = p.k;
      ctx.strokeStyle = `rgba(22, 20, 15, ${(0.14 * t).toFixed(4)})`;
      ctx.beginPath();
      ctx.moveTo(cx - R * 1.5, cy);
      ctx.lineTo(cx + R * 1.5, cy);
      ctx.moveTo(cx, cy - R * 1.22);
      ctx.lineTo(cx, cy - R * 0.86);
      ctx.moveTo(cx, cy + R * 0.86);
      ctx.lineTo(cx, cy + R * 1.22);
      ctx.stroke();

      ctx.fillStyle = `rgba(96, 57, 206, ${(0.5 * t).toFixed(4)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const paint = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of pairs) drawPair(p);
  };

  const frame = () => {
    raf = null;
    let moving = false;

    for (const p of pairs) {
      if (pointer.on) {
        const d = Math.hypot(p.x * w - pointer.x, p.y * h - pointer.y);
        const reach = REACH * w;
        // Smoothstep falloff: a hard cutoff would pop as the pointer crosses.
        const t = Math.max(0, Math.min(1, 1 - d / reach));
        p.target = t * t * (3 - 2 * t);
      } else {
        p.target = 0;
      }
      const diff = p.target - p.k;
      if (Math.abs(diff) > 0.001) {
        p.k += diff * 0.09; // critically damped enough to feel like weight, not lag
        moving = true;
      } else {
        p.k = p.target;
      }
    }

    paint();

    // Stop the loop the moment nothing is animating; a hero that quietly burns
    // a rAF forever is the kind of thing that shows up as battery drain.
    if (moving && running) raf = requestAnimationFrame(frame);
    else running = false;
  };

  const kick = () => {
    if (reducedMotion || !fine) return;
    if (!onScreen || !visible) return;
    if (!running) {
      running = true;
      raf = requestAnimationFrame(frame);
    }
  };

  const onMove = (e) => {
    const r = hero.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.on = true;
    kick();
  };

  const onLeave = () => {
    pointer.on = false;
    kick();
  };

  size();
  paint();

  if (!reducedMotion && fine) {
    hero.addEventListener('pointermove', onMove, { passive: true });
    hero.addEventListener('pointerleave', onLeave, { passive: true });
  }

  let rt = null;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        size();
        paint();
      }, 120);
    },
    { passive: true }
  );

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) kick();
    else if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
      running = false;
    }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) kick();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
          running = false;
        }
      },
      { threshold: 0 }
    ).observe(hero);
  }
}
