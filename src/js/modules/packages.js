/**
 * Packages — segmented tabs over an editorial pricing ledger.
 * The three pricing families (one-time / retainer / staff-aug) share one ledger;
 * a segmented control swaps between them, one panel at a time, defaulting to
 * one-time projects. Follows the ARIA tabs pattern (roving tabindex, arrow /
 * Home / End keys). Within a panel each plan is a ledger row that expands to
 * reveal its full scope — a native-button accordion (aria-expanded / controls),
 * with collapsed panels made `inert` so hidden CTAs never take focus.
 *
 * Progressive enhancement: with no JS the tab control stays hidden and every
 * panel — and every row — is fully open, so all pricing stays reachable.
 */
export function initPackages({ reducedMotion } = {}) {
  const section = document.querySelector('.packages');
  if (!section) return;

  initLedger(section);

  const tablist = section.querySelector('.pkg-tabs');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return;
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));

  const animateIn = (panel) => {
    if (reducedMotion || !panel) return;
    panel.querySelectorAll('.ledger-row').forEach((row, i) => {
      row.animate(
        [
          { opacity: 0, transform: 'translateY(16px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 520, delay: i * 70, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' }
      );
    });
  };

  const activate = (tab, { focus = false, animate = true } = {}) => {
    const idx = tabs.indexOf(tab);
    tabs.forEach((t, i) => {
      const on = i === idx;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle('is-active', on);
      if (panels[i]) panels[i].classList.toggle('is-active', on);
    });
    if (animate) animateIn(panels[idx]);
    if (focus) tab.focus();
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activate(tab));
  });

  tablist.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    let n = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    if (n === null) return;
    e.preventDefault();
    activate(tabs[n], { focus: true });
  });

  // Normalise state (aria / tabindex) without animating on load.
  const active = tabs.find((t) => t.classList.contains('is-active')) || tabs[0];
  activate(active, { animate: false });

  // Rise the default panel in the first time the section reaches the viewport.
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animateIn(panels[tabs.indexOf(active)]);
          obs.disconnect();
        }
      }
    }, { threshold: 0.15 });
    io.observe(section);
  }
}

/**
 * Ledger rows — accordion behaviour. The recommended tier ships open (its markup
 * carries `.is-open`); every other row starts collapsed. A collapsed panel is
 * marked `inert` so its CTA and links stay out of the tab order and a11y tree
 * until the row is opened.
 */
function initLedger(section) {
  const rows = [...section.querySelectorAll('.ledger-row')];
  rows.forEach((row) => {
    const head = row.querySelector('.ledger-row__head');
    const panel = row.querySelector('.ledger-row__panel');
    if (!head || !panel) return;

    const setOpen = (open) => {
      row.classList.toggle('is-open', open);
      head.setAttribute('aria-expanded', String(open));
      panel.inert = !open;
    };

    setOpen(row.classList.contains('is-open'));
    head.addEventListener('click', () => setOpen(!row.classList.contains('is-open')));
  });
}
