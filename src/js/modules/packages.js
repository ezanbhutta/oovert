/**
 * Packages — segmented tabs.
 * The three pricing families share one card row; a segmented control swaps
 * between them, one panel at a time, defaulting to one-time projects. Follows
 * the ARIA tabs pattern (roving tabindex, arrow / Home / End keys). The panel's
 * cards rise in on selection and on first scroll into view.
 *
 * Progressive enhancement: with no JS the control stays hidden and every panel
 * stacks, so all pricing is reachable without scripting.
 */
export function initPackages({ reducedMotion } = {}) {
  const tablist = document.querySelector('.pkg-tabs');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return;
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));

  const animateIn = (panel) => {
    if (reducedMotion || !panel) return;
    panel.querySelectorAll('.pkg').forEach((card, i) => {
      card.animate(
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
    const section = document.querySelector('.packages');
    if (section) {
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
}
