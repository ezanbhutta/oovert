/**
 * Letter-roll CTA labels — dual copy per letter; hover rolls the second copy
 * up through the clipped line box. Entry rolls left-to-right and quick; exit
 * releases from the tail back and slower — the tell's asymmetry, on the Y
 * axis. Built at runtime on fine pointers only (the split never ships to
 * touch or reduced-motion visitors), and the accessible name survives via
 * aria-label on the link.
 */
export function initLetterRoll({ reducedMotion } = {}) {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reducedMotion || !fine) return;

  document.querySelectorAll('.btn__label, .work-more__cta').forEach((host) => {
    const tn = [...host.childNodes].find(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim()
    );
    if (!tn) return;
    const text = tn.textContent.replace(/\s+/g, ' ').trim();
    const link = host.closest('a, button') || host;
    link.setAttribute('aria-label', text);

    const roll = document.createElement('span');
    roll.className = 'roll';
    roll.setAttribute('aria-hidden', 'true');
    const chars = [...text];
    chars.forEach((ch, i) => {
      if (ch === ' ') {
        const sp = document.createElement('span');
        sp.className = 'roll__sp';
        sp.textContent = ' ';
        roll.appendChild(sp);
        return;
      }
      const l = document.createElement('span');
      l.className = 'roll__l';
      l.style.setProperty('--i', i);
      l.style.setProperty('--ri', chars.length - 1 - i);
      const a = document.createElement('span');
      a.className = 'roll__c';
      a.textContent = ch;
      const b = a.cloneNode(true);
      b.classList.add('roll__c--b');
      l.append(a, b);
      roll.appendChild(l);
    });
    tn.replaceWith(roll);
    link.classList.add('has-roll');
  });
}
