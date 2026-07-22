/**
 * Manifesto dissolve + gather.
 * As the band scrolls through the viewport (it never pins), the connective
 * copy fades from the top down while the capability keywords lift out of the
 * sentence and gather into a centered, evenly spaced list. Both are driven by
 * the section's own scroll progress, so by the time it reaches the middle of
 * the screen the paragraph has resolved into the centered list, and the page
 * keeps scrolling normally throughout.
 *
 * Progressive enhancement: a legible paragraph with no JS or reduced motion,
 * nothing fades or moves.
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

  const smooth = (a, b, t) => {
    t = (t - a) / (b - a);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t * t * (3 - 2 * t);
  };

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

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    // Progress keyed to the paragraph itself: it stays fully intact until its
    // centre reaches mid-screen (so you can read the whole thing), then the
    // effect runs as it scrolls up past that point.
    const rect = el.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    let p = (vh * 0.5 - mid) / (vh * 0.5);
    p = p < 0 ? 0 : p > 1 ? 1 : p;

    // Keywords gather to the centered column.
    const move = smooth(0.0, 0.62, p);
    for (let i = 0; i < keys.length; i++) {
      const t = targets[i];
      keys[i].style.transform = `translate(${(t.dx * move).toFixed(1)}px, ${(t.dy * move).toFixed(1)}px)`;
    }

    // Connective words dissolve top to bottom, staggered by reading order, and
    // are fully gone by p ~= 0.5 — before the keywords finish gathering (0.62) —
    // so the resolved state is only the clean centered list, never a gathered
    // list sitting over half-faded leftover words.
    const n = plains.length;
    for (let i = 0; i < n; i++) {
      const s = (i / n) * 0.3;
      const f = smooth(s, s + 0.2, p);
      plains[i].style.opacity = (1 - f).toFixed(3);
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
