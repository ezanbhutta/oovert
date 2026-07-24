/**
 * checks.js — the SEO rule set for the OOVERT crawler.
 *
 * Thresholds and categories mirror the AgricIDaniel/claude-seo methodology:
 *   title 50-60, meta description ~150-160, exactly one H1, clean heading
 *   hierarchy, canonical + robots + viewport + lang, OG/Twitter cards, JSON-LD
 *   (no deprecated FAQPage/HowTo), image alt + dimensions + weight, AI-crawler
 *   access, llms.txt, SSR. Findings feed the weighted score in score.js.
 *
 * A finding is: { category, severity, title, detail, recommendation, url }.
 */

'use strict';

const H = require('./html');

const CATEGORIES = ['Technical', 'Content', 'On-Page', 'Schema', 'Performance', 'AI Search', 'Images'];

const T = {
  TITLE_MIN: 30, TITLE_OPT_LOW: 50, TITLE_OPT_HIGH: 60,
  DESC_MIN: 70, DESC_OPT_LOW: 140, DESC_OPT_HIGH: 160, DESC_MAX: 165,
  THIN_WORDS: 250,
  IMG_WARN: 200 * 1024, IMG_CRIT: 500 * 1024,
};

// AI crawlers worth allowing for AI-search visibility (from seo-geo SKILL).
const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'CCBot', 'Bytespider'];
const AI_SEARCH_BOTS = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot']; // the ones you generally want allowed
const DEPRECATED_SCHEMA = new Set(['HowTo', 'FAQPage', 'SpecialAnnouncement']);

const f = (category, severity, title, detail, recommendation, url) =>
  ({ category, severity, title, detail, recommendation, url });

/* -------------------------------------------------------------------------- */
/* Per-page analysis                                                          */
/* -------------------------------------------------------------------------- */

