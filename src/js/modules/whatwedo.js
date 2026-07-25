/**
 * "What we do" — Break Cover.
 *
 * The four disciplines rest as a thicket of deeply-condensed, quiet words (in
 * cover). Select one — hover on fine pointers, click, or arrow keys — and it
 * BREAKS COVER: a width wave sweeps its letters from cover to overt (the site's
 * own Tell engine), its number turns violet, and a single violet marker travels
 * to it; the one you leave reluctantly re-camouflages (slow width fall). On fine
 * pointers the active word stays alive under the cursor. It stays a proper ARIA
 * tabs control — no scroll-drive, no wheel. This is not the rotary.
 *
 * Perf: width writes are quantized to 0.1 and skipped when unchanged; a hard
 * influence radius keeps out-of-range letters at a byte-identical width so the
 * browser skips reshaping them; rAF runs only while a name is moving or the
 * pointer is over the active word. Reduced motion → names ship static (no split,
 * CSS width jump), selection still works, no waves.
 */
const COVER = 78; // in cover — condensed thicket, still legible
const PEAK = 125; // the wave crest / cursor focus — the axis maximum
const RADIUS = 2.4; // letters within this many widths of focus surface

// A per-name width wave: eases each letter toward `base`, with a travelling
// crest toward PEAK around `focus`. Fast rise, slow reluctant fall.
function makeWave(letters) {
  const current = letters.map(() => COVER);
  const shown = letters.map(() => COVER);
  let base = COVER;
  let focus = -999;
  let raf = null;

  const frame = () => {
    let moving = false;
    for (let i = 0; i < letters.length; i++) {
      const dist = Math.abs(i - focus);
      let target = base;
      if (dist < RADIUS && PEAK > base) {
        const t = 1 - dist / RADIUS;
        target = base + (PEAK - base) * (t * t);
      }
      const rising = target > current[i];
      const k = rising ? 0.3 : 0.14; // quick to surface, reluctant to re-hide
      current[i] += (target - current[i]) * k;
      const w = Math.round(current[i] * 10) / 10;
      if (w !== shown[i]) {
        letters[i].style.setProperty('--w', w);
        shown[i] = w;
      }
      if (Math.abs(current[i] - target) > 0.12) moving = true;
    }
    raf = moving || focus > -900 ? requestAnimationFrame(frame) : null;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  return {
    setBase(b) { base = b; kick(); },
    track(f) { focus = f; kick(); },
    release() { focus = -999; kick(); },
    // Drive the crest left→right across the word once (breaking cover), then release.
    sweep(dur = 480) {
      const span = letters.length + RADIUS * 2;
      let t0 = null;
      const step = (ts) => {
        if (t0 == null) t0 = ts;
        const p = Math.min(1, (ts - t0) / dur);
        focus = -RADIUS + p * span;
        kick();
        if (p < 1) requestAnimationFrame(step);
        else { focus = -999; kick(); }
      };
      requestAnimationFrame(step);
    },
  };
}

export function initWhatWeDo() {
  const wrap = document.querySelector('[data-wwd]');
  if (!wrap) return;
  const tablist = wrap.querySelector('[role="tablist"]');
  const tabs = [...wrap.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return;
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const names = tabs.map((t) => t.querySelector('.wwd__name'));
  const eclipse = wrap.querySelector('.wwd__eclipse');
  const marker = wrap.querySelector('.wwd__marker');
  const namesWrap = wrap.querySelector('.wwd__names');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // How far each word breaks cover (long words open less, to stay one line).
  const overts = tabs.map((t) => Number(t.dataset.overt) || 116);

  // Split names into per-letter spans (motion path only). Keep the accessible
  // name on the button since the visible text becomes aria-hidden spans.
  let waves = null;
  if (!reducedMotion) {
    waves = names.map((name, i) => {
      const text = name.textContent;
      tabs[i].setAttribute('aria-label', text.trim());
      name.textContent = '';
      name.classList.add('wwd__name--split');
      const letters = [...text].map((ch) => {
        const s = document.createElement('span');
        s.className = 'wwd__l';
        s.textContent = ch === ' ' ? ' ' : ch;
        s.style.setProperty('--w', COVER);
        s.setAttribute('aria-hidden', 'true');
        name.appendChild(s);
        return s;
      });
      return { wave: makeWave(letters), len: letters.length };
    });
  }

  let active = -1;
  let hoverTimer = null;

  const moveMarker = (i) => {
    if (!marker || !namesWrap) return;
    const r = tabs[i].getBoundingClientRect();
    const wr = namesWrap.getBoundingClientRect();
    marker.style.transform = `translateY(${r.top - wr.top + r.height / 2}px)`;
    marker.classList.add('is-on');
  };

  const setActiveState = (i, { focus = false } = {}) => {
    active = i;
    tabs.forEach((t, k) => {
      const on = k === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const p = panels[k];
      if (p) { p.hidden = !on; p.classList.toggle('is-active', on); }
    });
    if (eclipse) eclipse.style.setProperty('--wwd-turn', i);
    moveMarker(i);
    if (focus) tabs[i].focus();
  };

  const activate = (i, opts = {}) => {
    if (i === active) { if (opts.focus) tabs[i].focus(); return; }
    const prev = active;
    setActiveState(i, opts);
    if (waves) {
      if (prev >= 0) { waves[prev].wave.setBase(COVER); waves[prev].wave.release(); }
      waves[i].wave.setBase(overts[i]);
      waves[i].wave.sweep();
    }
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { clearTimeout(hoverTimer); activate(i); });
    // Hover-intent delay: sweeping the cursor down the column doesn't fire all four.
    if (fine) {
      t.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => activate(i), 70);
      });
    }
  });

  // Cursor-live active word: the crest tracks the pointer along the active name.
  if (fine && waves) {
    names.forEach((name, i) => {
      name.addEventListener('pointermove', (e) => {
        if (i !== active) return;
        const r = name.getBoundingClientRect();
        waves[i].wave.track(((e.clientX - r.left) / r.width) * waves[i].len - 0.5);
      });
      name.addEventListener('pointerleave', () => {
        if (i === active) waves[i].wave.release();
      });
    });
  }

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

  // First discipline is the default active (ARIA + panel); its visual break-cover
  // waits for the section to scroll into view, so the gesture plays in front of
  // the reader (touch included) rather than off-screen at load.
  setActiveState(0);
  if (waves) {
    // Replay the break-cover wave on every scroll pass: armed off-screen, fires
    // on entry, re-arms when the section leaves view.
    let armed = true;
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          if (armed) {
            armed = false;
            moveMarker(0);
            waves[0].wave.setBase(overts[0]);
            waves[0].wave.sweep(620);
          }
        } else {
          armed = true;
        }
      }
    }, { threshold: 0.35 });
    io.observe(wrap);
  }

  // Keep the marker aligned if the layout reflows.
  let rz = null;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { if (active >= 0) moveMarker(active); }, 150);
  }, { passive: true });
}
