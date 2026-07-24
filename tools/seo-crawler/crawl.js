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

/* ------------------------------- CLI ------------------------------------ */

function parseArgs(argv) {
  const a = { dir: '_site', url: null, siteUrl: 'https://oovert.com', out: 'seo-report', max: 200, failOn: 'critical', jsonOnly: false, quiet: false };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const next = () => argv[++i];
    if (k === '--dir') a.dir = next();
    else if (k === '--url') a.url = next();
    else if (k === '--site-url') a.siteUrl = next();
    else if (k === '--out') a.out = next();
    else if (k === '--max') a.max = parseInt(next(), 10) || a.max;
    else if (k === '--fail-on') a.failOn = String(next()).toLowerCase();
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

/** Map a URL pathname to a file inside the served directory (clean-URL aware). */
function resolveFile(dir, pathname) {
  let p = decodeURIComponent(pathname.split('?')[0].split('#')[0]);
  if (!p.startsWith('/')) p = '/' + p;
  const candidates = [];
  if (p.endsWith('/')) candidates.push(path.join(dir, p, 'index.html'));
  else if (path.extname(p)) candidates.push(path.join(dir, p));
  else candidates.push(path.join(dir, p + '/index.html'), path.join(dir, p + '.html'), path.join(dir, p));
  for (const file of candidates) {
    try { const st = fs.statSync(file); if (st.isFile()) return { file, size: st.size }; } catch { /* next */ }
  }
  return null;
}

function startServer(dir) {
  const server = http.createServer((req, res) => {
    const hit = resolveFile(dir, req.url);
    if (!hit) { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('404'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(hit.file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(hit.file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}

/* ------------------------------ helpers --------------------------------- */

function normPath(p) {
  let s = String(p || '/').split('#')[0].split('?')[0];
  try { s = decodeURIComponent(s); } catch { /* keep */ }
  if (!s.startsWith('/')) s = '/' + s;
  if (!s.endsWith('/') && !path.extname(s)) s += '/';
  return s || '/';
}

/** Classify an href relative to the site; return an internal pathname or null. */
function toInternalPath(href, origin, siteOrigin) {
  if (!href) return null;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return null;
  if (href.startsWith('#')) return null;
  try {
    const u = new URL(href, origin);
    const isInternal = u.origin === origin || u.origin === siteOrigin;
    if (!isInternal) return null;
    return u.pathname + (u.search || '');
  } catch { return null; }
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'manual' });
  const status = res.status;
  const ct = res.headers.get('content-type') || '';
  const body = status >= 200 && status < 400 ? await res.text() : '';
  return { status, contentType: ct, body, bytes: Buffer.byteLength(body) };
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

  // Resolvers used by the checks (filesystem in dir mode, best-effort otherwise).
  const resolvePage = (p) => {
    if (dirMode) { const hit = resolveFile(dir, p); return hit ? { exists: true, size: hit.size, file: hit.file } : { exists: false }; }
    return { exists: null };
  };
  const resolveAsset = (src) => {
    if (!src || /^data:/i.test(src)) return { exists: null, size: null };
    let pathname = src;
    if (/^https?:/i.test(src)) {
      try { const u = new URL(src); if (u.origin !== siteOrigin && u.origin !== baseOrigin) return { exists: null, size: null }; pathname = u.pathname; }
      catch { return { exists: null, size: null }; }
    }
    if (dirMode) { const hit = resolveFile(dir, pathname); return hit ? { exists: true, size: hit.size } : { exists: false, size: null }; }
    return { exists: null, size: null };
  };

  /* ---- crawl (BFS over internal links) ---- */
  const seen = new Set();
  const queue = ['/'];
  const pages = [];
  const brokenLinks = [];
  const linkedPaths = new Set();
  const resolveCache = new Map();

  while (queue.length && pages.length < args.max) {
    const pathname = queue.shift();
    const key = normPath(pathname);
    if (seen.has(key)) continue;
    seen.add(key);

    const { status, contentType, body } = await fetchText(baseOrigin + pathname);
    const isHtml = /text\/html/i.test(contentType) || (dirMode && status < 400 && /<html/i.test(body));
    if (!isHtml && status < 400) continue; // non-HTML asset reached directly; skip auditing

    const page = { url: key, absUrl: siteOrigin + key, status, contentType, html: body, bytes: Buffer.byteLength(body) };
    pages.push(page);

    if (status >= 400 || !body) continue;

    // Discover links: enqueue internal HTML routes, record link graph, flag broken.
    for (const anchor of H.getAnchors(body)) {
      const target = toInternalPath(anchor.href, baseOrigin, siteOrigin);
      if (target == null) continue;
      const tPath = normPath(target);
      linkedPaths.add(tPath);

      // Broken-link check (cache resolution per target).
      if (!resolveCache.has(tPath)) {
        const isAsset = Boolean(path.extname(tPath.replace(/\/$/, '')));
        resolveCache.set(tPath, isAsset ? resolveAsset(target) : resolvePage(target));
      }
      const r = resolveCache.get(tPath);
      if (r && r.exists === false) brokenLinks.push({ from: key, target });

      // Enqueue HTML routes only (no file extension → a page route).
      if (!path.extname(tPath.replace(/\/$/, '')) && !seen.has(tPath)) queue.push(target);
    }
  }

  /* ---- site-level context files ---- */
  const grab = async (p) => { const r = await fetchText(baseOrigin + p); return r.status < 400 ? r.body : null; };
  const robots = await grab('/robots.txt');
  const sitemapXml = await grab('/sitemap.xml');
  const llms = await grab('/llms.txt');

  let sitemapLocs = null;
  if (sitemapXml) {
    sitemapLocs = [...sitemapXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
  }
  const toPath = (loc) => { try { return normPath(new URL(loc).pathname); } catch { return normPath(loc); } };
  const sitemapPathSet = new Set((sitemapLocs || []).map(toPath));

  const ctx = {
    pages, robots, sitemapLocs, llms, brokenLinks, linkedPaths,
    siteOrigin, baseOrigin,
    resolveAsset, resolvePage, toPath, normPath,
    isSitemapPath: (u) => sitemapPathSet.has(normPath(u)),
    aiCrawlerStatus: null,
  };

  /* ---- analyze ---- */
  for (const page of pages) page.analysis = analyzePage(page, ctx);
  // Lift the per-page analysis fields onto the page for reporting/dedup.
  for (const page of pages) Object.assign(page, page.analysis);
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
