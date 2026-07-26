/**
 * Single source of truth for every JSON-LD block on the site.
 *
 * Built once, from real content already in the data files — never hand-copied
 * per page. Each template pulls its graph via the shared `schema.njk` include
 * (`{% set schemaKey = "…" %}{% include "schema.njk" %}`). Every page emits one
 * <script type="application/ld+json"> containing a schema.org @graph.
 *
 * Facts confirmed by the studio: foundingDate 2020; addressCountry US only;
 * no Person nodes; no prices; the case study CreativeWork omits the client.
 */
const site = require('./site.json');
const project = require('./projects/case-study.json');
const pricing = require('./pricing.json');
const brandIdentity = require('./brandIdentity.json');
const journal = require('./journal.json');
const logoDesign = require('./logoDesign.json');
const brandGuidelines = require('./brandGuidelines.json');
const branding = require('./branding.json');

const BASE = 'https://oovert.com';
const ORG_ID = `${BASE}/#organization`;
const WEBSITE_ID = `${BASE}/#website`;
const s = site.schema;

const slugify = (str) =>
  String(str).trim().toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
const caseSlug = slugify(project.slug || project.name);
const CASE_URL = `${BASE}/work/${caseSlug}/`;
const WORK_URL = `${BASE}/work/`;

/* ---- Organization (site-wide, anchored on /) --------------------------------
 * No Person nodes, no prices. addressCountry US only. */
const organization = {
  '@type': 'Organization',
  '@id': ORG_ID,
  additionalType: 'https://schema.org/ProfessionalService',
  name: s.name,
  legalName: s.legalName,
  url: s.url,
  email: s.email,
  foundingDate: s.foundingDate,
  slogan: s.slogan,
  description: s.description,
  logo: s.logo,
  image: s.image,
  address: { '@type': 'PostalAddress', addressCountry: 'US' },
  areaServed: s.areaServed,
  knowsAbout: s.knowsAbout,
  sameAs: s.sameAs,
  contactPoint: {
    '@type': 'ContactPoint',
    email: s.email,
    contactType: 'new business',
    areaServed: s.areaServed,
    availableLanguage: 'en',
  },
};

/* ---- WebSite (site-wide entity; anchors the site name in search) -----------
 * No potentialAction/SearchAction: the site has no internal search endpoint, so
 * a sitelinks-searchbox action would be invalid. name + publisher only. */
const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${BASE}/`,
  name: s.name,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en',
};

/* ---- Home WebPage (page-type parity with the sub-pages) -------------------- */
const homePage = {
  '@type': 'WebPage',
  '@id': `${BASE}/#webpage`,
  url: `${BASE}/`,
  name: site.meta.pageTitle,
  description: site.meta.description,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORG_ID },
  primaryImageOfPage: site.meta.og.image,
  inLanguage: 'en',
};

/* ---- Services (name + description only — no Offer, no price) ---------------- */
const services = site.practice.items.map((it) => ({
  '@type': 'Service',
  name: it.name,
  description: it.desc,
  serviceType: it.name,
  provider: { '@id': ORG_ID },
  areaServed: s.areaServed,
}));

/* ---- FAQ (the existing questions, verbatim) -------------------------------- */
const faqPage = {
  '@type': 'FAQPage',
  '@id': `${BASE}/#faq`,
  mainEntity: site.faq.items.map((q) => ({
    '@type': 'Question',
    name: q.q,
    acceptedAnswer: { '@type': 'Answer', text: q.a },
  })),
};

/* ---- Case study CreativeWork (client omitted per instruction) -------------- */
const creativeWork = {
  '@type': 'CreativeWork',
  '@id': `${CASE_URL}#work`,
  name: `${project.name} — ${project.scope}`,
  headline: project.intro && project.intro.headline,
  about: project.sector,
  keywords: [project.scope, project.sector].filter(Boolean).join(', '),
  creator: { '@id': ORG_ID },
  datePublished: String(project.year),
  inLanguage: 'en',
  url: CASE_URL,
};

/* ---- Work index CollectionPage --------------------------------------------- */
const collectionPage = {
  '@type': 'CollectionPage',
  '@id': `${WORK_URL}#collection`,
  name: 'Work — OOVERT',
  description: 'Selected brand strategy, naming and identity work by OOVERT.',
  url: WORK_URL,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORG_ID },
  hasPart: [{ '@id': `${CASE_URL}#work` }],
};

/* ---- Page-type nodes for the process / about pages ------------------------
 * These pages previously carried only a BreadcrumbList; a WebPage / AboutPage
 * node sharpens page-type + entity signals (additive, no visible change). */
