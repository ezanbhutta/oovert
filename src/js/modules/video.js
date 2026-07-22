/**
 * OOVERT — video slots on the homepage (hero background, showreel band).
 *
 * Mirrors the case-study video engine: applies the owner's settings (playback
 * speed via data-rate, trim window via data-start / data-end) and plays
 * autoplay clips only while they are on screen — an IntersectionObserver keeps
 * scrolling smooth and spares the battery. Muted is required for programmatic
 * play() without a user gesture; the template sets it whenever autoplay is on.
 */
export function initVideo({ reducedMotion } = {}) {
  const vids = Array.from(document.querySelectorAll('[data-cs-video]'));
  vids.forEach((v) => {
    const rate = parseFloat(v.getAttribute('data-rate'));
    const start = parseFloat(v.getAttribute('data-start')) || 0;
    const end = parseFloat(v.getAttribute('data-end')) || 0;
    const shouldLoop = v.hasAttribute('loop');
    // With a trim start, drive the loop from JS so the native loop doesn't
    // race it back to 0 at the natural end.
    if (start > 0) v.removeAttribute('loop');

    const applyRate = () => { if (rate > 0) v.playbackRate = rate; };
    const seekStart = () => { if (start > 0) { try { v.currentTime = start; } catch (e) {} } };
    applyRate();
    if (v.readyState >= 1) seekStart();
    else v.addEventListener('loadedmetadata', () => { applyRate(); seekStart(); }, { once: true });

    // Trim window: at the end mark, loop back to the start or stop.
    if (start > 0 || end > 0) {
      v.addEventListener('timeupdate', () => {
        const stop = end > 0 ? end : (v.duration || Infinity);
        if (v.currentTime >= stop) {
          if (shouldLoop) { v.currentTime = start; const p = v.play(); if (p) p.catch(() => {}); }
          else { v.pause(); }
        }
      });
    }

    // Play only while visible; the browser's own autoplay is disabled here.
    const wantsAutoplay = v.hasAttribute('autoplay');
    v.removeAttribute('autoplay');
    if (wantsAutoplay && !reducedMotion && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { const p = v.play(); if (p) p.catch(() => {}); }
          else { v.pause(); }
        });
      }, { threshold: 0.2 });
      io.observe(v);
    }
  });
}
