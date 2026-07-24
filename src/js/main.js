import { initReveal } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initParallax } from './modules/parallax.js';
import { initCounters } from './modules/counters.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initManifesto } from './modules/manifesto.js';
import { initBackdrop } from './modules/backdrop.js';
import { initHeroField } from './modules/herofield.js';
import { initPackages } from './modules/packages.js';
import { initVideo } from './modules/video.js';
import { initLivingMark } from './modules/livingmark.js';
import { initWhatWeDo } from './modules/whatwedo.js';
import { initToTop } from './modules/to-top.js';
import { initDetails } from './modules/details.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

initReveal();
initNav();
initToTop({ reducedMotion });
initDetails();
initPackages({ reducedMotion });
initCounters({ reducedMotion });
initManifesto({ reducedMotion });
initBackdrop({ reducedMotion });
initHeroField({ reducedMotion });
initVideo({ reducedMotion });
initLivingMark({ reducedMotion });
initWhatWeDo();

if (!reducedMotion) {
  initParallax();

  if (finePointer) {
    initSmoothScroll();
  }
}