const approachPage = {
  '@type': 'WebPage',
  '@id': `${BASE}/approach/#webpage`,
  name: 'Our Approach to Brand Strategy & Identity — OOVERT',
  description:
    'How OOVERT works: a brand built in four moves — Strategy, Positioning, Identity, Rollout.',
  url: `${BASE}/approach/`,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORG_ID },
  inLanguage: 'en',
};
const studioPage = {
  '@type': 'AboutPage',
  '@id': `${BASE}/studio/#webpage`,
  name: 'A Distributed Brand Identity Studio — OOVERT',
  description:
    'OOVERT is a distributed studio of senior people across six timezones. Four disciplines, one question on every project: would we sign it?',
  url: `${BASE}/studio/`,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORG_ID },
  inLanguage: 'en',
};

/* ---- Pricing page: WebPage + FAQPage --------------------------------------
 * FAQPage from the pricing questions (text only — no Offer/price nodes, per the
 * studio's "no prices in schema" rule; the numbers live in the visible copy). */
const pricingPage = {
  '@type': 'WebPage',
  '@id': `${BASE}/pricing/#webpage`,
  name: 'How Much Does Branding Cost? — OOVERT Pricing',
  description:
    'What branding costs across the market, and OOVERT’s transparent, strategy-led pricing.',
  url: `${BASE}/pricing/`,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORG_ID },
  inLanguage: 'en',
};
const pricingFaq = {
  '@type': 'FAQPage',
  '@id': `${BASE}/pricing/#faq`,
  mainEntity: pricing.faq.map((q) => ({
    '@type': 'Question',
    name: q.q,
    acceptedAnswer: { '@type': 'Answer', text: q.a },
  })),
};

/* ---- Brand identity service page: WebPage + Service + FAQPage --------------
 * A Service node (no Offer/price) targets the "brand identity design" term; the
 * FAQPage is text-only, consistent with the rest of the site. */
const brandIdentityPage = {
  '@type': 'WebPage',
  '@id': `${BASE}/brand-identity/#webpage`,
  name: 'Brand Identity Design, Strategy-First — OOVERT',
  description:
    'Brand identity design done strategy-first — the system a company is recognised by: name, mark, type, colour, voice, motion and guidelines.',
  url: `${BASE}/brand-identity/`,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORG_ID },
  inLanguage: 'en',
};
const brandIdentityService = {
  '@type': 'Service',
  '@id': `${BASE}/brand-identity/#service`,
  name: 'Brand identity design',
  serviceType: 'Brand identity design',
  description:
    'Strategy-first brand identity design: name, logo and mark, typography, colour, voice, motion and guidelines, built into one coherent system.',
  provider: { '@id': ORG_ID },
  areaServed: s.areaServed,
};
const brandIdentityFaq = {
  '@type': 'FAQPage',
  '@id': `${BASE}/brand-identity/#faq`,
  mainEntity: brandIdentity.faq.map((q) => ({
    '@type': 'Question',
    name: q.q,
    acceptedAnswer: { '@type': 'Answer', text: q.a },
  })),
};

/* ---- Naming & rebranding service pages (WebPage + Service + FAQPage) ------- */
const faqNodes = (items) => items.map((q) => ({
  '@type': 'Question',
  name: q.q,
  acceptedAnswer: { '@type': 'Answer', text: q.a },
}));

const logoDesignPage = {
  '@type': 'WebPage',
  '@id': `${BASE}/logo-design/#webpage`,
  name: 'Logo Design Agency · Custom Logos, Strategy-First · OOVERT',
  description: 'Custom, strategy-first logo design. A mark built on a real idea and a system behind it, with every file and usage rule.',
  url: `${BASE}/logo-design/`,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORG_ID },
  inLanguage: 'en',
};
const logoDesignService = {
  '@type': 'Service',
  '@id': `${BASE}/logo-design/#service`,
  name: 'Logo design',
  serviceType: 'Logo design',
  description: 'Strategy-first custom logo design: the idea, the mark, construction, type, colour and every file and usage rule, built to hold at any size.',
  provider: { '@id': ORG_ID },
  areaServed: s.areaServed,
};
const logoDesignFaq = {
  '@type': 'FAQPage',
  '@id': `${BASE}/logo-design/#faq`,
  mainEntity: faqNodes(logoDesign.faq),
};

