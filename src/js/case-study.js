/**
 * OOVERT — case study motion.
 *
 * Scroll-linked, cinematic transitions for the case study template. Each
 * <section data-cs="..."> declares one transition; no transition is used more
 * than twice across the page. GSAP + ScrollTrigger drive the scroll work,
 * Lenis smooths the wheel. Everything animated is transform / opacity /
 * clip-path only, so it stays on the compositor at 60fps.
 *
 * Progressive enhancement: with no JS, reduced-motion, or a coarse pointer the
 * page renders fully legible and static (see the .cs-static branch and the
 * matching CSS). Nothing here is required to read the work.
 */
(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const Lenis = window.Lenis;

  // No engine, or the reader asked for stillness: show the static page.
  if (reduce || !gsap || !ScrollTrigger) {
    root.classList.add('cs-static');
    initLightbox();
    return;
  }

  root.classList.remove('cs-static');
  root.classList.add('cs-motion');
  gsap.registerPlugin(ScrollTrigger);

  // --- Smooth scroll (fine pointers only; touch keeps native momentum) -------
  if (Lenis && window.matchMedia('(pointer: fine)').matches) {
    const lenis = new Lenis({ duration: 0.85, smoothWheel: true, wheelMultiplier: 1.1, touchMultiplier: 1.6 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Per-project motion: the theme sets --motion (1 = base, >1 more expressive,
  // <1 calmer). CSS reads it for its own durations; here we scale GSAP's
  // time-based entrance tweens to match. Scrubbed tweens stay scroll-linked.
  const motion = parseFloat(getComputedStyle(document.body).getPropertyValue('--motion')) || 1;
  if (motion !== 1) gsap.globalTimeline.timeScale(1 / motion);

  const q = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  // The element a transition acts on: a real <img>, else the placeholder box.
  const mediaOf = (sec) => sec.querySelector('[data-cs-media]') || sec;
  const inner = (fig) => fig.querySelector('img, .ph') || fig;

  // Copy blocks rise and fade in as they arrive, independent of the section's
  // own media transition. Skipped inside split sections (they scrub words).
  q('[data-cs-text]').forEach((el) => {
    gsap.from(el, {
      y: 26,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // --- Per-section transitions ----------------------------------------------
  const behaviors = {
    // 01 Hero — scale-down reveal on load, then a slow parallax drift.
    hero(sec) {
      const m = inner(mediaOf(sec));
      gsap.fromTo(m, { scale: 1.12, autoAlpha: 0.35 },
        { scale: 1, autoAlpha: 1, duration: 1.8, ease: 'power3.out' });
      gsap.to(m, {
        yPercent: -8, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: true },
      });
    },

    // 02 Introduction — image wipes open left→right; text rises (generic).
    clip(sec) {
      const m = mediaOf(sec);
      gsap.fromTo(m, { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', ease: 'none',
          scrollTrigger: { trigger: m, start: 'top 85%', end: 'top 40%', scrub: true } });
    },

    // 03 Brand statement — connective words hold dim, resolve as you read down.
    split(sec) {
      const host = sec.querySelector('[data-cs-words]');
      if (!host) return;
      const words = splitWords(host);
      gsap.fromTo(words, { opacity: 0.14 },
        { opacity: 1, ease: 'none', stagger: 0.4,
          scrollTrigger: { trigger: sec, start: 'top 72%', end: 'bottom 65%', scrub: true } });
    },

    // 04 Logo — scales up with a soft counter-rotation settling to true.
    logo(sec) {
      const m = inner(mediaOf(sec));
      gsap.fromTo(m, { scale: 0.78, rotate: -6, autoAlpha: 0 },
        { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: sec, start: 'top 68%' } });
    },

    // 05 Construction — image pins (CSS sticky) while notes scroll; subtle scale.
    sticky(sec) {
      const m = inner(mediaOf(sec));
      gsap.fromTo(m, { scale: 1.06 },
        { scale: 1, ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top center', end: 'bottom bottom', scrub: true } });
    },

    // 06 Concept — three uprights reveal in sequence.
    sequence(sec) {
      const items = q('[data-cs-item]', sec);
      gsap.from(items, { yPercent: 16, autoAlpha: 0, duration: 1, ease: 'power3.out',
        stagger: 0.16, scrollTrigger: { trigger: sec, start: 'top 68%' } });
    },

    // 07 Typography — artwork unmasks bottom→top (a different axis than 02).
    mask(sec) {
      const m = mediaOf(sec);
      gsap.fromTo(m, { clipPath: 'inset(100% 0 0 0)' },
        { clipPath: 'inset(0% 0 0 0)', ease: 'none',
          scrollTrigger: { trigger: m, start: 'top 85%', end: 'top 42%', scrub: true } });
    },

    // 08 Colour — layered parallax and a fade up from the ground.
    parallax(sec) {
      const m = inner(mediaOf(sec));
      gsap.fromTo(m, { autoAlpha: 0.45, scale: 1.06 },
        { autoAlpha: 1, scale: 1, ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top bottom', end: 'center center', scrub: true } });
      gsap.to(m, { yPercent: -10, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
    },

    // 09 Graphic language — scales in with a slight rotation (paired with 04).
    rotate(sec) {
      const m = inner(mediaOf(sec));
      gsap.fromTo(m, { scale: 0.9, rotate: 4, autoAlpha: 0 },
        { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: sec, start: 'top 70%' } });
    },

    // 10 Business card — slides in from the left as it enters.
    'slide-x'(sec) {
      const m = inner(mediaOf(sec));
      gsap.fromTo(m, { xPercent: -14, autoAlpha: 0.2 },
        { xPercent: 0, autoAlpha: 1, ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 42%', scrub: true } });
    },

    // 11 Stationery — a grid cascades open from its centre.
    cascade(sec) {
      const items = q('[data-cs-item]', sec);
      gsap.from(items, { scale: 0.85, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
        stagger: { each: 0.1, from: 'center' },
        scrollTrigger: { trigger: sec, start: 'top 70%' } });
    },

    // 12 Packaging — full-bleed slow push in (Ken Burns).
    zoom(sec) {
      const m = inner(mediaOf(sec));
      gsap.fromTo(m, { scale: 1 },
        { scale: 1.14, ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
    },

    // 13 Social — phone frames rise and settle into a fanned stack.
    stack(sec) {
      const items = q('[data-cs-item]', sec);
      items.forEach((it, i) => {
        gsap.from(it, { yPercent: 30 + i * 8, rotate: (i - 1) * 3, autoAlpha: 0,
          duration: 1, ease: 'power3.out', delay: i * 0.06,
          scrollTrigger: { trigger: sec, start: 'top 70%' } });
      });
    },

    // 14 Website — section pins; the long screenshot scrubs upward. Only when a
    // real screenshot is present: pinning an empty placeholder would just eat
    // screens of dead scroll, so an image-less slot renders inline instead. The
    // pin distance is also capped so even a very tall shot never traps the
    // reader for more than ~1.4 viewports.
    'pin-scrub'(sec) {
      const shot = sec.querySelector('[data-cs-long]');
      if (!shot) return;
      if (!shot.querySelector('img')) {
        const frame = shot.parentElement;
        frame.style.height = 'auto';
        shot.style.position = 'static';
        return;
      }
      const cap = () => window.innerHeight * 1.4;
      const distance = () => Math.min(cap(), Math.max(0, shot.scrollHeight - shot.parentElement.clientHeight));
      gsap.to(shot, { y: () => -Math.max(0, shot.scrollHeight - shot.parentElement.clientHeight), ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + (distance() + window.innerHeight),
          pin: true, scrub: true, invalidateOnRefresh: true } });
    },

    // 15 Environmental — layers travel at different speeds.
    layer(sec) {
      q('[data-cs-layer]', sec).forEach((layer) => {
        const speed = parseFloat(layer.getAttribute('data-speed') || '-12');
        gsap.to(layer, { yPercent: speed, ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    },

    // 16 Brand in context — a long, slow cinematic fade + settle.
    cinematic(sec) {
      const m = inner(mediaOf(sec));
      gsap.fromTo(m, { autoAlpha: 0.15, scale: 1.08 },
        { autoAlpha: 1, scale: 1, ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top bottom', end: 'center 45%', scrub: 1.2 } });
    },

    // 17 Gallery — masonry items rise in as each row enters.
    masonry(sec) {
      ScrollTrigger.batch(q('[data-cs-item]', sec), {
        start: 'top 90%',
        onEnter: (els) => gsap.from(els, { yPercent: 12, autoAlpha: 0, duration: 0.8,
          ease: 'power3.out', stagger: 0.08, overwrite: true }),
      });
    },

    // 18 Closing — wordmark fades up; the page exhales.
    closing(sec) {
      const m = inner(mediaOf(sec));
      gsap.from(m, { scale: 0.9, autoAlpha: 0, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: sec, start: 'top 70%' } });
    },
  };

  q('[data-cs]').forEach((sec) => {
    const kind = sec.getAttribute('data-cs');
    const run = behaviors[kind];
    if (run) run(sec);
  });

  // Progress bar in the fixed header.
  const bar = document.querySelector('.cs-progress__fill');
  if (bar) {
    gsap.to(bar, { scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true } });
  }

  initLightbox();
  window.addEventListener('load', () => ScrollTrigger.refresh());

  // --- helpers ---------------------------------------------------------------
  function splitWords(host) {
    const out = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (tok === '') return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            s.className = 'cs-word';
            s.textContent = tok;
            frag.appendChild(s);
            out.push(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === Node.ELEMENT_NODE) {
          if (n.classList.contains('cs-word')) { out.push(n); return; }
          walk(n);
        }
      });
    };
    walk(host);
    return out;
  }

  function initLightbox() {
    const gallery = document.querySelector('[data-cs="masonry"]');
    if (!gallery) return;
    const box = document.createElement('div');
    box.className = 'cs-lightbox';
    box.setAttribute('hidden', '');
    box.innerHTML = '<button class="cs-lightbox__close" aria-label="Close">✕</button><img alt="">';
    document.body.appendChild(box);
    const bimg = box.querySelector('img');
    const close = () => { box.setAttribute('hidden', ''); bimg.removeAttribute('src'); };
    box.addEventListener('click', (e) => { if (e.target === box || e.target.closest('.cs-lightbox__close')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    gallery.addEventListener('click', (e) => {
      const img = e.target.closest('[data-cs-item] img');
      if (!img) return;
      bimg.src = img.currentSrc || img.src;
      bimg.alt = img.alt || '';
      box.removeAttribute('hidden');
    });
  }
})();
