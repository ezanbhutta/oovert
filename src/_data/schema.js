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

const BASE = 'https://oovert.com';
const ORG_ID = `${BASE}/#organization`;
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
  isPartOf: { '@id': ORG_ID },
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
  isPartOf: { '@id': ORG_ID },
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
  isPartOf: { '@id': ORG_ID },
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
  isPartOf: { '@id': ORG_ID },
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
  home: graph([organization, ...services, faqPage]),
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
};
