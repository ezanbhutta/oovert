# OOVERT — Keyword Research Audit

_Audit date: 2026-07-24. Verified against the live production build (all pages
crawled and read), not assumed. Competitive/industry research via web search._

> **Data caveat, stated up front:** no keyword-**volume** API (DataForSEO, Ahrefs,
> Google Keyword Planner) is connected to this project, so search-volume and
> difficulty figures below are **industry-informed estimates**, not pulled
> metrics. Intent, cannibalization, and gap analysis are exact (read from the
> live pages). Connecting the `seo-google` skill's Keyword Planner or a
> DataForSEO key would upgrade the volume/difficulty columns to real numbers —
> recommended as a follow-up.

---

## Part 1 — What is already implemented (verified, live)

Every page already ships an optimized `<title>`, keyword-bearing meta
description, canonical, Open Graph/Twitter, and JSON-LD. This is a **strong
starting position** — most sites audited from scratch lack these.

| Page | `<title>` (live) | Meta description keywords | Schema on page |
|------|------------------|---------------------------|----------------|
| `/` | OOVERT · Brand Strategy and Identity Studio | brand strategy, identity studio, name companies, design brand | Organization (ProfessionalService) + **4× Service** + **FAQPage (6 Q)** |
| `/work/` | Selected Work in Brand Identity & Naming — OOVERT | brand strategy, naming, identity, senior | CollectionPage + BreadcrumbList |
| `/approach/` | Our Approach to Brand Strategy & Identity — OOVERT | strategy, positioning, identity, rollout | BreadcrumbList |
| `/studio/` | A Distributed Brand Identity Studio — OOVERT | distributed studio, six timezones, four disciplines | BreadcrumbList |
| `/work/nowa-brand-identity/` | NOWA Brand Identity — Case Study by OOVERT | brand identity case study | CreativeWork + BreadcrumbList |

**Also live & verified:** `robots.txt` (allows Googlebot + AI crawlers),
`sitemap.xml` (all 5 URLs), `llms.txt` (AI-answer-engine summary), per-page OG
images, IndexNow auto-submission on deploy, Google Search Console + Bing
verified with sitemap submitted.

### Body keyword density (live)
`brand strategy`, `positioning`, `guidelines`, `naming`, `brand identity`,
`distributed`, `rebrand` all appear across the relevant pages. The homepage is
strategy-led (brand strategy ×8, positioning ×5, guidelines ×8), the case study
is identity-led (brand identity ×6). Density is natural, not stuffed.

### Note on H1s (deliberate, not a defect)
The visible H1s are brand voice — "Camouflage is for prey.", "Senior hands
only.", "One direction. Four moves." — **not** keyword strings. That's a
legitimate design choice: the keyword weight is carried by the title, meta,
body, and schema instead. It costs a little H1 keyword signal in exchange for
brand distinctiveness. Left as-is (changing it would downgrade the craft). See
the "safe lift" note in Part 7.

---

## Part 2 — Keyword map (primary / secondary / intent) per page

| Page | Primary keyword | Secondary keywords | Search intent |
|------|-----------------|--------------------|---------------|
| `/` | brand strategy and identity studio · **brand strategy agency** | brand naming, brand positioning, brand identity design, rebranding, brand guidelines | Commercial (+ navigational for "oovert") |
| `/work/` | brand identity & naming portfolio | brand strategy work, branding case studies | Commercial-investigation (proof) |
| `/approach/` | brand strategy process / branding approach | positioning, brand rollout, brand guidelines | Informational→commercial |
| `/studio/` | distributed / boutique brand identity studio | senior brand designers, about OOVERT | Navigational / about |
| `/work/nowa-brand-identity/` | NOWA brand identity case study | brand identity design, [sector] rebrand | Long-tail commercial-investigation |

---

## Part 3 — Intent distribution

- **Commercial / transactional:** well covered on `/` and `/work/` (the money
  pages). Service terms are present as *concepts* but not as *dedicated ranking
  targets* (see gaps).
