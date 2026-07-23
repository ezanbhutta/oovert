/**
 * Studio page entry. Reveals, shared menu/nav, wheel inertia, and the live
 * timezone clocks. Homepage-only modules are not loaded here.
 */
import { initReveal } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initClocks } from './modules/clocks.js';
import { initLivingMark } from './modules/livingmark.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

initReveal();
initNav();
initClocks();
initLivingMark({ reducedMotion });

if (!reducedMotion && finePointer) {
  initSmoothScroll();
}
