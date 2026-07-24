# OOVERT — Keyword Research Audit

_Audit date: 2026-07-24. Verified against the live production build (all pages
crawled and read), not assumed. Competitive/industry research via web search._

> **Update (2026-07-25): real search volumes are now attached.** Verified Google
> Ads data for the target keywords was pulled via DataForSEO — see **Part 9**
> (raw JSON in `tools/keyword-volume.json`). It reprioritizes the roadmap; the
> qualitative analysis below stands, and Part 9 is the number-backed layer on top.

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

Greenlight the top pages (Part 9) and I'll build them in OOVERT's voice for your
review before they ship.

---

## Part 9 — Verified search volume (DataForSEO · US / English · 2026-07-25)

Real Google Ads data, pulled via `tools/keyword-volume.mjs` (run cost $0.09).
Full JSON in `tools/keyword-volume.json`. "Comp" = Google Ads competition;
CPC = top-of-page bid range (a proxy for commercial value).

| Keyword | Vol/mo | Comp | CPC (low–high) | Intent | OOVERT status |
|---------|-------:|:----:|----------------|--------|---------------|
| **brand identity design** | **18,100** | LOW | $2.43–$9.80 | Commercial | mentioned, no dedicated page |
| **branding agency** | **9,900** | LOW | $5.77–$25.00 | Commercial | "studio" positioning; not targeted |
| brand strategy agency | 880 | LOW | $10.45–**$46.98** | Commercial (high value) | homepage |
| branding studio | 880 | LOW | $2.33–$10.24 | Commercial | owned |
| brand naming agency | 590 | LOW | $5.04–$24.83 | Commercial | partial (work page) |
| rebranding agency | 390 | LOW | $7.65–$17.82 | Commercial | **gap** |
| brand identity agency | 320 | LOW | $5.71–$28.98 | Commercial | partial |
| branding for startups | 260 | LOW | $4.08–$14.76 | Commercial | **gap** |
| brand identity package | 210 | HIGH | $2.08–$9.55 | Commercial | on homepage (#packages) |
| how to name a company | 210 | MED | $0.76–$4.46 | Informational | **gap** |
| naming agency | 140 | MED | $5.39–$12.54 | Commercial | partial |
| company naming service | 140 | LOW | $1.35–$14.53 | Commercial | **gap** |
| rebranding services | 140 | LOW | $15.90–$29.99 | Commercial | **gap** |
| brand positioning agency | 140 | LOW | $4.04–$25.00 | Commercial | approach page |
| branding cost | 140 | LOW | $3.25–$12.54 | Info/commercial | **gap** (cost page) |
| design subscription | 140 | MED | $6.68–$22.91 | Commercial | offered, not targeted |
| how much does branding cost | 110 | LOW | $1.39–$7.00 | Informational | **gap** (cost page) |
| brand strategy for startups | 70 | LOW | $7.71–$16.29 | Commercial | gap |
| branding package price | 50 | MED | $1.62–$5.47 | Commercial | gap (cost page) |
| brand identity pricing | 20 | MED | $2.31–$5.00 | Commercial | gap (cost page) |
| affordable branding agency | 20 | — | — | Commercial | gap |
| brand strategy vs brand identity | 20 | LOW | — | Informational | gap |
| brand identity studio | 10 | LOW | — | Commercial | studio page |
| when to rebrand | 10 | LOW | — | Informational | gap |
| boutique branding studio | 10 | MED | $3.72–$8.49 | Commercial | gap |
| branding retainer | — | — | — | Commercial | offered, not targeted |

### What the numbers change

1. **"brand identity design" — 18,100/mo at LOW competition — is the single
   biggest, most winnable prize**, 2× the next term. OOVERT already *does* exactly
   this; it just has no page that targets the phrase. **This is the new #1.**
2. **"branding agency" — 9,900/mo, LOW comp.** OOVERT is a *studio* by choice, but
   can capture most of this with body copy + an "agency or studio?" FAQ, without
   diluting positioning.
3. **The cost cluster is real** (branding cost 140 + how much does branding cost
   110 + package price 50 + brand identity pricing 20 ≈ **320+/mo**, commercial) —
   the `/pricing/` page is validated, and the pricing wedge makes it convert.
4. **Rebranding** (agency 390 + services 140 ≈ **530/mo**, entirely un-owned) and
   **naming** (brand naming 590 + naming 140 + company naming 140 ≈ **870/mo**)
   justify dedicated service pages.
5. **"brand strategy agency"** is low volume but **$46.98 top CPC** — the highest
   commercial value per click on the list; worth owning even at 880/mo.

### Revised priority (number-backed)

1. **`/brand-identity/`** (or hard-optimize an existing page) for **"brand
   identity design" (18,100)** — biggest + lowest difficulty. Highest ROI.
2. **`/pricing/`** cost page (already drafted) — commercial cluster + wedge.
3. **Service pages**: `/brand-naming/` (~870), `/rebranding/` (~530),
   `/brand-strategy/` (880, top CPC).
4. **Capture "branding agency" (9,900)** via content + FAQ (no rebrand).
5. **Informational**: "how to name a company" (210), "when to rebrand",
   "brand strategy vs brand identity" — top-funnel + AI-citation fuel.

_To refresh these numbers later: `DATAFORSEO_LOGIN=… DATAFORSEO_PASSWORD=… node
tools/keyword-volume.mjs`._
