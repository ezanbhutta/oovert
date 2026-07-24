/**
 * report.js — render crawl results to the console, a JSON envelope, and a
 * standalone HTML report.
 *
 * The JSON envelope matches the claude-seo `audit-data.json` shape so the
 * output is compatible with that ecosystem's report tooling.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { bySeverity, WEIGHTS } = require('./score');

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = (s) => c('1', s);
const dim = (s) => c('2', s);
const SEV_COLOR = { Critical: '31', High: '33', Medium: '36', Low: '2', Info: '2' };
const sevTag = (s) => c(SEV_COLOR[s] || '0', s.toUpperCase());

function bar(score, width = 20) {
  const filled = Math.round((score / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

/* ----------------------------- console ---------------------------------- */

function printConsole(result) {
  const { overall, grade, categories, pages, siteFindings, meta } = result;
  const line = '─'.repeat(64);
  console.log('');
  console.log(bold('  OOVERT — SEO Crawl Report'));
  console.log(dim(`  ${meta.target} · ${pages.length} pages · ${meta.timestamp}`));
  console.log('  ' + line);

  // Health score
  console.log('');
  console.log(`  ${bold('SEO Health Score')}   ${bold(String(overall) + '/100')}   ${grade}`);
  console.log('');
  for (const [cat, w] of Object.entries(WEIGHTS)) {
    const s = categories[cat].score;
    const col = s >= 90 ? '32' : s >= 70 ? '36' : s >= 50 ? '33' : '31';
    console.log(`  ${cat.padEnd(13)} ${c(col, bar(s))} ${String(s).padStart(3)}/100  ${dim('w=' + w)}`);
  }

  // Per-page summary
  console.log('');
  console.log('  ' + line);
  console.log(bold('  Pages'));
  for (const p of pages) {
    const crit = p.findings.filter((f) => f.severity === 'Critical').length;
    const high = p.findings.filter((f) => f.severity === 'High').length;
    const med = p.findings.filter((f) => f.severity === 'Medium').length;
    const tag = crit ? c('31', '✗') : high ? c('33', '!') : med ? c('36', '·') : c('32', '✓');
    console.log(`  ${tag} ${p.url.padEnd(30)} ${dim(`${p.status} · ${p.wordCount}w · ${p.findings.length} findings`)}`);
  }

  // All findings, most severe first
  const all = [...siteFindings, ...pages.flatMap((p) => p.findings)].sort(bySeverity);
  console.log('');
  console.log('  ' + line);
  console.log(bold(`  Findings (${all.length})`));
  const shown = all.filter((f) => f.severity !== 'Info');
  if (!shown.length) {
    console.log('  ' + c('32', 'No issues found. ✓'));
  }
  for (const f of shown) {
    console.log('');
    console.log(`  ${sevTag(f.severity)}  ${bold(f.title)}  ${dim('[' + f.category + '] ' + f.url)}`);
    if (f.detail) console.log(`     ${dim(f.detail)}`);
    if (f.recommendation) console.log(`     → ${f.recommendation}`);
  }

  // AI crawler status
  if (result.aiCrawlerStatus) {
    console.log('');
    console.log('  ' + line);
    console.log(bold('  AI crawler access (robots.txt)'));
    for (const { bot, blocked } of result.aiCrawlerStatus) {
      console.log(`  ${blocked ? c('31', 'BLOCK') : c('32', 'ALLOW')}  ${bot}`);
    }
  }
  console.log('');
}

/* ------------------------------- JSON ----------------------------------- */

