/**
 * The Tell — the word gives itself away.
 *
 * One interior chapter word rests condensed (in cover) but fully legible. The
 * first time it scrolls into view it surfaces once on its own — a single
 * travelling width wave, left to right — so every visitor (touch included) sees
 * the brand's gesture, not just the desktop few who happen to hover it. On fine
 * pointers it then hands off to the cursor: the letters nearest your attention
 * widen toward the overt end of Archivo's width axis in a travelling wave, with
 * an asymmetric wake and a slower, reluctant re-camouflage behind it (prey
 * re-freezing once your eye moves on).
 *
 * Discipline (perf): a hard influence radius keeps out-of-range letters at a
 * byte-identical width string so the browser skips re-shaping them, and the
 * animated width is quantized so only two or three glyphs re-raster per frame.
 * The loop only runs while the word is surfacing or the pointer is over it.
 *
 * Progressive enhancement: no JS or reduced motion → the word ships static at
 * its overt rest width, full ink, indistinguishable from prose.
 */
const REST_COVER = 86; // fine pointers: in cover — condensed but legible
const REST_OVERT = 92; // touch: in cover too, but a touch wider (no cursor to re-surface it)
const PEAK = 125; // overt — the axis maximum
const RADIUS = 2.4; // letters within this many letter-widths of focus surface

export function initTell({ reducedMotion } = {}) {
  if (reducedMotion) return;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const REST = fine ? REST_COVER : REST_OVERT;

  document.querySelectorAll('[data-tell]').forEach((word) => {
    const text = word.textContent;
    word.textContent = '';
    word.classList.add('tell--live');
    const letters = [...text].map((ch) => {
      const s = document.createElement('span');
      s.className = 'tell__l';
      s.textContent = ch;
      s.style.setProperty('--w', REST);
      word.appendChild(s);
      return s;
    });

    let focus = -999; // letter index under the pointer (fractional), off by default
    let raf = null;
    const current = letters.map(() => REST);
    const shown = letters.map(() => REST); // last width written, to skip no-op writes

    const frame = () => {
      let moving = false;
      for (let i = 0; i < letters.length; i++) {
        const dist = Math.abs(i - focus);
        // Asymmetric falloff: quick rise ahead of the eye, reluctant fall behind.
        let target = REST;
        if (dist < RADIUS) {
          const t = 1 - dist / RADIUS;
          target = REST + (PEAK - REST) * (t * t);
        }
        const rising = target > current[i];
        const k = rising ? 0.3 : 0.14;
        current[i] += (target - current[i]) * k;
        const w = Math.round(current[i] * 10) / 10;
        if (w !== shown[i]) {
          letters[i].style.setProperty('--w', w);
          shown[i] = w;
        }
        if (Math.abs(current[i] - target) > 0.15) moving = true;
      }
      raf = moving || focus > -900 ? requestAnimationFrame(frame) : null;
    };

    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    // Auto-surface: drive `focus` left-to-right across the word once, then
    // release it. The wave travels through the letters and re-settles behind
    // itself — the camouflaged word gives itself away, then re-freezes.
    const autoSurface = () => {
      const dur = 1150;
      const span = letters.length + RADIUS * 2;
      let t0 = null;
      const sweep = (ts) => {
        if (t0 == null) t0 = ts;
        const p = Math.min(1, (ts - t0) / dur);
        focus = -RADIUS + p * span;
        kick();
        if (p < 1) requestAnimationFrame(sweep);
        else { focus = -999; kick(); } // let the wake ease back to rest
      };
      requestAnimationFrame(sweep);
    };

    // Fire the surface each time the word scrolls into view. Armed while the
    // word is out of view, fires once on entry, then disarms until it leaves
    // and returns — so the tell replays on every pass, never just the first.
    let armed = true;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          if (armed) { armed = false; autoSurface(); }
        } else {
          armed = true;
        }
      }
    }, { threshold: 0.55 });
    io.observe(word);

    // Fine pointers: the cursor drives the wave directly.
    if (fine) {
      word.addEventListener('pointermove', (e) => {
        const r = word.getBoundingClientRect();
        focus = ((e.clientX - r.left) / r.width) * letters.length - 0.5;
        kick();
      });
      word.addEventListener('pointerleave', () => {
        focus = -999; // everything reluctantly returns to cover
        kick();
      });
    }
  });
}
