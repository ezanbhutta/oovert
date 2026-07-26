# OOVERT SEO program

Status of the four SEO pillars, and the plan for the one that is ongoing.
Three of the four are built and live; off-page is the standing work.

Services the site now leads with: **branding, logo design, brand guidelines**
(brand identity, naming and rebranding are detail pages beneath branding).

---

## 1. Keyword research: done

Real volumes pulled from DataForSEO (US, Google), mapped to a page each. We
target the commercial mid-tail (buyers), not the informational head terms
(*logo* 368k, *brand identity* 301k, *branding* 27k) which are owned by
Canva / Wikipedia / Fiverr and mostly are not clients.

| Page | Primary targets (monthly volume) |
|------|----------------------------------|
| `/branding/` | branding agency (9.9k), branding services (1.9k) |
| `/logo-design/` | logo design agency (720), logo designer (12.1k), custom logo design (2.9k) |
| `/brand-guidelines/` | brand guidelines (8.1k), brand style guide (2.4k) |
| `/brand-identity/` | brand identity design (18.1k), brand identity agency (320) |
| `/brand-naming/` | brand naming agency (590) |
| `/rebranding/` | rebranding agency (390) |

Refresh the pull any time with `node tools/keyword-volume.mjs keywords.txt`
(needs `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD`). Data cached in
`tools/keyword-volume.json`; full history in `docs/KEYWORD-AUDIT.md`.

---

## 2. On-page SEO: done

Every page has been audited and corrected:

- **Titles:** unique, keyword-first, 46 to 60 chars, `·` separator.
- **Meta descriptions:** unique, 145 to 157 chars, benefit + price signal.
- **Headings:** exactly one H1 per page; correct H2 to H6 order.
- **Content:** each service page has a lede, a "what it covers" list, a
  strategy statement, proof, a 5-question FAQ, and a close. FAQ questions match
  real search queries ("what does a branding agency do", "how much does logo
  design cost").
- **Images:** descriptive alt text on every content image; decorative icons
  correctly empty-alt with `aria-label` on the link.
- **Internal links:** topic cluster. `/branding/` is the hub linking to logo,
  guidelines, identity, naming and rebranding; each links back. Homepage
  manifesto links its keywords to the three services.
- **Copy standard:** passes `.claude/skills/human`: no em-dashes, no
  AI-vocabulary, sentence-case headings, British spelling. Verified 0 em-dashes
  site-wide.

---

## 3. Technical SEO: done

- **Core Web Vitals (mobile, 4x CPU throttle):** LCP ~284ms home / ~292ms case
  study, CLS ~0, TTFB ~70ms. All "good".
- **Speed:** CSS/JS minified at build (esbuild), ~48% smaller over brotli; the
  case-study hero video re-encoded 3.13MB to 0.35MB with no visible change.
- **Mobile:** responsive, no horizontal overflow, text LCP (no hero image to
  block).
- **Crawl/index:** XML sitemap (12 URLs, auto-includes new pages), robots.txt
  allows all crawlers + the AI answer engines, blocks only `/admin/`.
- **Canonicalisation:** self-referencing canonicals everywhere; `http`→`https`,
  `www`→apex, and no-slash→slash all 301. TLS A-grade on both hosts.
- **Structured data:** one JSON-LD `@graph` per page: WebSite, Organization
  (ProfessionalService), WebPage, Service, FAQPage, BreadcrumbList.
- **Instant recrawl:** IndexNow pings Bing/Yandex on every deploy.

---

## 4. Off-page SEO (building trust): ongoing, needs the owner

This is the pillar that cannot be done from the codebase: it is accounts,
profiles, reviews and outreach. On-site enablers are in place (Organization
schema with `sameAs`, llms.txt, GSC + Bing verified). The work below is yours
to execute; it is the biggest lever left for ranking.

### Priority 1: Agency directories & reviews (highest ROI for a studio)
- **Clutch.co**: the B2B services review site buyers actually check. Claim the
  profile, then ask 3 to 5 past clients for a review. This alone moves trust.
- **DesignRush**, **The Manifest**, **Sortlist**, **UpCity**: agency
  directories; free listings, real referral traffic and a backlink each.
- **Google Business Profile** + **Bing Places**: set up as a service-area
  business (no storefront needed). Enables map/knowledge-panel presence and
  Google reviews.

### Priority 2: Portfolio platforms (links + discovery)
- **Behance** and **Dribbble**: post the NOWA identity and every project.
  High-authority backlinks and where clients browse for designers.
- **Awwwards / CSS Design Awards / Land-book**: submit the site itself; it is
  award-quality. A feature is a strong backlink and a credibility badge.
- Add each new profile URL to Organization `sameAs` in `src/_data/site.json`
  (`schema.sameAs`) so Google connects them to the brand entity.

### Priority 3: Reviews on-site (unlocks Review schema)
- Once you have real client testimonials, add them to a page. Then we can add
  `Review` / `AggregateRating` structured data (star ratings in search).
  We deliberately did NOT add review markup without real reviews. That is a
  Google guidelines violation.

### Priority 4: Digital PR & links
- **HARO / Qwoted / Featured**: answer journalist queries as a branding
  expert; earns links from real publications.
- **Guest posts** on design/marketing blogs; a byline links back.
- **LinkedIn**: post the work and the pricing-transparency angle; the
  "what branding costs" page is genuinely link-worthy.

### Consistency
- Keep name, email (`new@oovert.com`) and description identical across every
  profile (NAP consistency).

---

## Suggested order

1. This week: Clutch + Google Business Profile + Bing Places; ask 3 clients for
   reviews.
2. This month: Behance + Dribbble + DesignRush + The Manifest; submit the site
   to Awwwards/Land-book; add every profile URL to `sameAs`.
3. Ongoing: one guest post or HARO win a month; post work weekly on
   LinkedIn/Instagram.
4. When reviews exist: add testimonials on-site and we wire up Review schema.

Everything in pillars 1 to 3 is live and verified. Pillar 4 is where the next
gains come from, and it is off the codebase.
