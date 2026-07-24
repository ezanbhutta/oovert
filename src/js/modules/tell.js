/**
 * The Tell — the word gives itself away.
 *
 * One interior chapter word rests condensed (in cover) but fully legible. The
 * letters nearest the reader's attention — the cursor on a fine pointer — widen
 * toward the overt end of Archivo's width axis in a travelling wave, with an
 * asymmetric wake and a slower, reluctant re-camouflage behind it (prey
 * re-freezing once your eye moves on). Reading the word means watching it
 * surface letter by letter. Movement is the tell: the letter you look at is the
 * one that gives itself away.
 *
 * Discipline (perf): a hard influence radius keeps out-of-range letters at a
 * byte-identical width string so the browser skips re-shaping them, and the
 * animated width is quantized to a few steps so only two or three glyphs
 * re-raster per frame. The loop only runs while the pointer is over the word.
 *
 * Progressive enhancement: no JS, reduced motion, or coarse pointer → the word
 * ships static at its overt rest width, full ink, indistinguishable from prose.
 */
const REST = 86; // in cover — condensed but legible, clearly deliberate
const PEAK = 125; // overt — the axis maximum
const RADIUS = 2.4; // letters within this many letter-widths of focus surface

export function initTell({ reducedMotion } = {}) {
  if (reducedMotion) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

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
        // Ease toward target; the re-hide (target < current) eases slower.
        const rising = target > current[i];
        const k = rising ? 0.3 : 0.14;
        current[i] += (target - current[i]) * k;
        // Smooth to 0.1 precision (not 6-unit steps): the wave glides across the
        // letters instead of snapping between widths — no vibration.
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

    word.addEventListener('pointermove', (e) => {
      const r = word.getBoundingClientRect();
      // Map pointer x to fractional letter index across the word.
      focus = ((e.clientX - r.left) / r.width) * letters.length - 0.5;
      kick();
    });
    word.addEventListener('pointerleave', () => {
      focus = -999; // everything reluctantly returns to cover
      kick();
    });
  });
}
