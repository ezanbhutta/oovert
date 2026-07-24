/**
 * Keeps the address bar clean.
 *
 * 1. On load, rewrites a trailing `/index.html` to `/` (e.g. an old bookmark
 *    or a hand-typed `oovert.com/index.html` becomes `oovert.com/`). This is
 *    cosmetic only — replaceState never reloads or re-fetches anything.
 * 2. Intercepts the logo and "back to top" links (`href="#top"`) so they
 *    scroll to the top without writing `#top` into the URL.
 */
export function initToTop({ reducedMotion = false } = {}) {
  const cleanPath = () => location.pathname.replace(/\/index\.html$/, '/');

  // 1. Normalise /index.html -> / on arrival, preserving any hash/query.
  if (location.pathname !== cleanPath()) {
    history.replaceState(null, '', cleanPath() + location.search + location.hash);
  }

  // 2. Clean scroll-to-top for the logo and footer "back to top".
  document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      // Drop the hash (and any /index.html) so the URL reads as the bare page.
      history.replaceState(null, '', cleanPath() + location.search);
    });
  });
}
