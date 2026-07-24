#!/usr/bin/env node
/**
 * OOVERT SEO crawler — a dependency-free, offline SEO auditor for the built site.
 *
 * It serves the `_site` build over a local static server (or crawls a live URL),
 * follows internal links breadth-first, and runs the claude-seo-aligned check
 * set on every page plus the site as a whole. Output: a console report, a JSON
 * envelope (audit-data.json + report.json), and a standalone HTML report.
 *
 * Usage:
 *   node tools/seo-crawler/crawl.js                 # audit ./_site
 *   node tools/seo-crawler/crawl.js --dir _site --out seo-report
 *   node tools/seo-crawler/crawl.js --url https://oovert.com   # crawl live
 *   node tools/seo-crawler/crawl.js --max 100 --fail-on high
 *
 * Flags:
 *   --dir <path>      built site directory to serve & audit (default: _site)
 *   --url <baseUrl>   crawl a live origin instead of a local directory
 *   --site-url <url>  production origin used to match sitemap/canonical paths
 *                     (default: https://oovert.com)
 *   --out <dir>       report output directory (default: seo-report)
 *   --max <n>         max pages to crawl (default: 200)
 *   --fail-on <sev>   exit non-zero if a finding at/above this severity exists
 *                     (critical|high|medium|low|none; default: critical)
 *   --json-only       skip the HTML report
 *   --quiet           suppress the console report
 */

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { analyzePage, analyzeSite } = require('./lib/checks');
const { score, SEV_ORDER } = require('./lib/score');
const report = require('./lib/report');
const H = require('./lib/html');

const FETCH_TIMEOUT_MS = 20000;
const MAX_BODY_BYTES = 8 * 1024 * 1024; // hard per-response cap (live mode)
const PROBE_CONCURRENCY = 8;

/* ------------------------------- CLI ------------------------------------ */

function parseArgs(argv) {
  const a = { dir: '_site', url: null, siteUrl: 'https://oovert.com', out: 'seo-report', max: 200, failOn: 'critical', jsonOnly: false, quiet: false };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) { console.error(`Missing value for ${k}`); process.exit(2); }
      return v;
    };
    if (k === '--dir') a.dir = next();
    else if (k === '--url') a.url = next();
    else if (k === '--site-url') a.siteUrl = next();
    else if (k === '--out') a.out = next();
    else if (k === '--max') {
      const n = Number(next());
      if (!Number.isInteger(n) || n < 1) { console.error('--max must be a positive integer'); process.exit(2); }
      a.max = n;
    } else if (k === '--fail-on') a.failOn = String(next()).toLowerCase();
    else if (k === '--json-only') a.jsonOnly = true;
    else if (k === '--quiet') a.quiet = true;
    else if (k === '--help' || k === '-h') { printHelp(); process.exit(0); }
    else { console.error(`Unknown flag: ${k}`); process.exit(2); }
  }
  return a;
}

function printHelp() {
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').filter((l) => l.startsWith(' *')).map((l) => l.slice(3)).join('\n'));
}

/* --------------------------- static server ------------------------------ */

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.mp4': 'video/mp4',
};

/**
 * Map a URL pathname to a file inside the served directory (clean-URL aware).
 * Tries the literal file first, then clean-URL fallbacks — so a dotted last
 * segment (e.g. /v2.0/) still resolves. A root-containment guard rejects any
 * candidate that escapes `dir` (path traversal). Malformed %-escapes are
 * tolerated rather than thrown.
 */
function resolveFile(dir, pathname) {
  const rawPath = pathname.split('?')[0].split('#')[0];
  let p;
  try { p = decodeURIComponent(rawPath); } catch { p = rawPath; }
  if (!p.startsWith('/')) p = '/' + p;
  const root = path.resolve(dir);
  const candidates = [];
  if (p.endsWith('/')) {
    candidates.push(path.join(dir, p, 'index.html'));
  } else {
    candidates.push(path.join(dir, p), path.join(dir, p + '/index.html'), path.join(dir, p + '.html'));
  }
  for (const file of candidates) {
    const resolved = path.resolve(file);
    if (resolved !== root && !resolved.startsWith(root + path.sep)) continue; // containment guard
    try { const st = fs.statSync(resolved); if (st.isFile()) return { file: resolved, size: st.size }; } catch { /* next */ }
  }
  return null;
}