function toEnvelope(result) {
  const { overall, categories, pages, siteFindings } = result;
  const all = [...siteFindings, ...pages.flatMap((p) => p.findings)];
  const top = all.filter((f) => f.severity === 'Critical' || f.severity === 'High')
    .sort(bySeverity).slice(0, 5).map((f) => f.title);
  const quickWins = all.filter((f) => f.severity === 'Low' || f.severity === 'Medium')
    .slice(0, 5).map((f) => f.title);

  const cats = Object.entries(categories).map(([name, c]) => ({
    name,
    score: c.score,
    what_works: c.score >= 90 ? [`${name} checks pass`] : [],
    findings: c.findings.map((f) => ({
      title: f.title, severity: f.severity, url: f.url,
      description: f.detail, recommendation: f.recommendation,
    })),
  }));

  const phase = (sev) => all.filter((f) => sev.includes(f.severity)).map((f) => `${f.title} (${f.url})`);
  return {
    summary: {
      health_score: overall,
      business_type: 'Agency / studio (brand strategy & identity)',
      top_findings: top,
      quick_wins: quickWins,
    },
    categories: cats,
    action_plan: {
      phases: [
        { name: 'Phase 1: Critical Fixes', timeframe: 'Now', items: phase(['Critical']) },
        { name: 'Phase 2: High-Impact', timeframe: 'Week 1', items: phase(['High']) },
        { name: 'Phase 3: Optimization', timeframe: 'Month 1', items: phase(['Medium']) },
        { name: 'Phase 4: Polish & Monitor', timeframe: 'Ongoing', items: phase(['Low']) },
      ],
    },
    artifacts: { report_html: 'index.html', report_json: 'report.json' },
  };
}

function writeJson(result, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'audit-data.json'), JSON.stringify(toEnvelope(result), null, 2));
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify({
    meta: result.meta,
    overall: result.overall,
    grade: result.grade,
    categories: Object.fromEntries(Object.entries(result.categories).map(([k, v]) => [k, v.score])),
    aiCrawlerStatus: result.aiCrawlerStatus,
    siteFindings: result.siteFindings,
    pages: result.pages.map((p) => ({
      url: p.url, status: p.status, title: p.title, description: p.description,
      wordCount: p.wordCount, canonical: p.canonical, jsonldTypes: p.jsonldTypes,
      findings: p.findings,
    })),
  }, null, 2));
}

