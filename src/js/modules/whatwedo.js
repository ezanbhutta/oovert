/**
 * "What we do" — the dial.
 * A scroll-linked rotary over the disciplines. As the section travels through
 * the viewport the read line advances through the four names; the one at the
 * line opens to full width and full ink (overt) and turns the eclipse to its
 * phase, while the rest sit condensed and dim on the wheel (in cover). It stays
 * a proper ARIA tabs control underneath: hover (fine pointers), click, and
 * arrow keys take the wheel and briefly hold it; scroll resumes after. No JS →
 * the first panel shows and every description stays reachable. Under
 * prefers-reduced-motion the wheel is static — first panel active, no
 * scroll-drive, no tilt — and click/keys still switch it.
 */
export function initWhatWeDo() {
  const wrap = document.querySelector('[data-wwd]');
  if (!wrap) return;
  const tablist = wrap.querySelector('[role="tablist"]');
  const tabs = [...wrap.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return;
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const names = wrap.querySelector('.wwd__names');
  const eclipse = wrap.querySelector('.wwd__eclipse');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  let active = -1;
  let hovering = false;
  let held = 0; // timestamp of the last click/key grab, so scroll yields briefly

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
      names.style.setProperty('--active', i); // drives the wheel tilt
      if (eclipse) eclipse.style.setProperty('--wwd-turn', i);
    }
    if (focus) tabs[i].focus();
  };

  tabs.forEach((t, i) => {
    t.style.setProperty('--i', i); // this name's slot on the dial
    t.addEventListener('click', () => { held = performance.now(); activate(i); });
    t.addEventListener('focus', () => { held = performance.now(); activate(i); });
    if (finePointer) t.addEventListener('mouseenter', () => { hovering = true; activate(i); });
  });
  if (finePointer) names.addEventListener('mouseleave', () => { hovering = false; });

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
    held = performance.now();
    activate(n, { focus: true });
  });

  activate(0);

  // Scroll-linked dial. The read line sits ~44% down the viewport; the four
  // names map onto the component's travel across it, so scrolling turns the
  // wheel. Hover/keys win while engaged, then scroll takes over ~1.1s later.
  if (reducedMotion) return;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (hovering || performance.now() - held < 1100) return;
      const r = wrap.getBoundingClientRect();
      const line = window.innerHeight * 0.44;
      const p = (line - r.top) / (r.height || 1);
      const i = Math.max(0, Math.min(tabs.length - 1, Math.floor(p * tabs.length)));
      activate(i);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
