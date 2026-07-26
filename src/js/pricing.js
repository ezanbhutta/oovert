/**
 * Pricing page — lean entry. Scroll reveals, the shared menu/nav behaviour, the
 * FAQ accordion, and the packages ledger (segmented tabs + per-plan accordion),
 * plus wheel inertia on fine pointers. Homepage-only modules are not loaded.
 */
import { initReveal } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initLivingMark } from './modules/livingmark.js';
import { initToTop } from './modules/to-top.js';
import { initDetails } from './modules/details.js';
import { initPackages } from './modules/packages.js';
import { initVelocity } from './modules/velocity.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

initReveal();
initNav();
initToTop({ reducedMotion });
initDetails();
initLivingMark({ reducedMotion });
initPackages({ reducedMotion });
initVelocity({ reducedMotion });

if (!reducedMotion && finePointer) {
  initSmoothScroll();
}
