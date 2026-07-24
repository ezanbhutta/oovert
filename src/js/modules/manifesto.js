/**
 * Manifesto dissolve + gather — scroll-scrubbed.
 * The stage pins to the viewport so the whole paragraph stays visible, and your
 * scroll position drives the effect directly: as you scroll, the connective
 * words dissolve top to bottom and THEN the capability keywords glide into a
 * centred column. It's sequenced (fade fully, then gather) so no half-faded
 * word is ever left sitting under the moving keywords. There is no dead "hold":
 * every bit of scroll moves something, so it reads as scrubbing, not locking.
 *
 * Progressive enhancement: with no JS or reduced motion it stays a plain,
 * legible paragraph — nothing pins, fades, or moves.
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

  // Pin the stage so the whole paragraph stays on screen while scroll scrubs the
  // effect. The tall-section CSS is gated on this class, so no-JS / reduced
  // motion stays a normal, static, readable band.
  section.classList.add('manifesto--pinned');

  const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
  const smooth = (a, b, t) => {
    t = clamp01((t - a) / (b - a));
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
    // Progress scrubbed by scroll: 0 the moment the stage pins to the top of the
    // viewport, 1 as it releases. No hold — the effect tracks scroll one-to-one,
    // so scrolling always visibly moves the words (never a locked, dead stretch).
    const r = section.getBoundingClientRect();
    const travel = section.offsetHeight - vh;
    const p = travel > 0 ? clamp01(-r.top / travel) : 0;

    // Approach bridge: as the band nears, the room dims — the ground mixes
    // paper -> ink in OKLab (sRGB goes muddy mid-way) while the violet field
    // fades up with it. The dim completes within the first 38% of approach,
    // before the copy is on screen, so text never sits on a half-mixed
    // ground. Scrubbed and reversible, like everything else here.
    const bg = section.querySelector('.manifesto__bg');
    if (r.top > 0) {
      const q = clamp01((vh - r.top) / (vh * 0.38));
      if (q >= 1) {
        section.style.backgroundColor = '';
        if (bg) bg.style.opacity = '';
      } else {
        section.style.backgroundColor =
          `color-mix(in oklab, var(--paper), var(--ink) ${(q * 100).toFixed(1)}%)`;
        if (bg) bg.style.opacity = q.toFixed(3);
      }
    } else if (section.style.backgroundColor) {
      section.style.backgroundColor = '';
      if (bg) bg.style.opacity = '';
    }

    // 1) Connective words dissolve top to bottom, fully gone by p ~= 0.46.
    const n = plains.length;
    for (let i = 0; i < n; i++) {
      const s = (i / n) * 0.28;
      const f = smooth(s, s + 0.18, p);
      plains[i].style.opacity = (1 - f).toFixed(3);
    }
    // 2) Keywords gather ONLY after the grey has cleared (0.46 -> 0.98), so the
    //    two phases never overlap — every scrubbed frame is a clean state.
    const move = smooth(0.46, 0.98, p);
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