function startServer(dir) {
  const server = http.createServer((req, res) => {
    const hit = resolveFile(dir, req.url);
    if (!hit) { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('404'); return; }
    const stream = fs.createReadStream(hit.file);
    stream.on('open', () => {
      res.writeHead(200, { 'content-type': MIME[path.extname(hit.file).toLowerCase()] || 'application/octet-stream' });
      stream.pipe(res);
    });
    stream.on('error', () => { if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain' }); res.end('error'); });
  });
  server.on('error', (e) => { console.error('Static server error:', e.message); });
  server.on('clientError', (_e, socket) => { try { socket.destroy(); } catch { /* ignore */ } });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

/* ------------------------------ fetching -------------------------------- */

/** Read a response body with a hard byte cap so a huge response can't OOM us. */
async function readCapped(res, cap) {
  if (!res.body || typeof res.body.getReader !== 'function') {
    const t = await res.text();
    return t.length > cap ? t.slice(0, cap) : t;
  }
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
      total += value.length;
      if (total >= cap) { try { await reader.cancel(); } catch { /* ignore */ } break; }
    }
  } catch { /* aborted/stalled — return what we have */ }
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * Fetch a URL with a wall-clock timeout, following redirects, and only buffering
 * the body for text-ish responses (HTML/XML/plain). Returns status 0 on failure
 * rather than throwing, so a single bad URL never aborts the crawl.
 */
async function fetchText(url) {
  let res;
  try {
    res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch (err) {
    return { status: 0, contentType: '', body: '', bytes: 0, error: String((err && err.message) || err) };
  }
  const status = res.status;
  const ct = res.headers.get('content-type') || '';
  const textish = ct === '' || /text\/html|application\/xhtml|xml|text\/plain/i.test(ct);
  let body = '';
  if (status >= 200 && status < 400 && textish) {
    body = await readCapped(res, MAX_BODY_BYTES);
  } else if (res.body && typeof res.body.cancel === 'function') {
    try { await res.body.cancel(); } catch { /* ignore */ }
  }
  return { status, contentType: ct, body, bytes: Buffer.byteLength(body) };
}

/** HEAD/GET probe used in live --url mode to check reachability + size. */
async function probe(url) {
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (res.body && typeof res.body.cancel === 'function') { try { await res.body.cancel(); } catch { /* ignore */ } }
    }
    const len = res.headers.get('content-length');
    return { exists: res.status >= 200 && res.status < 400, size: len ? parseInt(len, 10) : null };
  } catch { return { exists: null, size: null }; }
}

async function mapLimit(items, limit, fn) {
  const it = items[Symbol.iterator]();
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) { const n = it.next(); if (n.done) break; await fn(n.value); }
  });
  await Promise.all(workers);
}

/* ------------------------------ helpers --------------------------------- */

function normPath(p) {
  let s = String(p || '/').split('#')[0].split('?')[0];
  try { s = decodeURIComponent(s); } catch { /* keep */ }
  if (!s.startsWith('/')) s = '/' + s;
  if (!s.endsWith('/') && !path.extname(s)) s += '/';
  return s || '/';
}

/** Resolve an href against the current page URL; return an internal pathname or null. */
function toInternalPath(href, base, baseOrigin, siteOrigin) {
  if (!href) return null;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return null;
  if (href.startsWith('#')) return null;
  try {
    const u = new URL(href, base);
    if (u.origin !== baseOrigin && u.origin !== siteOrigin) return null;
    return u.pathname + (u.search || '');
  } catch { return null; }
}

/* -------------------------------- main ---------------------------------- */

