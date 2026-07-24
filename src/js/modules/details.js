/**
 * Finishing details. Small, quiet, and mostly invisible — the tab speaks the
 * thesis when you leave, and the console greets the only people who look.
 */
export function initDetails() {
  // Tab blur: one line in the brand's own voice, restored on return.
  const homeTitle = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'Camouflage is for prey. — OOVERT' : homeTitle;
  });

  // Console: speak only to people already reading source.
  try {
    console.log(
      '%coovert%c  Camouflage is for prey.\nYou read source. Our kind of animal. → new@oovert.com',
      'font: italic 700 20px "Instrument Serif", serif; color: #815EFA;',
      'font: 12px ui-monospace, monospace; color: #55503F;'
    );
  } catch (e) {}
}
