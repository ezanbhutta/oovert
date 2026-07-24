/**
 * Per-page Open Graph images, generated at build time.
 *
 * One 1200×630 card per page — the OOVERT wordmark, the eclipse mark, the page
 * title, and the tagline — composed as SVG and rasterised with sharp into
 * _site/assets/og/<slug>.png. Replaces the single shared og.png so every page
 * shares with its own card. Uses the Liberation family (present on the build
 * host); the site's own Archivo isn't available to the SVG rasteriser.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PAGES = [
  { slug: 'home', title: ['Brand strategy', '& identity'] },
  { slug: 'work', title: ['Selected', 'work'] },
  { slug: 'approach', title: ['A brand in', 'four moves'] },
  { slug: 'studio', title: ['The studio'] },
  { slug: 'nowa-brand-identity', title: ['NOWA', 'Brand Identity'] },
];

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svg(titleLines) {
  const ink = '#16140F', paper = '#F3F0E9', violet = '#815EFA';
  const startY = titleLines.length > 1 ? 296 : 348;
  const lines = titleLines
    .map(
      (t, i) =>
        `<text x="80" y="${startY + i * 104}" font-family="Liberation Sans" font-weight="700" font-size="96" letter-spacing="-2" fill="${paper}">${esc(t)}</text>`
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="${ink}"/>
    <circle cx="1010" cy="150" r="120" fill="none" stroke="${violet}" stroke-width="2" opacity="0.9"/>
    <circle cx="1090" cy="150" r="120" fill="none" stroke="${violet}" stroke-width="2" opacity="0.9"/>
    <text x="80" y="96" font-family="Liberation Sans" font-weight="700" font-size="30" letter-spacing="6" fill="${paper}">OOVERT</text>
    ${lines}
    <text x="80" y="560" font-family="Liberation Serif" font-style="italic" font-size="40" fill="${violet}">Camouflage is for prey.</text>
  </svg>`;
}

async function generate(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const p of PAGES) {
    await sharp(Buffer.from(svg(p.title)))
      .png({ compressionLevel: 9 })
      .toFile(path.join(outDir, `${p.slug}.png`));
  }
  return PAGES.length;
}

module.exports = { generate, PAGES };
