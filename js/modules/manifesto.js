/**
 * Manifesto assembly.
 * The band pins while you scroll it. Across that scroll the connective copy
 * fades out and the capability keywords lift from their place in the sentence
 * and gather into a centered, evenly spaced list. A scroll-scrubbed FLIP.
 *
 * Progressive enhancement: with no JS (or reduced motion) the section is a
 * short, fully legible paragraph and never pins or moves.
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
        if (/^\s+$/.test(tok)) {
          frag.appendChild(document.createTextNode(' '));
        } else {
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
  if (!words.length || !keys.length || reducedMotion) return; // static legible paragraph

  section.classList.add('manifesto--pin');

  const smooth = (a, b, t) => {
    t = (t - a) / (b - a);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t * t * (3 - 2 * t);
  };

  let targets = [];
  const measure = () => {
    keys.forEach((k) => (k.style.transform = ''));
    plains.forEach((w) => (w.style.opacity = ''));
    const sr = stage.getBoundingClientRect();
    const cx = sr.width / 2;
    const cy = sr.height / 2;
    const rects = keys.map((k) => {
      const r = k.getBoundingClientRect();
      return { cx: r.left - sr.left + r.width / 2, cy: r.top - sr.top + r.height / 2, h: r.height };
    });
    const gap = rects[0].h * 1.5; // even list spacing
    const total = gap * (keys.length - 1);
    targets = rects.map((s, i) => ({
      dx: cx - s.cx,
      dy: cy - total / 2 + i * gap - s.cy,
    }));
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const travel = section.offsetHeight - window.innerHeight;
    const p = travel > 0
      ? Math.max(0, Math.min(1, -section.getBoundingClientRect().top / travel))
      : 0;
    const fade = smooth(0.03, 0.4, p);   // connective words dissolve first
    const move = smooth(0.12, 0.72, p);  // keywords gather to the centered list
    const o = (1 - fade).toFixed(3);
    for (let i = 0; i < plains.length; i++) plains[i].style.opacity = o;
    for (let i = 0; i < keys.length; i++) {
      const t = targets[i];
      keys[i].style.transform = `translate(${(t.dx * move).toFixed(1)}px, ${(t.dy * move).toFixed(1)}px)`;
    }
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  measure();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); update(); }, { passive: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measure(); update(); });
  }
}
