/**
 * Manifesto dissolve.
 * As the band scrolls past, the connective copy fades from the top down while
 * the capability keywords stay lit. Scroll-linked, never pins: the page keeps
 * moving normally. A fixed fade window in the upper-middle of the viewport
 * sweeps down the text as you scroll, so words dissolve top to bottom.
 *
 * Progressive enhancement: with no JS (or reduced motion) it's a legible
 * paragraph and nothing fades.
 */
export function initManifesto({ reducedMotion } = {}) {
  const el = document.querySelector('[data-manifesto]');
  if (!el) return;

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
  // Only the connective words dissolve; the keywords stay lit.
  const plains = words.filter((w) => !w.classList.contains('mf-key'));
  if (!plains.length || reducedMotion) return;

  let centers = [];
  const measure = () => {
    const sy = window.scrollY;
    centers = plains.map((w) => {
      const r = w.getBoundingClientRect();
      return r.top + sy + r.height / 2;
    });
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const solid = vh * 0.62; // below this line, fully visible
    const gone = vh * 0.36;  // above this line, fully faded
    const sy = window.scrollY;
    for (let i = 0; i < plains.length; i++) {
      const y = centers[i] - sy;
      let o = (y - gone) / (solid - gone);
      o = o < 0 ? 0 : o > 1 ? 1 : o;
      plains[i].style.opacity = o.toFixed(3);
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
