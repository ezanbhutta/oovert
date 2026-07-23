/**
 * "What we do" showcase — an ARIA tabs pattern over the disciplines.
 * Selecting a discipline (click, hover on fine pointers, or arrow keys) swaps
 * the description panel and turns the eclipse mark to that discipline's phase.
 * No JS → the first panel shows and the rest are reachable (all in the DOM).
 */
export function initWhatWeDo() {
  const wrap = document.querySelector('[data-wwd]');
  if (!wrap) return;
  const tablist = wrap.querySelector('[role="tablist"]');
  const tabs = [...wrap.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return;
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const eclipse = wrap.querySelector('.wwd__eclipse');
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const activate = (i, { focus = false } = {}) => {
    tabs.forEach((t, j) => {
      const on = j === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const p = panels[j];
      if (p) {
        p.hidden = !on;
        p.classList.toggle('is-active', on);
      }
    });
    if (eclipse) eclipse.style.setProperty('--wwd-turn', i);
    if (focus) tabs[i].focus();
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activate(i));
    t.addEventListener('focus', () => activate(i));
    if (finePointer) t.addEventListener('mouseenter', () => activate(i));
  });

  tablist.addEventListener('keydown', (e) => {
    const cur = tabs.indexOf(document.activeElement);
    if (cur < 0) return;
    let n = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (cur + 1) % tabs.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (cur - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    if (n === null) return;
    e.preventDefault();
    activate(n, { focus: true });
  });
}
