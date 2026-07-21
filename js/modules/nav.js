/**
 * Menu overlay (small screens) and chapter-rail state.
 */
export function initNav() {
  initMenuOverlay();
  initChapterRail();
}

function initMenuOverlay() {
  const button = document.querySelector('.site-head__menu');
  const overlay = document.getElementById('menu-overlay');
  if (!button || !overlay) return;

  const label = button.querySelector('.site-head__menu-label');
  const links = overlay.querySelectorAll('a');

  const setOpen = (open) => {
    overlay.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (label) label.textContent = open ? 'Close' : 'Menu';
    if (open) links[0]?.focus();
  };

  button.addEventListener('click', () => setOpen(overlay.hidden));

  links.forEach((link) => link.addEventListener('click', () => setOpen(false)));

  document.addEventListener('keydown', (e) => {
    if (overlay.hidden) return;

    if (e.key === 'Escape') {
      setOpen(false);
      button.focus();
      return;
    }

    // Keep focus cycling between the toggle button and the overlay links.
    if (e.key === 'Tab') {
      const cycle = [button, ...links];
      const index = cycle.indexOf(document.activeElement);
      if (index === -1) return;
      e.preventDefault();
      const next = e.shiftKey
        ? cycle[(index - 1 + cycle.length) % cycle.length]
        : cycle[(index + 1) % cycle.length];
      next.focus();
    }
  });
}

function initChapterRail() {
  const rail = document.querySelector('.chapter-rail');
  if (!rail) return;

  const links = Array.from(rail.querySelectorAll('a'));
  const byId = new Map(
    links.map((link) => [link.getAttribute('href').slice(1), link])
  );

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((l) => l.classList.remove('is-active'));
        byId.get(entry.target.id)?.classList.add('is-active');
      }
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}
