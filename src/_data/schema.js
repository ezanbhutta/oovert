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
    crumbs([{ name: 'Home', path: '/' }, { name: 'Approach', path: '/approach/' }]),
  ]),
  studio: graph([
    crumbs([{ name: 'Home', path: '/' }, { name: 'Studio', path: '/studio/' }]),
  ]),
};
