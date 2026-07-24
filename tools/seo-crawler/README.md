# OOVERT SEO crawler

A dependency-free Node.js SEO auditor for the built site. It serves `_site`
over a local static server (or crawls a live URL), follows internal links
breadth-first, and runs an on-page / technical / content / schema / images /
AI-search check set on every page plus the site as a whole — then scores it
with the weighted model from
[AgricIDaniel/claude-seo](https://github.com/AgricIDaniel/claude-seo)'s
`seo-audit` skill.

No dependencies, no `npm install` for the crawler itself — just Node ≥ 18
(uses the built-in `http` server and global `fetch`).

## Usage

```sh
npm run build            # produce ./_site
npm run seo              # audit ./_site  (alias: node tools/seo-crawler/crawl.js)

# or in one step:
npm run seo:audit        # build + crawl + score

# crawl the live site instead of the local build:
node tools/seo-crawler/crawl.js --url https://oovert.com
```

### Flags

| Flag | Default | Meaning |
|------|---------|---------|
| `--dir <path>` | `_site` | built site directory to serve & audit |
| `--url <baseUrl>` | — | crawl a live origin instead of a local directory |
| `--site-url <url>` | `https://oovert.com` | production origin for sitemap/canonical path matching |
| `--out <dir>` | `seo-report` | report output directory |
| `--max <n>` | `200` | max pages to crawl |
| `--fail-on <sev>` | `critical` | exit non-zero if a finding at/above this severity exists (`critical\|high\|medium\|low\|none`) |
| `--json-only` | — | skip the HTML report |
| `--quiet` | — | suppress the console report |

## Output

Written to `./seo-report/` (git-ignored, regenerable):

- `index.html` — standalone, theme-aware visual report
- `audit-data.json` — envelope compatible with the claude-seo report tooling
- `report.json` — full per-page + per-finding detail

Plus a console summary with the health score, category bars, per-page rollup,
ranked findings, and AI-crawler access.

## What it checks

- **On-Page** — title (len), meta description (len), single H1, heading
  hierarchy, Open Graph, Twitter cards, duplicate title/description across pages
- **Technical** — canonical, robots meta / noindex, `lang`, viewport, charset,
  HTTP status, broken internal links, orphan pages, sitemap coverage &
  reachability, robots.txt + Sitemap directive
- **Content** — visible word count / thin-content
- **Schema** — JSON-LD presence & validity, `@graph` handling, deprecated
  rich-result types (FAQPage/HowTo)
- **Images** — missing `alt`, missing width/height (CLS), file weight
  (>200KB / >500KB), unresolved sources
- **AI Search (GEO)** — AI-crawler access in robots.txt (GPTBot, ClaudeBot,
  PerplexityBot, OAI-SearchBot, …), `llms.txt` presence, SSR (server-rendered
  markup)
- **Performance** — render-blocking `<head>` scripts (heuristic)

> Content, Performance, and real Core Web Vitals need field data
> (PageSpeed/CrUX/GA4). Those are heuristic here and flagged as such in the
> report. Use the `seo-google` skill + full claude-seo plugin for field data.

## Scoring

Category weights mirror the `seo-audit` skill: Technical 22 · Content 23 ·
On-Page 20 · Schema 10 · Performance 10 · AI Search 10 · Images 5. Each category
starts at 100 and loses points per finding (Critical −40, High −20, Medium −10,
Low −4); the overall score is the weighted sum.

## Layout

```
tools/seo-crawler/
  crawl.js        CLI, static server, BFS crawl, resolvers, orchestration
  lib/html.js     dependency-free HTML extraction
  lib/checks.js   the SEO rule set (page-level + site-level)
  lib/score.js    weighted scoring model
  lib/report.js   console + JSON + HTML output
```
