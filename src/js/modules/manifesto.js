/**
 * Manifesto dissolve + gather.
 * The paragraph reads as a normal, static block. When it scrolls into view it
 * holds for a beat (fully readable), then the connective words dissolve top to
 * bottom while the capability keywords glide into a centred column. This plays
 * as a self-contained, TIMED animation — it is not tied to scroll, so the page
 * never pins or locks; you scroll freely throughout. It re-arms when the band
 * leaves the viewport, so it replays on the next visit.
 *
 * Progressive enhancement: with no JS or reduced motion it stays a plain,
 * legible paragraph — nothing fades or moves.
 */
export function initManifesto({ reducedMotion } = {}) {
  const section = document.querySelector('.manifesto');
  const el = document.querySelector('[data-manifesto]');
  if (!section || !el) return;
  const stage = section.querySelector('.manifesto__stage') || section;

  // Split text nodes into words; keep marked keywords / <em> whole.
  const nodes = [...el.childNodes];
  const frag = document.createDocumentFragment();
  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      for (const tok of node.textContent.split(/(\s+)/)) {
        if (tok === '') continue;
        if (/^\s+$/.test(tok)) frag.appendChild(document.createTextNode(' '));
        else {
          const s = document.createElement('span');
          s.className = 'mf-word';
          s.textContent = tok;
          frag.appendChild(s);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.classList.add('mf-word');
      frag.appendChild(node);
      frag.appendChild(document.createTextNode(' '));
    }
  }
  el.textContent = '';
  el.appendChild(frag);

  const words = [...el.querySelectorAll('.mf-word')];
  const keys = words.filter((w) => w.classList.contains('mf-key'));
  const plains = words.filter((w) => !w.classList.contains('mf-key'));
  if (!words.length || reducedMotion) return;

  const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
  const smooth = (a, b, t) => {
    t = clamp01((t - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // Target: an evenly spaced, centered column inside the stage.
  let targets = [];
  const measure = () => {
    keys.forEach((k) => (k.style.transform = ''));
    const sr = stage.getBoundingClientRect();
    const cx = sr.width / 2;
    const cy = sr.height / 2;
    const rects = keys.map((k) => {
      const r = k.getBoundingClientRect();
      return { cx: r.left - sr.left + r.width / 2, cy: r.top - sr.top + r.height / 2, h: r.height };
    });
    const gap = rects[0].h * 1.5;
    const total = gap * (keys.length - 1);
    targets = rects.map((s, i) => ({ dx: cx - s.cx, dy: cy - total / 2 + i * gap - s.cy }));
  };

  // Render the effect at progress p (0 = full paragraph, 1 = keyword column).
  let lastP = 0;
  const render = (p) => {
    lastP = p;
    const move = smooth(0.0, 0.62, p);
    for (let i = 0; i < keys.length; i++) {
      const t = targets[i];
      keys[i].style.transform = `translate(${(t.dx * move).toFixed(1)}px, ${(t.dy * move).toFixed(1)}px)`;
    }
    // Connective words dissolve top to bottom, staggered, gone by p ~= 0.5 —
    // before the keywords finish gathering (0.62) — so the resolved state is
    // only the clean centered list, never a gathered list over faded leftovers.
    const n = plains.length;
    for (let i = 0; i < n; i++) {
      const s = (i / n) * 0.3;
      const f = smooth(s, s + 0.2, p);
      plains[i].style.opacity = (1 - f).toFixed(3);
    }
  };

  // Timed play, fully decoupled from scroll. HOLD keeps the paragraph readable
  // before anything moves; then p eases 0 -> 1 over DURATION.
  const HOLD = 900; // ms the full paragraph holds before it starts
  const DURATION = 2600; // ms of the dissolve + gather
  let rafId = null;
  let start = null;
  let playing = false;
  const step = (ts) => {
    if (start === null) start = ts;
    const elapsed = ts - start;
    if (elapsed < HOLD) {
      rafId = requestAnimationFrame(step);
      return;
    }
    const t = clamp01((elapsed - HOLD) / DURATION);
    render(easeInOut(t));
    if (t < 1) rafId = requestAnimationFrame(step);
    else {
      rafId = null;
      playing = false;
    }
  };
  const play = () => {
    if (playing || lastP > 0) return; // already running or already resolved
    playing = true;
    start = null;
    rafId = requestAnimationFrame(step);
  };
  const reset = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    start = null;
    playing = false;
    render(0);
  };

  measure();
  render(0);

  // Play once the band is well into view; re-arm when it fully leaves so it
  // replays on the next visit. No scroll listener — nothing is scroll-driven.
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio >= 0.6) play();
        else if (!e.isIntersecting) reset();
      }
    },
    { threshold: [0, 0.6] }
  );
  io.observe(el);

  window.addEventListener('resize', () => { measure(); render(lastP); }, { passive: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measure(); render(lastP); });
  }
}