function analyzePage(page, ctx) {
  const { url, html } = page;
  const findings = [];
  const add = (...args) => findings.push(f(...args, url));

  // --- crawl status --------------------------------------------------------
  // On an error/unreachable status the body is empty or an error page; run only
  // this finding and stop, so we don't emit a cluster of spurious on-page
  // defects (missing title, no H1, …) against a discarded body.
  if (page.status >= 400 || page.status === 0) {
    add('Technical', 'Critical',
      page.status === 0 ? 'Page unreachable' : `Page returned HTTP ${page.status}`,
      page.status === 0 ? `Crawler could not fetch ${url}.` : `Crawler received status ${page.status} for ${url}.`,
      'Ensure the route builds and resolves to a 200 response.');
    return { url, status: page.status, title: null, description: null, wordCount: 0, headings: [], jsonldTypes: [], canonical: null, findings };
  }

  const metas = H.getMetas(html);
  const headings = H.getHeadings(html);
  const images = H.getImages(html);
  const jsonld = H.getJsonLd(html);
  const text = H.visibleText(html);
  const wordCount = text ? text.split(/\s+/).length : 0;

  // --- On-Page: title ------------------------------------------------------
  const title = H.getTitle(html);
  if (!title) {
    add('On-Page', 'Critical', 'Missing <title>',
      'No title element was found in the document head.',
      'Add a unique, descriptive <title> of about 50–60 characters.');
  } else {
    const n = title.length;
    if (n < T.TITLE_MIN) {
      add('On-Page', 'Medium', `Title is short (${n} chars)`,
        `"${title}"`, 'Aim for 50–60 characters so the SERP snippet is fully used.');
    } else if (n > T.TITLE_OPT_HIGH) {
      add('On-Page', 'Low', `Title may truncate (${n} chars)`,
        `"${title}"`, 'Keep the title within ~60 characters to avoid SERP truncation.');
    }
  }

  // --- On-Page: meta description ------------------------------------------
  const desc = H.metaByName(metas, 'description');
  if (desc == null) {
    add('On-Page', 'High', 'Missing meta description',
      'No <meta name="description"> was found.',
      'Add a compelling 150–160 character description with the primary theme.');
  } else {
    const n = desc.length;
    if (n < T.DESC_MIN) {
      add('On-Page', 'Medium', `Meta description is short (${n} chars)`,
        `"${desc}"`, 'Expand toward ~150–160 characters to earn a fuller snippet.');
    } else if (n > T.DESC_MAX) {
      add('On-Page', 'Low', `Meta description may truncate (${n} chars)`,
        `"${desc}"`, 'Trim to ~160 characters so it is not cut off in results.');
    }
  }

  // --- On-Page: headings ---------------------------------------------------
  const h1s = headings.filter((h) => h.level === 1);
  if (h1s.length === 0) {
    add('On-Page', 'High', 'No H1 heading',
      'The page has no <h1>.', 'Add exactly one H1 that states the page’s subject.');
  } else if (h1s.length > 1) {
    add('On-Page', 'Medium', `Multiple H1 headings (${h1s.length})`,
      `H1s: ${h1s.map((h) => `"${h.text}"`).join(', ')}`,
      'Use a single H1; demote the rest to H2/H3.');
  }
  let prev = 0, skipped = false;
  for (const h of headings) {
    if (prev && h.level > prev + 1 && !skipped) {
      add('On-Page', 'Low', 'Heading level skipped',
        `Jump from H${prev} to H${h.level} ("${h.text}").`,
        'Keep the outline sequential (don’t skip heading levels) for accessibility and parsing.');
      skipped = true; // report once per page
    }
    prev = h.level;
  }

  // --- Technical: canonical / robots / lang / viewport / charset ----------
  const canonical = H.getCanonical(html);
  if (!canonical) {
    add('Technical', 'Medium', 'Missing canonical link',
      'No <link rel="canonical"> found.', 'Add a self-referencing absolute canonical URL.');
  } else if (!/^https?:\/\//i.test(canonical)) {
    add('Technical', 'Low', 'Canonical is not absolute',
      `canonical="${canonical}"`, 'Use an absolute https:// canonical URL.');
  } else {
    page.canonical = canonical;
  }

  const robots = H.metaByName(metas, 'robots') || '';
  if (/noindex/i.test(robots)) {
    const sev = ctx.isSitemapPath(url) ? 'High' : 'Info';
    add('Technical', sev, 'Page is set to noindex',
      `<meta name="robots" content="${robots}">`,
      ctx.isSitemapPath(url)
        ? 'This URL is in the sitemap but blocked from indexing — remove noindex or drop it from the sitemap.'
        : 'Confirm this exclusion is intentional (e.g. the 404 page).');
  }

  if (!H.getHtmlLang(html)) {
    add('Technical', 'Medium', 'Missing lang attribute',
      'The <html> element has no lang attribute.', 'Add lang="en" (or the correct locale) to <html>.');
  }
  const hasViewport = metas.some((m) => (m.name || '').toLowerCase() === 'viewport');
  if (!hasViewport) {
    add('Technical', 'High', 'Missing viewport meta',
      'No responsive viewport meta tag.', 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.');
  }
  const headerHasCharset = /charset=/i.test(page.contentType || '');
  const hasCharset = headerHasCharset || metas.some((m) => m.charset || /charset=/i.test(m['http-equiv'] ? m.content || '' : ''));
  if (!hasCharset) {
    add('Technical', 'Low', 'No charset declaration',
      'No <meta charset> found in the head.', 'Add <meta charset="utf-8"> as the first head element.');
  }

  // --- Social: Open Graph / Twitter ---------------------------------------
  const ogNeeded = ['og:title', 'og:description', 'og:image', 'og:url'];
  const ogMissing = ogNeeded.filter((p) => !H.metaByProperty(metas, p));
  if (ogMissing.length) {
    add('On-Page', 'Low', `Open Graph tags missing: ${ogMissing.join(', ')}`,
      'Incomplete Open Graph metadata weakens link unfurls on social/chat.',
      'Add the missing og:* tags so shared links render a rich card.');
  }
  const twCard = H.metaByName(metas, 'twitter:card');
  if (!twCard) {
    add('On-Page', 'Low', 'Missing twitter:card',
      'No twitter:card meta tag.', 'Add twitter:card (summary_large_image) plus title/description/image.');
  }

  // --- Content -------------------------------------------------------------
  if (page.status < 400 && wordCount < T.THIN_WORDS) {
    add('Content', 'Medium', `Thin content (${wordCount} words)`,
      `Only ~${wordCount} words of visible text.`,
      'Ensure the page carries enough substantive, indexable copy for its intent.');
  }

  // --- Schema --------------------------------------------------------------
  const jsonldTypes = [];
  for (const block of jsonld) {
    if (block.error) {
      add('Schema', 'High', 'Invalid JSON-LD',
        `Parse error: ${block.error}`, 'Fix the JSON-LD syntax so search engines can read the structured data.');
      continue;
    }
    // JSON-LD that parses to null or a non-object primitive (e.g. the literal
    // `null`) is valid JSON but has no schema nodes — treat it as empty rather
    // than dereferencing it (which would throw and abort the crawl).
    const data = block.data;
    const nodes = Array.isArray(data) ? data
      : (data && typeof data === 'object' && data['@graph']) ? data['@graph']
      : (data && typeof data === 'object') ? [data]
      : [];
    for (const node of nodes) {
      const type = node && node['@type'];
      const types = Array.isArray(type) ? type : [type];
      for (const ty of types.filter(Boolean)) {
        jsonldTypes.push(ty);
        if (DEPRECATED_SCHEMA.has(ty)) {
          add('Schema', 'Low', `Deprecated rich-result type: ${ty}`,
            `${ty} no longer earns rich results in Google Search (retired 2026). It is valid markup and safe to keep.`,
            'Don’t rely on it for rich snippets; use QAPage for genuine Q&A. No need to remove existing markup.');
        }
      }
    }
  }
  page.jsonldTypes = jsonldTypes;
  if (jsonldTypes.length === 0 && page.status < 400) {
    add('Schema', 'Low', 'No structured data',
      'No JSON-LD structured data on this page.',
      'Add relevant schema (Organization on home, Article/Service/BreadcrumbList elsewhere) for richer results and AI parsing.');
  }

  // --- Images --------------------------------------------------------------
  let missingAlt = 0, missingDims = 0, oversizeWarn = 0, oversizeCrit = 0, broken = 0;
  for (const img of images) {
    if (img.alt === null) missingAlt++;
    if (!img.width || !img.height) missingDims++;
    // Resolve the src against THIS page's URL so document-relative sources
    // (e.g. "stationery-1.jpg" on /work/x/) map correctly; the resolver returns
    // exists:null for external/data/protocol-relative URLs (not our files).
    const res = ctx.resolveAsset(img.src, url);
    if (res && res.exists === false) {
      broken++;
    } else if (res && res.size != null) {
      if (res.size > T.IMG_CRIT) oversizeCrit++;
      else if (res.size > T.IMG_WARN) oversizeWarn++;
    }
  }
  if (missingAlt) {
    add('Images', 'High', `${missingAlt} image(s) missing alt text`,
      'Images without an alt attribute are invisible to screen readers and image search.',
      'Add descriptive alt text (empty alt="" only for purely decorative images).');
  }
  if (missingDims) {
    add('Images', 'Medium', `${missingDims} image(s) without width/height`,
      'Missing intrinsic dimensions cause layout shift (CLS).',
      'Set width and height (the eleventy-img pipeline adds these — check any hand-authored <img>).');
  }
  if (oversizeCrit) {
    add('Images', 'High', `${oversizeCrit} image(s) over 500KB`,
      'Very large images hurt LCP and mobile data use.', 'Compress or resize; prefer AVIF/WebP.');
  }
  if (oversizeWarn) {
    add('Images', 'Medium', `${oversizeWarn} image(s) over 200KB`,
      'Oversized images slow the page.', 'Compress or serve smaller responsive sizes.');
  }
  if (broken) {
    add('Images', 'High', `${broken} image(s) with an unresolved source`,
      'One or more <img src> did not resolve to a file.', 'Fix the src path so the asset loads.');
  }

  // --- Performance (heuristic from HTML; real CWV needs field data) --------
  const head = H.headHtml(html);
  const blocking = H.getScripts(head).filter((s) => s.src && !s.async && !s.defer && !s.module);
  if (blocking.length) {
    add('Performance', 'Medium', `${blocking.length} render-blocking script(s) in <head>`,
      'Synchronous head scripts delay first paint and interactivity.',
      'Add defer/async or use type="module", or move the script to the end of <body>.');
  }

  return {
    url,
    status: page.status,
    title,
    description: desc,
    wordCount,
    headings,
    jsonldTypes,
    canonical: page.canonical || canonical || null,
    findings,
  };
}

/* -------------------------------------------------------------------------- */
/* Robots.txt parsing + AI-crawler access                                     */
/* -------------------------------------------------------------------------- */

function parseRobots(txt) {
  const groups = [];
  let current = null;
  for (const raw of String(txt || '').split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (field === 'user-agent') {
      if (current && current._hasRules) current = null;
      if (!current) { current = { agents: [], allow: [], disallow: [], _hasRules: false }; groups.push(current); }
      current.agents.push(value.toLowerCase());
    } else if (current && (field === 'allow' || field === 'disallow')) {
      current._hasRules = true;
      current[field].push(value);
    }
  }
  return groups;
}

/** True if `bot` is blocked from `/` (its own group, else the * group). */
function isBotBlocked(groups, bot) {
  const lc = bot.toLowerCase();
  const own = groups.find((g) => g.agents.includes(lc));
  const star = groups.find((g) => g.agents.includes('*'));
  const g = own || star;
  if (!g) return false;
  // Only an explicit "Disallow: /" blocks everything. An empty "Disallow:"
  // value is the canonical allow-all directive and must NOT count as a block.
  return g.disallow.some((d) => d === '/');
}

/* -------------------------------------------------------------------------- */
/* Site-level analysis                                                        */
/* -------------------------------------------------------------------------- */

function analyzeSite(ctx) {
  const findings = [];
  const add = (...args) => findings.push(f(...args, '(site)'));
  const pages = ctx.pages;

  // --- robots.txt ----------------------------------------------------------
  if (ctx.robots == null) {
    add('Technical', 'High', 'No robots.txt',
      'robots.txt was not found at the site root.',
      'Add /robots.txt with an Allow rule and a Sitemap: directive.');
  } else {
    const groups = parseRobots(ctx.robots);
    const wanted = AI_SEARCH_BOTS.filter((b) => isBotBlocked(groups, b));
    ctx.aiCrawlerStatus = AI_CRAWLERS.map((b) => ({ bot: b, blocked: isBotBlocked(groups, b) }));
    if (wanted.length) {
      add('AI Search', 'Medium', `AI search crawlers blocked: ${wanted.join(', ')}`,
        'These bots feed ChatGPT/Claude/Perplexity search and are disallowed.',
        'Allow GPTBot, OAI-SearchBot, ClaudeBot and PerplexityBot for AI-search visibility.');
    }
    if (!/sitemap:/i.test(ctx.robots)) {
      add('Technical', 'Low', 'robots.txt has no Sitemap directive',
        'No Sitemap: line in robots.txt.', 'Add "Sitemap: https://<domain>/sitemap.xml".');
    }
  }

  // --- sitemap.xml ---------------------------------------------------------
  if (ctx.sitemapLocs == null) {
    add('Technical', 'High', 'No sitemap.xml',
      'sitemap.xml was not found or could not be parsed.',
      'Publish an XML sitemap and reference it from robots.txt.');
  } else {
    const sitemapPaths = new Set(ctx.sitemapLocs.map(ctx.toPath));
    // Crawled indexable pages missing from the sitemap.
    for (const p of pages) {
      if (p.status >= 400) continue;
      if (/noindex/i.test(H.metaByName(H.getMetas(p.html), 'robots') || '')) continue;
      if (!sitemapPaths.has(ctx.normPath(p.url))) {
        add('Technical', 'Medium', `Page not in sitemap: ${p.url}`,
          'An indexable, crawled page is absent from sitemap.xml.',
          'Add the URL to the sitemap so it is discovered and prioritized.');
      }
    }
    // Sitemap URLs that do not resolve.
    for (const loc of ctx.sitemapLocs) {
      const path = ctx.toPath(loc);
      const res = ctx.resolvePage(path);
      // Only flag a *confirmed* miss (exists === false). In live --url mode the
      // resolver returns exists: null ("unknown"), which must not be treated as
      // unreachable — mirrors the broken-link / image guards.
      if (res.exists === false) {
        add('Technical', 'High', `Sitemap URL is unreachable: ${loc}`,
          'A sitemap entry does not resolve to a page.',
          'Remove dead entries or fix the route so it returns 200.');
      }
    }
  }

  // --- llms.txt (report only; Google Search ignores it) --------------------
  if (ctx.llms == null) {
    add('AI Search', 'Low', 'No llms.txt',
      'No /llms.txt file. Google Search ignores it, but some non-Google AI tools read it.',
      'Optional: publish /llms.txt with a concise site summary and key links.');
  }

  // --- broken internal links ----------------------------------------------
  if (ctx.brokenLinks.length) {
    const byTarget = new Map();
    for (const bl of ctx.brokenLinks) {
      if (!byTarget.has(bl.target)) byTarget.set(bl.target, new Set());
      byTarget.get(bl.target).add(bl.from);
    }
    for (const [target, froms] of byTarget) {
      add('Technical', 'High', `Broken internal link: ${target}`,
        `Linked from: ${[...froms].join(', ')}`,
        'Fix or remove the link; broken links waste crawl budget and hurt UX.');
    }
  }

  // --- duplicate titles / descriptions ------------------------------------
  dupCheck(pages, 'title', 'Duplicate <title>', add, 'On-Page');
  dupCheck(pages, 'description', 'Duplicate meta description', add, 'On-Page');

  // --- orphan pages (crawled/sitemap but not linked from any page) --------
  if (ctx.linkedPaths) {
    for (const p of pages) {
      if (p.status >= 400) continue;
      if (p.url === '/') continue; // home is the entry point
      if (!ctx.linkedPaths.has(ctx.normPath(p.url))) {
        add('Technical', 'Low', `Orphan page: ${p.url}`,
          'This page is not linked from any crawled page (only reachable directly).',
          'Add an internal link so users and crawlers can discover it in context.');
      }
    }
  }

  return { findings, aiCrawlerStatus: ctx.aiCrawlerStatus || null };
}

function dupCheck(pages, key, label, add, category) {
  const map = new Map();
  for (const p of pages) {
    if (p.status >= 400) continue;
    const val = (p[key] || '').trim();
    if (!val) continue;
    if (!map.has(val)) map.set(val, []);
    map.get(val).push(p.url);
  }
  for (const [val, urls] of map) {
    if (urls.length > 1) {
      add(category, 'Medium', `${label} across ${urls.length} pages`,
        `"${val.length > 80 ? val.slice(0, 77) + '…' : val}" on: ${urls.join(', ')}`,
        'Make each page’s title/description unique to its content.');
    }
  }
}

module.exports = { analyzePage, analyzeSite, parseRobots, isBotBlocked, CATEGORIES, AI_CRAWLERS, AI_SEARCH_BOTS, T };
