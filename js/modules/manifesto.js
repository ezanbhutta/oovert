/**
 * Manifesto reading reveal.
 * Splits the manifesto copy into per-word spans (keeping marked keywords whole)
 * and lights each word as it rises through a reading band in the viewport, so
 * the paragraph resolves the way you read it. Keywords ignite in the accent.
 *
 * Progressive enhancement: without JS the copy is fully legible; under reduced
 * motion the words are lit immediately and never scrubbed.
 */
export function initManifesto({ reducedMotion } = {}) {
  const el = document.querySelector('[data-manifesto]');
  if (!el) return;

  // Split text nodes into words; keep element children (keywords, <em>) whole.
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
  if (!words.length) return;

  if (reducedMotion) {
    words.forEach((w) => w.style.setProperty('--lit', '1'));
    return;
  }

  let centers = [];
  const measure = () => {
    const sy = window.scrollY;
    centers = words.map((w) => {
      const r = w.getBoundingClientRect();
      return r.top + sy + r.height / 2;
    });
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const bot = vh * 0.82; // words below this are still dim
    const top = vh * 0.42; // words above this are fully lit
    const sy = window.scrollY;
    for (let i = 0; i < words.length; i++) {
      const y = centers[i] - sy;
      let lit = (bot - y) / (bot - top);
      lit = lit < 0 ? 0 : lit > 1 ? 1 : lit;
      words[i].style.setProperty('--lit', lit.toFixed(3));
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
  // Re-measure once fonts settle (metrics shift line wrapping).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measure(); update(); });
  }
}
