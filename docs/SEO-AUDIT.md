# OOVERT — SEO audit baseline

Baseline snapshot from the in-repo crawler (`npm run seo:audit`), 2026-07-24.
Regenerate anytime; the machine-readable output lands in `./seo-report/`.

## Score

**84 / 100 — B (Good).** Category weights follow the claude-seo `seo-audit` model.

| Category | Score | Notes |
|----------|:----:|-------|
| Technical | 100 | Clean: canonical, robots, viewport, `lang`, charset, no broken links, no orphans |
| Content | 90 | One thin page (`/work/` index) |
| On-Page | 52 | Short subpage titles + two long meta descriptions |
| Schema | 80 | Homepage has Organization + FAQ JSON-LD; subpages have none |
| Performance | 100 | No render-blocking head scripts (heuristic — see caveat) |
| AI Search | 100 | All AI crawlers allowed; `llms.txt` present; server-rendered |
| Images | 50 | The not-yet-added NOWA case-study images |

> Performance & Content are heuristic from static HTML. Real Core Web Vitals
> (LCP/INP/CLS) and readability need field data — use the `seo-google` skill +
> full claude-seo plugin (PageSpeed/CrUX/GA4) when you want measured numbers.

## Site-level: clean ✓

No broken internal links · no orphan pages · every crawled page is in
`sitemap.xml` and every sitemap URL resolves · no duplicate titles or
descriptions · `robots.txt` + `Sitemap:` directive present · `llms.txt` present
· GPTBot / ClaudeBot / PerplexityBot / OAI-SearchBot all allowed.

## Findings by priority

### Known / pending (not a regression)
- **`/work/nowa-brand-identity/` — 8 unresolved image sources + 1 empty `<img>`,
  9 missing dimensions.** These are the case-study placeholders
  (`stationery-1.jpg`, `social-1.jpg`, `env-billboard.jpg`, … with `[Project]`
  alt text) that haven't had real images dropped in yet. The crawler will go
  green here once the assets are added (the eleventy-img pipeline will supply
  `width`/`height` automatically). Nothing to fix in code.

### Quick wins (Medium)
- **Short subpage titles** — `/work/` (“Work — OOVERT”, 13), `/approach/` (17),
  `/studio/` (15), `/work/nowa-brand-identity/` (24). Optimal is ~50–60 chars.
  Consider e.g. “Selected Work — Brand Strategy & Identity | OOVERT”. *(Editorial
  call — the terse convention is intentional; only widen if you want fuller SERP
  snippets.)*
- **Thin `/work/` index (121 words)** — expected for a gallery page; add a short
  intro paragraph if you want it to carry more indexable copy.

### Optimization (Low)
- **Two meta descriptions over ~165 chars** — `/work/` (175), `/studio/` (192)
  may truncate in results; trim toward ~160.
- **No structured data on subpages** — add `BreadcrumbList` sitewide and a
  `CreativeWork`/`Article` block on the case study; a `Service`/`WebPage` block
  on `/approach/` and `/studio/`. (Homepage already ships Organization + FAQ.)
- **FAQPage** on the homepage no longer earns rich results (retired 2026) — valid
  markup, safe to keep; just don’t count on FAQ rich snippets.

## Suggested next steps (SEO setup)

1. Drop the real NOWA case-study images in → Images returns to ~100.
2. Add `BreadcrumbList` + per-page schema (use the `seo-schema` skill / agent).
3. Decide on the title convention (terse vs. descriptive) and trim the two long
   meta descriptions.
4. When you want measured performance & indexation, wire up the Google APIs via
   the `seo-google` skill and the full claude-seo plugin.

Run `npm run seo:audit` after any change to see the score move.