/* ---- Brand guidelines service page (WebPage + Service + FAQPage) ----------- */
const brandGuidelinesPage = {
  '@type': 'WebPage',
  '@id': `${BASE}/brand-guidelines/#webpage`,
  name: 'Brand Guidelines & Brand Style Guides · OOVERT',
  description: 'Brand guidelines and brand style guides your whole team can follow: logo, colour, type, voice and motion rules that keep a brand consistent everywhere.',
  url: `${BASE}/brand-guidelines/`,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORG_ID },
  inLanguage: 'en',
};
const brandGuidelinesService = {
  '@type': 'Service',
  '@id': `${BASE}/brand-guidelines/#service`,
  name: 'Brand guidelines',
  serviceType: 'Brand guidelines and style guide',
  description: 'Brand guidelines and style guides: logo usage, colour, typography, voice, imagery and motion rules that keep a brand consistent everywhere.',
  provider: { '@id': ORG_ID },
  areaServed: s.areaServed,
};
const brandGuidelinesFaq = {
  '@type': 'FAQPage',
  '@id': `${BASE}/brand-guidelines/#faq`,
  mainEntity: faqNodes(brandGuidelines.faq),
};

/* ---- Branding flagship service page (WebPage + Service + FAQPage) ---------- */
const brandingPage = {
  '@type': 'WebPage',
  '@id': `${BASE}/branding/#webpage`,
  name: 'Branding Agency · Strategy-First Brand Building · OOVERT',
  description: 'Branding agency that builds the whole brand strategy-first: strategy, name, logo, identity and the guidelines that keep it consistent.',
  url: `${BASE}/branding/`,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORG_ID },
  inLanguage: 'en',
};
const brandingService = {
  '@type': 'Service',
  '@id': `${BASE}/branding/#service`,
  name: 'Branding',
  serviceType: 'Branding',
  description: 'Full strategy-first branding: strategy, positioning, name, logo and identity, guidelines and rollout, built into one coherent brand.',
  provider: { '@id': ORG_ID },
  areaServed: s.areaServed,
};
const brandingFaq = {
  '@type': 'FAQPage',
  '@id': `${BASE}/branding/#faq`,
  mainEntity: faqNodes(branding.faq),
};


/* ---- Journal: Blog hub + per-post BlogPosting stubs ------------------------ */
const journalBlog = {
  '@type': 'Blog',
  '@id': `${BASE}/journal/#blog`,
  name: 'The OOVERT Journal',
  description: 'Brand teardowns and rebrand lessons in plain English.',
  url: `${BASE}/journal/`,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en',
  blogPost: journal.posts.map((p) => ({
    '@type': 'BlogPosting',
    '@id': `${BASE}/journal/${p.slug}/#post`,
    headline: p.title,
    url: `${BASE}/journal/${p.slug}/`,
    datePublished: p.date,
  })),
};

/* ---- BreadcrumbList builder ------------------------------------------------ */
const crumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: `${BASE}${it.path}`,
  })),
});

const graph = (nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });

module.exports = {
  home: graph([website, organization, homePage, ...services, faqPage]),
  work: graph([
    collectionPage,
    crumbs([{ name: 'Home', path: '/' }, { name: 'Work', path: '/work/' }]),
  ]),
  caseStudy: graph([
    creativeWork,
    crumbs([
      { name: 'Home', path: '/' },
      { name: 'Work', path: '/work/' },
      { name: `${project.name} — ${project.scope}`, path: `/work/${caseSlug}/` },
    ]),
  ]),
  approach: graph([
    approachPage,
    crumbs([{ name: 'Home', path: '/' }, { name: 'Approach', path: '/approach/' }]),
  ]),
  studio: graph([
    studioPage,
    crumbs([{ name: 'Home', path: '/' }, { name: 'Studio', path: '/studio/' }]),
  ]),
  pricing: graph([
    pricingPage,
    pricingFaq,
    crumbs([{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing/' }]),
  ]),
  'brand-identity': graph([
    brandIdentityPage,
    brandIdentityService,
    brandIdentityFaq,
    crumbs([{ name: 'Home', path: '/' }, { name: 'Brand identity', path: '/brand-identity/' }]),
  ]),
  journal: graph([
    journalBlog,
    crumbs([{ name: 'Home', path: '/' }, { name: 'Journal', path: '/journal/' }]),
  ]),
  'logo-design': graph([
    logoDesignPage,
    logoDesignService,
    logoDesignFaq,
    crumbs([{ name: 'Home', path: '/' }, { name: 'Logo design', path: '/logo-design/' }]),
  ]),
  'brand-guidelines': graph([
    brandGuidelinesPage,
    brandGuidelinesService,
    brandGuidelinesFaq,
    crumbs([{ name: 'Home', path: '/' }, { name: 'Brand guidelines', path: '/brand-guidelines/' }]),
  ]),
  branding: graph([
    brandingPage,
    brandingService,
    brandingFaq,
    crumbs([{ name: 'Home', path: '/' }, { name: 'Branding', path: '/branding/' }]),
  ]),
};
