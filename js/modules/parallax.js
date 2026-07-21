/**
 * Scroll parallax for [data-parallax="speed"].
 *
 * Elements inside the sticky case deck are measured against their card's
 * position in normal flow (deck top + accumulated heights), not the sticky
 * box — so the drift continues while a card is pinned instead of freezing.
 * All rect reads happen before any transform writes; transform-only,
 * rAF-throttled.
 */
export function initParallax() {
  const els = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!els.length) return;

  const deck = document.querySelector('.deck');
  let flowTops = new Map();

  const measure = () => {
    flowTops = new Map();
    if (!deck) return;
    let acc = 0;
    for (const card of deck.children) {
      flowTops.set(card, acc);
      acc += card.offsetHeight;
    }
  };

  const items = els.map((el) => ({
    el,
    speed: parseFloat(el.dataset.parallax) || 0.1,
    card: el.closest('.case'),
    anchor: el.parentElement ?? el,
  }));

  let raf = null;

  const update = () => {
    raf = null;
    const mid = window.innerHeight / 2;
    const deckTop = deck ? deck.getBoundingClientRect().top : 0;

    // Read phase
    const offsets = items.map(({ card, anchor, speed }) => {
      if (card && flowTops.has(card)) {
        const top = deckTop + flowTops.get(card);
        return (top + card.offsetHeight / 2 - mid) * speed;
      }
      const rect = anchor.getBoundingClientRect();
      return (rect.top + rect.height / 2 - mid) * speed;
    });

    // Write phase
    items.forEach(({ el }, i) => {
      el.style.transform = `translate3d(0, ${offsets[i].toFixed(1)}px, 0)`;
    });
  };

  const request = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  measure();
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener(
    'resize',
    () => {
      measure();
      request();
    },
    { passive: true }
  );
  request();
}
