/**
 * Hero 3D gate.
 *
 * The Three.js hero is a real payload (about 120KB gzipped once tree-shaken),
 * so it is never part of the page's critical path. This module is the only
 * thing the page loads eagerly, and all it does is decide whether the scene is
 * worth fetching at all. If any condition fails, nothing is downloaded and the
 * hero stays exactly as it renders today.
 *
 * The conditions, and why each one is here:
 *   fine pointer      the scene is driven by pointer position; on touch there
 *                     is nothing to drive it, so it would be dead weight
 *   no reduced motion this site's rule: motion is never forced on anyone
 *   viewport >= 900   below that the hero is a single tight column and the
 *                     object would sit on top of the headline
 *   WebGL2            transmission needs it; without it we do not degrade to
 *                     something worse, we simply do not load
 *   saveData / cores  respect an explicit data-saver signal and very low-end
 *                     machines, which would drop frames rather than impress
 *
 * Loading also waits for first paint to be done (requestIdleCallback after
 * load), so the scene can never compete with LCP or block the main thread
 * while the headline is still arriving.
 */
export function initHero3DGate() {
  const mount = document.querySelector('[data-hero3d]');
  if (!mount) return;

  const mq = (q) => window.matchMedia(q).matches;

  if (!mq('(hover: hover) and (pointer: fine)')) return;
  if (mq('(prefers-reduced-motion: reduce)')) return;
  if (window.innerWidth < 900) return;

  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2) return;

  // WebGL2 probe on a throwaway canvas: cheap, and it means a machine that
  // cannot run the scene never pays for the download to find that out.
  let ok = false;
  try {
    const probe = document.createElement('canvas');
    ok = !!probe.getContext('webgl2');
  } catch (e) {
    ok = false;
  }
  if (!ok) return;

  const start = () => {
    import('/js/hero3d.js')
      .then((m) => m.initHero3D && m.initHero3D(mount))
      .catch(() => {
        /* Network or parse failure is not an error state for the page: the
           hero is complete without it, so fail silently. */
      });
  };

  const whenIdle = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2500 });
    else setTimeout(start, 900);
  };

  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}
