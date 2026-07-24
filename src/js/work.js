/**
 * Work index — lean entry. Scroll reveals, the shared menu/nav behaviour, and
 * wheel inertia. Homepage-only modules (hero field, packages, manifesto) are
 * deliberately not loaded here.
 */
import { initReveal } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initLivingMark } from './modules/livingmark.js';
import { initVideo } from './modules/video.js';
import { initToTop } from './modules/to-top.js';
import { initDetails } from './modules/details.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

initReveal();
initNav();
initToTop({ reducedMotion });
initDetails();
initLivingMark({ reducedMotion });
initVideo({ reducedMotion });

if (!reducedMotion && finePointer) {
  initSmoothScroll();
}
