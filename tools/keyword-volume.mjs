#!/usr/bin/env node
/**
 * keyword-volume.mjs — pull real Google Ads search volume / CPC / competition
 * for a keyword list, so the estimate columns in docs/KEYWORD-AUDIT.md can be
 * replaced with hard numbers.
 *
 * Provider: DataForSEO (pay-as-you-go, ~$0.05 per call of up to 1000 keywords).
 * It's the most accessible source — Google's own Keyword Planner API needs a
 * Google Ads account + an approved developer token, which is much more setup.
 *
 * Setup (one-time):
 *   1. Create an account at https://dataforseo.com and top it up a few dollars.
 *   2. Copy your API login + password from the dashboard.
 *   3. Run:
 *        DATAFORSEO_LOGIN=you@example.com \
 *        DATAFORSEO_PASSWORD=your_password \
 *        node tools/keyword-volume.mjs
 *
 * Optional args:
 *   node tools/keyword-volume.mjs keywords.txt      # one keyword per line
 *   LOCATION="United States" LANGUAGE="English" ...  # override targeting
 *
 * Output: a table to the console (sorted by volume) + tools/keyword-volume.json.
 * Nothing here is secret in the repo — credentials come only from the env.
 */

import fs from 'node:fs';

const LOGIN = process.env.DATAFORSEO_LOGIN;
const PASSWORD = process.env.DATAFORSEO_PASSWORD;
const LOCATION = process.env.LOCATION || 'United States';
const LANGUAGE = process.env.LANGUAGE || 'English';
const ENDPOINT = 'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live';

// The audit's target keywords — edit freely or pass a file as argv[2].
const DEFAULT_KEYWORDS = [
  'branding agency', 'branding studio', 'brand strategy agency', 'brand identity design',
  'brand identity agency', 'brand identity studio', 'naming agency', 'brand naming agency',
  'company naming service', 'rebranding agency', 'rebranding services', 'brand positioning agency',
  'brand strategy for startups', 'branding for startups', 'affordable branding agency',
  'brand identity package', 'how much does branding cost', 'branding cost', 'branding package price',
  'brand identity pricing', 'brand strategy vs brand identity', 'how to name a company',
  'when to rebrand', 'design subscription', 'branding retainer', 'boutique branding studio',
];

function loadKeywords() {
  const file = process.argv[2];
  if (file) {
    return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  }
  return DEFAULT_KEYWORDS;
}

function requireCreds() {
  if (LOGIN && PASSWORD) return;
  console.error(`
Missing credentials. This script needs a DataForSEO API login + password:

  DATAFORSEO_LOGIN=you@example.com DATAFORSEO_PASSWORD=your_password \\
    node tools/keyword-volume.mjs

Create an account at https://dataforseo.com (pay-as-you-go). If you'd rather use
Google's Keyword Planner instead, say so — it needs a Google Ads account and an
approved developer token, and I'll wire that path up instead.
`);
  process.exit(2);
}

async function main() {
  requireCreds();
  const keywords = loadKeywords();
  const auth = 'Basic ' + Buffer.from(`${LOGIN}:${PASSWORD}`).toString('base64');
  const body = JSON.stringify([{ keywords, location_name: LOCATION, language_name: LANGUAGE }]);

  let json;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(60000),
    });
    json = await res.json();
    if (json.status_code !== 20000) throw new Error(`${json.status_code}: ${json.status_message}`);
  } catch (err) {
    console.error(`DataForSEO request failed: ${(err && err.message) || err}`);
    process.exit(1);
  }

  const results = (json.tasks?.[0]?.result || []).filter(Boolean);
  results.sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0));

  const pad = (s, n) => String(s ?? '—').padEnd(n);
  console.log(`\nGoogle Ads keyword data — ${LOCATION} / ${LANGUAGE}\n`);
  console.log(pad('keyword', 34), pad('volume/mo', 10), pad('competition', 12), 'CPC(low–high)');
  console.log('─'.repeat(80));
  for (const r of results) {
    const cpc = r.low_top_of_page_bid != null || r.high_top_of_page_bid != null
      ? `$${(r.low_top_of_page_bid ?? 0).toFixed(2)}–$${(r.high_top_of_page_bid ?? 0).toFixed(2)}`
      : '—';
    console.log(pad(r.keyword, 34), pad(r.search_volume ?? 0, 10), pad(r.competition ?? '—', 12), cpc);
  }

  fs.writeFileSync('tools/keyword-volume.json', JSON.stringify(results, null, 2));
  console.log(`\n${results.length} keywords written to tools/keyword-volume.json\n`);
}

main();
