/**
 * score.js — turn findings into per-category and overall SEO health scores.
 *
 * Category weights match the claude-seo `seo-audit` model. Each category starts
 * at 100 and loses points per finding by severity; the overall score is the
 * weighted sum. Content and Performance are partly heuristic here (no field
 * Core Web Vitals / readability model), which the report states plainly.
 */

'use strict';

const WEIGHTS = {
  Technical: 0.22,
  Content: 0.23,
  'On-Page': 0.20,
  Schema: 0.10,
  Performance: 0.10,
  'AI Search': 0.10,
  Images: 0.05,
};

const PENALTY = { Critical: 40, High: 20, Medium: 10, Low: 4, Info: 0 };

function grade(score) {
  if (score >= 90) return 'A — Excellent';
  if (score >= 80) return 'B — Good';
  if (score >= 70) return 'C — Fair';
  if (score >= 60) return 'D — Needs work';
  return 'F — Critical';
}

/** Compute category scores (0–100) and the weighted overall health score. */
function score(allFindings) {
  const categories = {};
  for (const cat of Object.keys(WEIGHTS)) categories[cat] = { score: 100, findings: [], penalty: 0 };

  for (const fi of allFindings) {
    const bucket = categories[fi.category];
    if (!bucket) continue;
    bucket.findings.push(fi);
    bucket.penalty += PENALTY[fi.severity] || 0;
  }

  let overall = 0;
  for (const [cat, w] of Object.entries(WEIGHTS)) {
    const c = categories[cat];
    c.score = Math.max(0, 100 - c.penalty);
    overall += c.score * w;
  }
  overall = Math.round(overall);

  return { overall, grade: grade(overall), categories, weights: WEIGHTS };
}

/** Sort helper: most severe first, then by category. */
const SEV_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
function bySeverity(a, b) {
  return (SEV_ORDER[a.severity] - SEV_ORDER[b.severity]) || a.category.localeCompare(b.category);
}

module.exports = { score, grade, bySeverity, WEIGHTS, PENALTY, SEV_ORDER };
