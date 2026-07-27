/**
 * Per-page Open Graph images, generated at build time.
 *
 * One 1200×630 card per page — the OOVERT wordmark, the eclipse mark, the page
 * title, and the tagline — composed as SVG and rasterised with sharp into
 * _site/assets/og/<slug>.png. Replaces the single shared og.png so every page
 * shares with its own card.
 *
 * Fonts are the fragile part. The rasteriser resolves families through the
 * build host's fontconfig, not the site's own webfonts, so it renders whatever
 * the machine happens to have. This once shipped a full set of cards in tofu
 * boxes: the host had no Liberation family, every glyph fell back to the
 * missing-character box, and nothing noticed until the cards were live on
 * social. So: a stack of families rather than one, and assertFontsRender()
 * below fails the build instead of publishing boxes again.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/* Ordered by preference, but any of them renders an acceptable card. Liberation
   is metric-compatible with Helvetica/Arial; DejaVu ships with almost every
   Linux image; Arial/Helvetica cover macOS and Windows build hosts. */
const SANS = "Liberation Sans, DejaVu Sans, Arial, Helvetica, sans-serif";
const SERIF = "Liberation Serif, DejaVu Serif, Times New Roman, Georgia, serif";

const PAGES = [
  { slug: 'home', title: ['Brand strategy', '& identity'] },
  { slug: 'work', title: ['Selected', 'work'] },
  { slug: 'approach', title: ['A brand in', 'four moves'] },
  { slug: 'studio', title: ['The studio'] },
  { slug: 'pricing', title: ['How much does', 'branding cost?'] },
  { slug: 'brand-identity', title: ['Brand identity', 'design'] },
  { slug: 'logo-design', title: ['Logo', 'design'] },
  { slug: 'brand-guidelines', title: ['Brand', 'guidelines'] },
  { slug: 'branding', title: ['Branding'] },
  { slug: 'journal', title: ['The', 'Journal'] },
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
        `<text x="80" y="${startY + i * 104}" font-family="${SANS}" font-weight="700" font-size="96" letter-spacing="-2" fill="${paper}">${esc(t)}</text>`
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="${ink}"/>
    <circle cx="1010" cy="150" r="120" fill="none" stroke="${violet}" stroke-width="2" opacity="0.9"/>
    <circle cx="1090" cy="150" r="120" fill="none" stroke="${violet}" stroke-width="2" opacity="0.9"/>
    <text x="80" y="96" font-family="${SANS}" font-weight="700" font-size="30" letter-spacing="6" fill="${paper}">OOVERT</text>
    ${lines}
    <text x="80" y="560" font-family="${SERIF}" font-style="italic" font-size="40" fill="${violet}">Camouflage is for prey.</text>
  </svg>`;
}

/* Tofu guard.
 *
 * When no requested family resolves, the rasteriser draws every character as
 * the same missing-glyph box, so the card still "renders" and the build still
 * passes. The cheap way to catch that: draw two characters whose real shapes
 * are nothing alike, then compare the pixels. A working font gives two
 * different images; tofu gives two identical boxes. */
async function assertFontsRender() {
  const glyph = (ch) =>
    sharp(
      Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">` +
          `<text x="8" y="60" font-family="${SANS}" font-size="64" fill="#000">${ch}</text></svg>`
      )
    )
      .png()
      .toBuffer();

  const [i, w] = await Promise.all([glyph('I'), glyph('W')]);
  if (i.equals(w)) {
    throw new Error(
      'OG images: no usable font on this host, so every glyph would render as a ' +
        'tofu box. Install one of: ' + SANS + '. On Debian/Ubuntu: ' +
        'apt-get install -y fonts-liberation fontconfig'
    );
  }
}

async function generate(outDir) {
  await assertFontsRender();
  fs.mkdirSync(outDir, { recursive: true });
  for (const p of PAGES) {
    await sharp(Buffer.from(svg(p.title)))
      .png({ compressionLevel: 9 })
      .toFile(path.join(outDir, `${p.slug}.png`));
  }
  return PAGES.length;
}

module.exports = { generate, PAGES, assertFontsRender };
