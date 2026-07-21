import { initReveal } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initParallax } from './modules/parallax.js';
import { initCounters } from './modules/counters.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initManifesto } from './modules/manifesto.js';
import { initBackdrop } from './modules/backdrop.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

initReveal();
initNav();
initCounters({ reducedMotion });
initManifesto({ reducedMotion });
initBackdrop({ reducedMotion });

if (!reducedMotion) {
  initParallax();

  if (finePointer) {
    initSmoothScroll();
  }
}
