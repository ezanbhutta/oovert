/**
 * OOVERT — Eleventy build.
 *
 * The public site stays exactly what it was: hand-authored HTML, self-hosted
 * fonts and vendored scripts, zero external requests. Eleventy's only job is to
 * render the templates from editable data files and passthrough-copy the craft
 * (CSS / JS / vendor / assets) byte-for-byte to the same output paths.
 */
/* --- Colour math for per-project theming (the contrast guardrail) ----------
 * Accents are derived at build time so a project can pick one brand colour and
 * still ship AA-legible small text on both the paper and ink grounds. */
const PAPER = [243, 240, 233]; // --paper #F3F0E9
const INK = [22, 20, 15]; // --ink #16140F
const AA = 5.6; // small-text target used across the site

const hexToRgb = (hex) => {
  let h = String(hex).trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbToHex = (rgb) =>
  '#' + rgb.map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('');
const relLum = (rgb) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const la = relLum(a), lb = relLum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
const mix = (a, b, t) => a.map((c, i) => c + (b[i] - c) * t);
// Nudge a colour toward a target (black to sit on light, white to sit on ink)
// until it clears the AA ratio against `ground`, then return the hex.
const towardUntilAA = (hex, ground, target) => {
  let rgb = hexToRgb(hex);
  if (contrast(rgb, ground) >= AA) return rgbToHex(rgb);
  for (let t = 0.04; t <= 1.0001; t += 0.04) {
    const cand = mix(hexToRgb(hex), target, t);
    if (contrast(cand, ground) >= AA) return rgbToHex(cand);
  }
  return rgbToHex(target);
};

module.exports = function (eleventyConfig) {
  // Signal colour, darkened just enough to read as small text on paper.
  eleventyConfig.addFilter('onLight', (hex) => towardUntilAA(hex, PAPER, [0, 0, 0]));
  // Signal colour, lightened just enough to read as small text on ink.
  eleventyConfig.addFilter('onDark', (hex) => towardUntilAA(hex, INK, [255, 255, 255]));
  // Text colour to sit ON a full-bleed field: whichever ground reads clearer.
  eleventyConfig.addFilter('fieldInk', (hex) => {
    const rgb = hexToRgb(hex);
    return contrast(rgb, INK) >= contrast(rgb, PAPER) ? '#16140F' : '#F3F0E9';
  });

  // Filter an array of objects by an exact key match (e.g. published projects).
  eleventyConfig.addFilter('where', (arr, key, val) =>
    (arr || []).filter((o) => o && o[key] === val)
  );

  // Passthrough the hand-built craft, unchanged, to identical output paths.
  ["css", "js", "vendor", "assets"].forEach((dir) =>
    eleventyConfig.addPassthroughCopy({ [`src/${dir}`]: dir })
  );
  ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "robots.txt", "sitemap.xml"].forEach((f) =>
    eleventyConfig.addPassthroughCopy({ [`src/${f}`]: f })
  );

  // Content admin (Sveltia): static loader page + config.yml, copied as-is.
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  // Only .njk are templates; every .html is treated as a static asset so the
  // hand-built case study is never re-processed.
  eleventyConfig.setTemplateFormats(["njk"]);

  return {
    dir: { input: "src", output: "_site", data: "_data", includes: "_includes" },
    htmlTemplateEngine: "njk",
  };
};
