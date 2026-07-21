import { initReveal } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initParallax } from './modules/parallax.js';
import { initCounters } from './modules/counters.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

initReveal();
initNav();
initCounters({ reducedMotion });

if (!reducedMotion) {
  initParallax();

  if (finePointer) {
    initSmoothScroll();
  }
}