async function main() {
  const args = parseArgs(process.argv);
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  let baseOrigin, closeServer = () => {}, dirMode = false, dir = null;
  if (args.url) {
    baseOrigin = new URL(args.url).origin;
  } else {
    dir = path.resolve(args.dir);
    if (!fs.existsSync(dir)) {
      console.error(`Build directory not found: ${dir}\nRun \`npm run build\` first (or pass --url).`);
      process.exit(2);
    }
    dirMode = true;
    const { server, port } = await startServer(dir);
    baseOrigin = `http://127.0.0.1:${port}`;
    closeServer = () => server.close();
  }
  const siteOrigin = new URL(args.siteUrl).origin;

  // In live mode, reachability/size come from a probe pass (below); dir mode
  // resolves against the filesystem. probeCache is keyed by pathname.
  const probeCache = new Map();

  /** Map an asset src (absolute / protocol-relative / root- or doc-relative) to
   *  a same-origin pathname, or null if it's external / data / unparseable. */
  const assetPathname = (src, pageUrl) => {
    if (!src || /^data:/i.test(src)) return null;
    try {
      if (/^(https?:)?\/\//i.test(src)) {
        const u = new URL(src, baseOrigin);
        if (u.origin !== siteOrigin && u.origin !== baseOrigin) return null; // external
        return u.pathname;
      }
      return new URL(src, baseOrigin + (pageUrl || '/')).pathname;
    } catch { return null; }
  };

  const resolveAsset = (src, pageUrl) => {
    const pn = assetPathname(src, pageUrl);
    if (pn == null) return { exists: null, size: null };
    if (dirMode) { const hit = resolveFile(dir, pn); return hit ? { exists: true, size: hit.size } : { exists: false, size: null }; }
    return probeCache.get(pn) || { exists: null, size: null };
  };
  const resolvePage = (p) => {
    const pn = normPath(p);
    if (dirMode) { const hit = resolveFile(dir, pn); return hit ? { exists: true, size: hit.size } : { exists: false }; }
    return probeCache.get(pn) || { exists: null };
  };

  /* ---- crawl (BFS over internal links) ---- */
  const seen = new Set();
  const queue = ['/'];
  const pages = [];
  const linkEdges = []; // { from, target, tPath, isAsset } — resolved after crawl
  const linkedPaths = new Set();

  while (queue.length && pages.length < args.max) {
    const pathname = queue.shift();
    const key = normPath(pathname);
    if (seen.has(key)) continue;
    seen.add(key);

    const { status, contentType, body } = await fetchText(baseOrigin + pathname);
    const page = { url: key, absUrl: siteOrigin + key, status, contentType, html: body, bytes: Buffer.byteLength(body) };

    if (status === 0 || status >= 400) { pages.push(page); continue; } // record error, no link discovery
    const isHtml = /text\/html/i.test(contentType) || (dirMode && /<html/i.test(body));
    if (!isHtml) continue; // non-HTML asset reached directly
    pages.push(page);

    // Discover links: resolve each href against THIS page's URL.
    for (const anchor of H.getAnchors(body)) {
      const target = toInternalPath(anchor.href, baseOrigin + key, baseOrigin, siteOrigin);
      if (target == null) continue;
      const tPath = normPath(target);
      const isAsset = Boolean(path.extname(tPath.replace(/\/$/, '')));
      linkedPaths.add(tPath);
      linkEdges.push({ from: key, target, tPath, isAsset });
      if (!isAsset && !seen.has(tPath)) queue.push(target); // enqueue HTML routes only
    }
  }

  /* ---- site-level context files ---- */
  const grab = async (p) => { const r = await fetchText(baseOrigin + p); return r.status >= 200 && r.status < 400 ? r.body : null; };
  const robots = await grab('/robots.txt');
  const sitemapXml = await grab('/sitemap.xml');
  const llms = await grab('/llms.txt');

  let sitemapLocs = null;
  if (sitemapXml) sitemapLocs = [...sitemapXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
  const toPath = (loc) => { try { return normPath(new URL(loc).pathname); } catch { return normPath(loc); } };
  const sitemapPathSet = new Set((sitemapLocs || []).map(toPath));

  /* ---- live-mode probe pass: fill probeCache for link/image/sitemap targets ---- */
  if (!dirMode) {
    const targets = new Set();
    for (const e of linkEdges) targets.add(e.isAsset ? (assetPathname(e.target) || e.tPath) : e.tPath);
    for (const page of pages) {
      for (const img of H.getImages(page.html || '')) { const pn = assetPathname(img.src, page.url); if (pn) targets.add(pn); }
    }
    for (const loc of (sitemapLocs || [])) targets.add(toPath(loc));
    await mapLimit([...targets], PROBE_CONCURRENCY, async (pn) => { probeCache.set(pn, await probe(baseOrigin + pn)); });
  }

  /* ---- resolve link edges → broken internal links (both modes, uniformly) ---- */
  const brokenLinks = [];
  for (const e of linkEdges) {
    const r = e.isAsset ? resolveAsset(e.target) : resolvePage(e.target);
    if (r && r.exists === false) brokenLinks.push({ from: e.from, target: e.target });
  }

  const ctx = {
    pages, robots, sitemapLocs, llms, brokenLinks, linkedPaths,
    siteOrigin, baseOrigin,
    resolveAsset, resolvePage, toPath, normPath,
    isSitemapPath: (u) => sitemapPathSet.has(normPath(u)),
    aiCrawlerStatus: null,
  };

  /* ---- analyze ---- */
  for (const page of pages) page.analysis = analyzePage(page, ctx);
  for (const page of pages) Object.assign(page, page.analysis); // lift fields for reporting/dedup
  const siteResult = analyzeSite(ctx);

  const allFindings = [...siteResult.findings, ...pages.flatMap((p) => p.findings)];
  const scored = score(allFindings);

  const result = {
    meta: { target: args.url || `${args.dir}/ (served locally)`, timestamp, pageCount: pages.length },
    overall: scored.overall,
    grade: scored.grade,
    categories: scored.categories,
    pages,
    siteFindings: siteResult.findings,
    aiCrawlerStatus: siteResult.aiCrawlerStatus,
  };

  closeServer();

  /* ---- output ---- */
  if (!args.quiet) report.printConsole(result);
  const outDir = path.resolve(args.out);
  report.writeJson(result, outDir);
  if (!args.jsonOnly) report.writeHtml(result, outDir);
  if (!args.quiet) console.log(`  Reports written to ${path.relative(process.cwd(), outDir) || outDir}/ (index.html, audit-data.json, report.json)\n`);

  /* ---- exit code (CI gating) ---- */
  const threshold = SEV_ORDER[capitalize(args.failOn)];
  if (args.failOn !== 'none' && threshold != null) {
    const worst = Math.min(...allFindings.map((f) => SEV_ORDER[f.severity]), 99);
    if (worst <= threshold) process.exitCode = 1;
  }
}

const capitalize = (s) => s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s;

main().catch((err) => { console.error(err); process.exit(1); });