- **Navigational** ("oovert"): fully covered — once indexed you own it.
- **Informational** (top-funnel): **near-zero coverage.** No content answering
  "how much does branding cost", "brand strategy vs identity", "how to name a
  company", "when to rebrand". This is the single biggest gap and the biggest
  AI-search (GEO) opportunity.
- **Local:** intentionally minimal — OOVERT is a *distributed* studio (areaServed
  Worldwide, no storefront). Geo/city keywords are **not** a fit and shouldn't be
  forced. The only viable "local-ish" angle is "remote / distributed branding
  studio" (a handful of searches, low priority).

---

## Part 4 — Keyword cannibalization

**Verdict: clean. No harmful cannibalization.** Each page targets a distinct
intent, so pages don't compete for the same query:
- `/` (brand/commercial) vs `/work/` (portfolio) vs `/approach/` (process) vs
  `/studio/` (about) — different jobs, different SERPs.
- Minor overlap: "brand identity studio" appears in both `/` and `/studio/`
  titles. This is **not** a problem — Google will pick `/` for the generic term
  and `/studio/` for about-intent. **Monitor** in Search Console; only act if
  `/studio/` starts outranking `/` for commercial queries (it won't).

The recent title rewrite (Work/Approach/Studio) *improved* separation by giving
each page a unique descriptive title instead of the old "`X — OOVERT`" pattern.

---

## Part 5 — Gap analysis (the opportunities)

### Missing commercial keywords (no page owns them)
- **rebranding agency / rebranding services** — only a passing mention; no page
  targets it. High intent, strong fit.
- **brand naming agency / company naming service** — present in the `/work/`
  title and body, but no dedicated page. Naming is a distinct, high-intent
  vertical (River & Wolf, Catchword, Lexicon all rank standalone).
- **brand strategy agency (for startups / B2B / SaaS)** — the homepage targets
  the generic term; no audience-specific pages.
- **branding for startups** — OOVERT's pricing + speed make this its natural
  sweet spot, and it's entirely untargeted.
- **design subscription / branding retainer / brand identity on subscription** —
  OOVERT *offers* this (monthly plans) but no page targets the searchable term.

### Missing informational keywords (no content)
- **how much does branding cost / branding package price / brand identity
  pricing** — a large, high-intent cluster where OOVERT has a *category-defining
  differentiator* ($280 start vs. ~$7,500 US average). Nobody in the premium
  space answers this honestly; OOVERT can own it.
- **brand strategy vs brand identity**, **what is brand positioning**, **how to
  name a company**, **when should you rebrand / rebranding checklist**,
  **brand guidelines examples**.

### Long-tail opportunities
- "affordable brand identity package", "fixed-price branding", "senior/boutique
  branding studio", "strategy-first branding agency", "distributed branding
  studio", "brand naming and identity package", "[industry] brand identity" (per
  case study), "brand identity for [SaaS/CPG/DTC]".

### Local keywords
- Not applicable by design (distributed, worldwide). Do **not** create fake city
  pages — that would hurt E-E-A-T. The `addressCountry: US` + `areaServed:
  Worldwide` signals already in schema are the correct treatment.

---

## Part 6 — Competitor & industry landscape

