/**
 * The process spine (Approach page).
 * A hairline in the left gutter draws itself as the four phases scroll past.
 * We write two custom properties on the <ol>: --spine (0→1, the drawn fraction,
 * consumed by the accent rail's scaleY) and --spine-y (px, the draw-head's
 * offset from the rail top). A small lit flag fades the head in/out at the ends.
 *
 * Scroll-linked and rAF-throttled — the wheel owns the motion, no easing lag.
 * Under reduced motion the rail is pinned fully drawn and the head is hidden
 * (the CSS node only renders inside a no-preference query).
 */
export function initSpine({ reducedMotion } = {}) {
  const spine = document.querySelector('.approach-spine');
  if (!spine) return;

  if (reducedMotion) {
    spine.style.setProperty('--spine', '1');
    return;
  }

  // A node element rides the tip of the fill. Injected here so no-JS markup
  // stays clean and the element never exists when the module can't drive it.
  const node = document.createElement('span');
  node.className = 'approach-spine__node';
  node.setAttribute('aria-hidden', 'true');
  spine.appendChild(node);

  let ticking = false;

  // Causality: the draw-head IGNITES each phase as it passes it. Phase offsets
  // are cached (measured on init and resize, never per frame) and each phase
  // gets .is-struck the moment the head crosses its marker — so the number
  // lighting up is visibly caused by the line reaching it, not a coincidence
  // of separate scroll observers. Struck state re-arms when the head retreats,
  // matching the site-wide replay-every-pass rule.
  const phases = Array.from(spine.querySelectorAll('.phase'));
  let phaseTops = [];
  const struck = phases.map(() => false);
  const measure = () => {
    phaseTops = phases.map((ph) => ph.offsetTop + 24); // strike just below the top rule
  };
  measure();

  const update = () => {
    ticking = false;
    const rect = spine.getBoundingClientRect();
    const vh = window.innerHeight;

    // The rail spans from --space-8 below the element top to its bottom. We
    // approximate the drawable span as the element height; the small top pad is
    // visually negligible against a multi-screen spine.
    const railTop = rect.top;
    const railHeight = rect.height;

    // Draw begins when the spine top passes 82% of the viewport and completes a
    // little before its bottom reaches the middle — so the last move lights up
    // while it is still comfortably on screen.
    const start = vh * 0.82;
    const drawn = start - railTop;
    let p = drawn / (railHeight * 0.82);
    p = Math.max(0, Math.min(1, p));

    spine.style.setProperty('--spine', p.toFixed(4));
    const headY = p * railHeight;
    spine.style.setProperty('--spine-y', headY.toFixed(1) + 'px');
    // Head visible only while actively drawing between the ends.
    spine.style.setProperty('--spine-lit', p > 0.002 && p < 0.998 ? '1' : '0');

    for (let i = 0; i < phases.length; i++) {
      const hit = headY >= phaseTops[i];
      if (hit !== struck[i]) {
        struck[i] = hit;
        phases[i].classList.toggle('is-struck', hit);
      }
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener(
    'resize',
    () => {
      measure();
      onScroll();
    },
    { passive: true }
  );
  update();
}
