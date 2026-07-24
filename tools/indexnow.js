#!/usr/bin/env node
/**
 * indexnow.js — notify IndexNow (Bing, Yandex, Seznam, …) of the site's current
 * URLs after a deploy, so those engines re-crawl changed pages within minutes
 * instead of waiting for their own schedule.
 *
 * The key is intentionally public — it's hosted at https://oovert.com/<key>.txt
 * and only proves ownership of the submitting site. Nothing secret here.
 *
 * Reads the built _site/sitemap.xml for the URL list and POSTs it once. Run
 * after the build/upload step in CI. Never fails the deploy: any error exits 0.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const KEY = 'e178b320e5649f51b94360e0b62f290c';
const HOST = 'oovert.com';
const SITEMAP = path.resolve(__dirname, '..', '_site', 'sitemap.xml');
const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function main() {
  let xml;
  try {
    xml = fs.readFileSync(SITEMAP, 'utf8');
  } catch {
    console.log(`IndexNow: ${SITEMAP} not found — run after \`npm run build\`. Skipping.`);
    return;
  }
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
  if (!urls.length) { console.log('IndexNow: no <loc> URLs in sitemap. Skipping.'); return; }

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    // 200 = accepted, 202 = accepted/queued. Both are success.
    console.log(`IndexNow: submitted ${urls.length} URL(s) → HTTP ${res.status}`);
  } catch (err) {
    console.log(`IndexNow: submit failed (non-fatal) — ${(err && err.message) || err}`);
  }
}

main();