- **How the field is segmented (and ranks):** naming (River & Wolf, Catchword,
  Lexicon, Landor), rebranding (dedicated "rebranding agency" pages), brand
  strategy (Bolder, MTHD — strategy-first, like OOVERT), enterprise identity
  (Pentagram, Wolff Olins, frog). **Each primary service is its own optimized
  landing page** — the consistent industry SEO pattern
  ([INSIDEA](https://insidea.com/blog/marketing/branding-agency/seo-strategy-for-branding-agency/)).
- **Positioning parallels:** Bolder and MTHD win "strategy-led branding" — OOVERT
  can compete on the same term with a sharper, cheaper offer.
- **The pricing wedge:** the cost cluster is huge and mostly answered by
  freelancers/templated shops
  ([Tenet](https://www.wearetenet.com/blog/branding-cost),
  [Embark](https://embarkwork.com/how-much-does-branding-cost/)). A premium
  *studio* that publishes transparent, low pricing is rare and highly linkable.
- **"Studio" vs "agency":** OOVERT deliberately says *studio*. "Branding agency"
  has more search volume, but chasing it would dilute positioning. **Keep
  "studio"; capture "agency" volume through body copy and a service page's
  H2/FAQ, not by renaming the brand.**

---

## Part 7 — The five answers

### 1. What's already good
- Every page has an optimized, now-unique, keyword-bearing title + meta.
- Comprehensive schema: Organization/ProfessionalService, 4 Services, FAQPage,
  CollectionPage, CreativeWork, BreadcrumbList — better than most competitors.
- Clean intent separation → **no cannibalization**.
- Natural keyword density; strategy-first language matches the money terms.
- Technical + GEO foundation (robots, sitemap, llms.txt, IndexNow, GSC/Bing) done.

### 2. What's missing
- **Informational content** (the cost cluster + "vs/how/when" queries) — the
  biggest gap, and the biggest AI-Overview/ChatGPT citation opportunity.
- **Service landing pages** for rebranding, naming, brand strategy, brand
  identity — the industry-standard structure OOVERT doesn't yet have.
- **Audience/offer pages**: branding for startups; design subscription/retainer.
- **Portfolio depth**: only one case study limits long-tail + proof.

### 3. Why it matters
- ~50%+ of the relevant demand is informational/comparison queries that happen
  *before* someone searches "branding studio". With no top-funnel content,
  OOVERT is invisible for that entire journey — and invisible to AI answer
  engines, which cite content-rich, well-structured pages.
- Google (and AI Mode) reward a page **built for the exact query**. A generic
  homepage rarely outranks a dedicated "rebranding services" or "how much does
  branding cost" page.
- The pricing transparency is a genuine, ownable wedge that competitors can't
  easily copy — currently buried on the homepage instead of ranking.

### 4. Highest-impact improvements (priority order)
1. **"What branding costs" page** — own the cost cluster with the $280-vs-$7,500
   story. Informational + commercial + linkable. _Highest ROI._
2. **Four service pages** — `/services/brand-strategy`, `/brand-naming`,
   `/rebranding`, `/brand-identity` — each targeting its head term with real
   substance + FAQ schema.
3. **"Branding for startups"** page (their sweet spot) + a **design
   subscription/retainer** page (an offer they already have, untargeted).
4. **A short journal / guides** set: "brand strategy vs identity", "how to name a
   company", "when to rebrand" — top-funnel + GEO citability, internally linked
   to the service pages.
5. **More case studies** — depth for proof and long-tail.

### 5. What was implemented in this pass
See Part 8 / the commit. Implemented **only** safe, additive, no-downgrade
changes; everything larger is recommended above (fabricating thin service/blog
pages now would violate "don't downgrade quality" and risk E-E-A-T — those
should be built with real substance and the studio's voice, which we can do
next on your go-ahead).

---

## Part 8 — Implemented now (safe, additive)

- **Schema completeness:** added a `WebPage` node to `/approach/`, an `AboutPage`
  node to `/studio/` (both previously carried only a BreadcrumbList), and a
  `ContactPoint` (new-business email) to the Organization. This sharpens
  page-type and entity signals for Google/AI with zero visible or editorial
  change. Verified: crawler score unchanged at 95/100, JSON-LD valid.

Nothing was removed or downgraded. Titles, meta, body, and existing schema are
untouched except where noted.

---

## Suggested next step

Greenlight **item #1 (the cost page)** and I'll draft it in OOVERT's voice for
your review before it ships — it's the single highest-leverage page and plays
directly to your pricing advantage. In parallel, connecting a keyword-volume
source (Keyword Planner via the `seo-google` skill, or a DataForSEO key) will
put real volume/difficulty numbers behind every recommendation here.
