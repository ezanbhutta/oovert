/**
 * "What we do" — the practice, revealed.
 *
 * A calm ARIA tabs control: the four disciplines list down the left; selecting
 * one (hover on fine pointers, click, or arrow keys) opens its name from cover
 * toward full width, marks it, and reveals its description on the right while
 * the eclipse turns gently to that phase. Whatever you last chose stays open —
 * no scroll-drive, no wheel, no spring back. No JS → the first panel shows with
 * every description already in the DOM. Under prefers-reduced-motion CSS removes
 * the eases; click and arrow keys still switch it.
 */
export function initWhatWeDo() {
  const wrap = document.querySelector('[data-wwd]');
  if (!wrap) return;
  const tablist = wrap.querySelector('[role="tablist"]');
  const tabs = [...wrap.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return;
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const eclipse = wrap.querySelector('.wwd__eclipse');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let active = -1;

  const activate = (i, { focus = false } = {}) => {
    if (i !== active) {
      active = i;
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
    }
    if (focus) tabs[i].focus();
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activate(i));
    // Hover previews on fine pointers: the discipline you point at opens, and
    // stays open once your pointer moves on (no revert).
    if (finePointer) t.addEventListener('mouseenter', () => activate(i));
  });

  // Roving tabindex: arrow keys move focus and select in step.
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

  activate(0);
}