/* ------------------------------- HTML ----------------------------------- */

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function writeHtml(result, outDir) {
  const { overall, grade, categories, pages, siteFindings, meta } = result;
  const all = [...siteFindings, ...pages.flatMap((p) => p.findings)].sort(bySeverity);
  const sevClass = (s) => 'sev-' + s.toLowerCase();

  const catRows = Object.entries(WEIGHTS).map(([cat, w]) => {
    const s = categories[cat].score;
    return `<tr><td>${esc(cat)}</td><td class="num">${s}</td>
      <td class="barcell"><span class="minibar" style="--v:${s}%"></span></td>
      <td class="num dim">${w}</td></tr>`;
  }).join('');

  const findingRows = all.filter((f) => f.severity !== 'Info').map((f) => `
    <tr class="${sevClass(f.severity)}">
      <td><span class="pill ${sevClass(f.severity)}">${esc(f.severity)}</span></td>
      <td>${esc(f.category)}</td>
      <td><strong>${esc(f.title)}</strong>${f.detail ? `<div class="dim small">${esc(f.detail)}</div>` : ''}
          ${f.recommendation ? `<div class="rec small">→ ${esc(f.recommendation)}</div>` : ''}</td>
      <td class="mono small">${esc(f.url)}</td>
    </tr>`).join('');

  const pageRows = pages.map((p) => {
    const counts = ['Critical', 'High', 'Medium', 'Low'].map((sv) => p.findings.filter((f) => f.severity === sv).length);
    return `<tr>
      <td class="mono">${esc(p.url)}</td><td class="num">${p.status}</td>
      <td class="num">${p.wordCount}</td>
      <td>${esc(p.title || '—')}</td>
      <td class="num">${counts[0] ? `<span class="pill sev-critical">${counts[0]}</span>` : ''}
        ${counts[1] ? `<span class="pill sev-high">${counts[1]}</span>` : ''}
        ${counts[2] ? `<span class="pill sev-medium">${counts[2]}</span>` : ''}
        ${counts[3] ? `<span class="pill sev-low">${counts[3]}</span>` : ''}</td>
    </tr>`;
  }).join('');

  const aiRows = (result.aiCrawlerStatus || []).map(({ bot, blocked }) =>
    `<tr><td class="mono">${esc(bot)}</td><td>${blocked ? '<span class="pill sev-high">BLOCKED</span>' : '<span class="pill ok">ALLOWED</span>'}</td></tr>`).join('');

  const html = `<!doctype html>
<html lang="en" data-theme="auto"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>OOVERT — SEO Crawl Report</title>
<style>
  :root{--bg:#f7f6f2;--fg:#16140f;--muted:#6b675e;--card:#fff;--line:#e5e1d8;--ok:#2d6a4f;--crit:#c53030;--high:#c2621b;--med:#1f6f8b;--low:#8a8579;--accent:#16140f}
  @media (prefers-color-scheme:dark){:root{--bg:#14130f;--fg:#f3f0e9;--muted:#a29d92;--card:#1e1c17;--line:#2c2a23;--accent:#f3f0e9}}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  .wrap{max-width:1000px;margin:0 auto;padding:40px 24px 80px}
  h1{font-size:26px;margin:0 0 4px}h2{font-size:16px;text-transform:uppercase;letter-spacing:.08em;margin:40px 0 12px;color:var(--muted)}
  .sub{color:var(--muted);margin:0 0 28px}
  .hero{display:flex;align-items:center;gap:28px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:24px 28px}
  .score{font-size:56px;font-weight:800;line-height:1}
  .score small{font-size:20px;color:var(--muted);font-weight:600}
  .grade{font-size:18px;font-weight:700}
  table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
  th,td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--line);vertical-align:top}
  th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
  tr:last-child td{border-bottom:none}.num{text-align:right;font-variant-numeric:tabular-nums}
  .dim{color:var(--muted)}.small{font-size:12.5px}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px}
  .rec{color:var(--ok)}
  .barcell{width:180px}.minibar{display:block;height:8px;border-radius:5px;background:linear-gradient(90deg,var(--accent),var(--accent));width:var(--v);min-width:2px;opacity:.8}
  .pill{display:inline-block;padding:1px 8px;border-radius:20px;font-size:11px;font-weight:700;color:#fff;margin-right:4px}
  .pill.sev-critical{background:var(--crit)}.pill.sev-high{background:var(--high)}.pill.sev-medium{background:var(--med)}.pill.sev-low{background:var(--low)}.pill.ok{background:var(--ok)}
  .note{color:var(--muted);font-size:12.5px;margin-top:10px}
</style></head><body><div class="wrap">
  <h1>OOVERT — SEO Crawl Report</h1>
  <p class="sub">${esc(meta.target)} · ${pages.length} pages crawled · ${esc(meta.timestamp)}</p>
  <div class="hero">
    <div class="score">${overall}<small>/100</small></div>
    <div><div class="grade">${esc(grade)}</div><div class="dim small">Weighted across ${Object.keys(WEIGHTS).length} categories (claude-seo model)</div></div>
  </div>

  <h2>Category scores</h2>
  <table><thead><tr><th>Category</th><th class="num">Score</th><th></th><th class="num">Weight</th></tr></thead><tbody>${catRows}</tbody></table>
  <p class="note">Content &amp; Performance are partly heuristic (static HTML signals); real Core Web Vitals and readability need field data (PageSpeed/CrUX).</p>

  <h2>Pages</h2>
  <table><thead><tr><th>URL</th><th class="num">HTTP</th><th class="num">Words</th><th>Title</th><th>Issues</th></tr></thead><tbody>${pageRows}</tbody></table>

  <h2>Findings (${all.filter((f) => f.severity !== 'Info').length})</h2>
  <table><thead><tr><th>Severity</th><th>Category</th><th>Finding</th><th>URL</th></tr></thead><tbody>${findingRows || '<tr><td colspan="4">No issues found.</td></tr>'}</tbody></table>

  ${aiRows ? `<h2>AI crawler access</h2><table><thead><tr><th>Crawler</th><th>Status</th></tr></thead><tbody>${aiRows}</tbody></table>` : ''}
</div></body></html>`;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
}

module.exports = { printConsole, writeJson, writeHtml, toEnvelope };
