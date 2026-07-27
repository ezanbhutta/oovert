/**
 * Menu overlay (small screens) and chapter-rail state.
 */
export function initNav() {
  initMenuOverlay();
  initChapterRail();
  initHeaderScroll();
  initEnquiryRibbon();
  initProximityGlow();
}

/* Proximity glow — the dull wayfinding lists (footer index/elsewhere and the
   header nav) brighten as the cursor approaches, not only when it lands on a
   link. Each link gets a --lit (0→1) from its distance to the pointer; CSS maps
   that to opacity and colour. Fine pointers only; touch and keyboard fall back
   to the :hover / :focus-visible rules, and no-JS leaves the list at its rest
   opacity. */
function initProximityGlow() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const zones = [
    { root: document.querySelector('.site-foot'), sel: '.site-foot__col a:not(.ai-chip)', range: 150 },
    { root: document.querySelector('.site-head__nav'), sel: 'a', range: 110 },
  ];

  for (const { root, sel, range } of zones) {
    if (!root) continue;
    const links = Array.from(root.querySelectorAll(sel));
    if (!links.length) continue;

    let rects = [];
    let px = 0;
    let py = 0;
    let ticking = false;

    const paint = () => {
      ticking = false;
      rects = links.map((l) => l.getBoundingClientRect());
      for (let i = 0; i < links.length; i++) {
        const r = rects[i];
        // Distance from the pointer to the nearest point of the link's box.
        const dx = px < r.left ? r.left - px : px > r.right ? px - r.right : 0;
        const dy = py < r.top ? r.top - py : py > r.bottom ? py - r.bottom : 0;
        const lit = Math.max(0, 1 - Math.hypot(dx, dy) / range);
        links[i].style.setProperty('--lit', lit.toFixed(3));
      }
    };

    root.addEventListener('pointermove', (e) => {
      px = e.clientX;
      py = e.clientY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(paint);
      }
    });
    root.addEventListener('pointerleave', () => {
      links.forEach((l) => l.style.setProperty('--lit', '0'));
    });
  }
}

/* The persistent invitation — the site's one Start-a-project button. It rides
   down the page from the hero, staying one tap away, and dissolves the moment
   the real Contact section arrives (a bookmark, not a popup). It reads the
   ground it floats over and flips colour to stay legible. */
function initEnquiryRibbon() {
  const ribbon = document.querySelector('[data-cta-ribbon]');
  if (!ribbon) return;
  const contact = document.getElementById('contact');
  const hero = document.querySelector('.hero');
  let contactInView = false;
  let heroInView = true;

  // Read the ground directly beneath the button and flip it to the paper variant
  // over dark sections, so it stays legible as it rides down the page. Walks the
  // stack under its own centre, skips itself and any see-through layer, and
  // decides by luminance — no per-section tagging needed.
  const senseGround = () => {
    const r = ribbon.getBoundingClientRect();
    const stack = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    for (const el of stack) {
      if (ribbon.contains(el)) continue;
      const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
      if (!m) continue;
      const alpha = m[3] === undefined ? 1 : parseFloat(m[3]);
      if (alpha < 0.5) continue; // see-through — keep looking behind it
      const lum = (0.2126 * +m[0] + 0.7152 * +m[1] + 0.0722 * +m[2]) / 255;
      ribbon.classList.toggle('cta-ribbon--on-dark', lum < 0.5);
      return;
    }
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const menuOpen = document.body.classList.contains('menu-open');
    // Hold it back until the hero is genuinely leaving. It is a fixed element,
    // and on a phone the hero fills the viewport all the way to the bottom
    // margin, so showing it at rest lands it on top of the lede's last line.
    const visible = !heroInView && !contactInView && !menuOpen;
    ribbon.classList.toggle('is-visible', visible);
    if (visible) senseGround();
  };
  window.addEventListener(
    'scroll',
    () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } },
    { passive: true }
  );

  if (contact) {
    new IntersectionObserver(
      (entries) => { contactInView = entries[0].isIntersecting; update(); },
      { rootMargin: '0px 0px -15% 0px' }
    ).observe(contact);
  }
  if (hero) {
    // -70% bottom margin: "in view" ends once the hero has scrolled up far
    // enough that only its top third is left, which is where the ribbon can
    // appear without landing on hero copy at any width.
    new IntersectionObserver(
      (entries) => { heroInView = entries[0].isIntersecting; update(); },
      { rootMargin: '0px 0px -70% 0px' }
    ).observe(hero);
  } else {
    heroInView = false;
  }
  update();
}

/* Header obeys scroll direction: hides going down (only past the hero floor),
   returns the moment you scroll up, compresses once the page is underway.
   8px delta kills jitter at direction flips; focus always brings it back. */
function initHeaderScroll() {
  const head = document.querySelector('.site-head');
  if (!head) return;
  const DELTA = 8;
  const HIDE_FLOOR = 160;
  const COMPRESS_AT = 80;
  let lastY = Math.max(0, window.scrollY);
  let ticking = false;

  const update = () => {
    const y = Math.max(0, window.scrollY); // clamp: rubber-band guard
    head.classList.toggle('site-head--scrolled', y > COMPRESS_AT);
    if (Math.abs(y - lastY) > DELTA) {
      const hide =
        y > lastY && y > HIDE_FLOOR && !document.body.classList.contains('menu-open');
      head.classList.toggle('site-head--hidden', hide);
      lastY = y;
    }
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  // Keyboard users always get the header back.
  head.addEventListener('focusin', () => head.classList.remove('site-head--hidden'));
}

function initMenuOverlay() {
  const button = document.querySelector('.site-head__menu');
  const overlay = document.getElementById('menu-overlay');
  if (!button || !overlay) return;

  const label = button.querySelector('.site-head__menu-label');
  const links = overlay.querySelectorAll('a');
  // Header stays interactive (it holds the Close button); everything else
  // behind the dialog goes inert.
  const background = document.querySelectorAll('main, footer, .chapter-rail, .skip-link');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setOpen = (open) => {
    if (open) {
      overlay.classList.remove('is-closing');
      overlay.hidden = false;
    } else if (reducedMotion.matches || overlay.hidden) {
      overlay.hidden = true;
    } else {
      // Animated close: fast whole-panel fade, then actually hide.
      overlay.classList.add('is-closing');
      const finish = () => {
        overlay.hidden = true;
        overlay.classList.remove('is-closing');
      };
      overlay.addEventListener('animationend', finish, { once: true });
      setTimeout(finish, 400); // fallback if the animation never fires
    }
    button.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    background.forEach((el) =>
      open ? el.setAttribute('inert', '') : el.removeAttribute('inert')
    );
    // The visual Menu/Close roll is CSS-driven off body.menu-open; keep the
    // plain-text swap only for labels without the stacked-span markup.
    if (label && !label.firstElementChild) label.textContent = open ? 'Close' : 'Menu';
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
      e.preventDefault();
      const next =
        index === -1
          ? (e.shiftKey ? cycle[cycle.length - 1] : cycle[0])
          : e.shiftKey
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
