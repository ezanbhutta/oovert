# SEO skills & agents (vendored)

These `.claude/skills/*` and `.claude/agents/*` files give any Claude Code
session working on this repo a full SEO methodology — on-page, technical,
content/E-E-A-T, schema, sitemaps, images, and AI-search (GEO) — plus
specialist sub-agents an audit can delegate to.

## Provenance & license

Adapted from **[AgricIDaniel/claude-seo](https://github.com/AgricIDaniel/claude-seo)**
(MIT). The upstream license is preserved in `CLAUDE-SEO-LICENSE.txt`; individual
skill folders keep their own `LICENSE.txt` where present. Credit to the
claude-seo maintainer and contributors.

## What's installed here (curated for oovert.com)

A static, single-language agency/studio marketing site. The vendored set is the
slice that applies:

| Skill | Purpose |
|-------|---------|
| `seo` | Orchestrator / routing + core SEO reference library |
| `seo-audit` | Full-site audit methodology (scoring model the crawler mirrors) |
| `seo-page` | Deep single-page analysis |
| `seo-technical` | Technical SEO (crawl, index, canonicals, headers) |
| `seo-content` | E-E-A-T & content quality |
| `seo-content-brief` | Content brief generation |
| `seo-schema` | Schema.org / JSON-LD detection & generation |
| `seo-sitemap` | Sitemap analysis & generation |
| `seo-images` | Image optimization |
| `seo-geo` | AI-search / GEO (AI Overviews, ChatGPT, Perplexity) |
| `seo-plan` | Strategic planning (see `seo-plan/assets/agency.md`) |
| `seo-cluster` | Semantic topic clustering |
| `seo-sxo` | Search-experience optimization |

Agents: `seo-technical`, `seo-content`, `seo-schema`, `seo-sitemap`, `seo-geo`,
`seo-performance`, `seo-visual`.

**Not vendored** (need paid APIs or target other business types): Google APIs,
backlinks, local, maps, e-commerce, DataForSEO, hreflang, programmatic,
competitor-pages, drift, flow, image-gen. Install the full plugin globally to
get them (below).

## Important: execution layer

Upstream skills sometimes say `claude-seo run <script>.py`. **That Python
execution layer is not installed in this repo.** For the mechanical crawl/audit
work it covers, use the local, dependency-free Node crawler instead:

```sh
npm run seo:audit      # build + crawl + score, writes ./seo-report/
```

See `tools/seo-crawler/README.md`. Treat the skills as the *methodology*; the
crawler is the *execution* for this site.

## Getting the full plugin (all 25 skills + API tools)

For the API-backed tools (GSC, CrUX, GA4, backlinks, DataForSEO, …) install the
complete plugin in your own Claude Code:

```
/plugin marketplace add AgricIDaniel/claude-seo
/plugin install claude-seo
```

That's a user-global install and is independent of what's committed here.
