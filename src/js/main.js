import { initReveal } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initParallax } from './modules/parallax.js';
import { initMagnetic } from './modules/magnetic.js';
import { initLetterRoll } from './modules/letterroll.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initManifesto } from './modules/manifesto.js';
import { initBackdrop } from './modules/backdrop.js';
import { initHeroField } from './modules/herofield.js';
import { initHeroMarks } from './modules/heromarks.js';
import { initPackages } from './modules/packages.js';
import { initVideo } from './modules/video.js';
import { initLivingMark } from './modules/livingmark.js';
import { initWhatWeDo } from './modules/whatwedo.js';
import { initToTop } from './modules/to-top.js';
import { initDetails } from './modules/details.js';
import { initTell } from './modules/tell.js';
import { initBreakCover } from './modules/breakcover.js';
import { initHeroParallax } from './modules/heroparallax.js';
import { initVelocity } from './modules/velocity.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

initReveal();
initNav();
initToTop({ reducedMotion });
initDetails();
initTell({ reducedMotion });
initBreakCover({ reducedMotion });
initPackages({ reducedMotion });
initManifesto({ reducedMotion });
// The two ambient canvas fields now paint a single still frame for everyone:
// their idle drift competed with the width "tell" for attention, and silence is
// what lets the signature read. (reducedMotion:true selects their static path.)
initBackdrop({ reducedMotion: true });
initHeroField({ reducedMotion: true });
// The construction field is the exception to the silence above, and for the
// reason that rule exists: it never drifts on its own. It is still until the
// pointer enters the hero, responds only to where that pointer is, and stops
// its loop the moment everything has settled. Nothing competes with the tell.
initHeroMarks({ reducedMotion });
initVideo({ reducedMotion });
initLivingMark({ reducedMotion });
initWhatWeDo();
initVelocity({ reducedMotion });
initLetterRoll({ reducedMotion });

if (!reducedMotion) {
  initParallax();

  if (finePointer) {
    initSmoothScroll();
    // Hero depth: the paper ground and column grid drift under the pointer.
    initHeroParallax({ reducedMotion });
    // The contact email leans toward the pointer and springs back — the one
    // "reach toward you" gesture on the page, reserved for the ask itself.
    initMagnetic();
  }
}
