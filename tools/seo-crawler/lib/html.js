/**
 * html.js — dependency-free HTML extraction for the OOVERT SEO crawler.
 *
 * The site ships well-formed, hand-authored, server-rendered markup, so a set
 * of focused tag scanners is enough to pull out exactly the elements SEO cares
 * about (title, meta, links, headings, images, JSON-LD) without a DOM library.
 * Everything here is pure string work: no network, no dependencies.
 */

'use strict';

/** Decode the handful of HTML entities that show up in SEO-relevant text. */
function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, code) => {
      if (code[0] === '#') {
        const n = code[1] === 'x' || code[1] === 'X'
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
        // Guard the Unicode range: String.fromCodePoint throws RangeError for
        // values > 0x10FFFF, which would otherwise abort the whole crawl.
        return (Number.isInteger(n) && n >= 0 && n <= 0x10FFFF) ? String.fromCodePoint(n) : m;
      }
      const named = {
        amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
        rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
        mdash: '—', ndash: '–', hellip: '…', uarr: '↑',
        copy: '©', reg: '®', trade: '™',
      };
      return named[code] != null ? named[code] : m;
    });
}

/** Strip tags and collapse whitespace to get the readable text of a fragment. */
function stripTags(html) {
  return decodeEntities(String(html || '').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse the attributes out of a single start tag's inner string.
 * Handles double/single/unquoted values and boolean attributes.
 */
function parseAttrs(tagInner) {
  const attrs = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(tagInner)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[3] != null ? m[3] : m[4] != null ? m[4] : m[5] != null ? m[5] : '';
    attrs[name] = decodeEntities(value);
  }
  return attrs;
}

/** Return the inner string (attributes) of every `<tag ...>` start tag. */
function scanTags(html, tag) {
  const re = new RegExp(`<${tag}\\b([^>]*)>`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({ index: m.index, attrs: parseAttrs(m[1]) });
  }
  return out;
}

/** Remove <script>/<style>/<svg>/<template>/comments so word counts stay honest. */
function visibleText(html) {
  let s = String(html || '');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<(script|style|svg|template|noscript)\b[\s\S]*?<\/\1>/gi, ' ');
  return stripTags(s);
}

function getHtmlLang(html) {
  const m = /<html\b([^>]*)>/i.exec(html);
  return m ? parseAttrs(m[1]).lang || null : null;
}

function getTitle(html) {
  const m = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return m ? stripTags(m[1]) : null;
}

/** All <meta> tags, normalized to lower-cased keys. */
function getMetas(html) {
  return scanTags(html, 'meta').map((t) => t.attrs);
}

function metaByName(metas, name) {
  const hit = metas.find((a) => (a.name || '').toLowerCase() === name.toLowerCase());
  return hit ? hit.content ?? '' : null;
}

function metaByProperty(metas, prop) {
  const hit = metas.find((a) => (a.property || '').toLowerCase() === prop.toLowerCase());
  return hit ? hit.content ?? '' : null;
}

function getLinks(html) {
  return scanTags(html, 'link').map((t) => t.attrs);
}

function getCanonical(html) {
  const link = getLinks(html).find((a) => (a.rel || '').toLowerCase() === 'canonical');
  return link ? link.href || null : null;
}

/** Headings in document order: [{ level, text }]. */
function getHeadings(html) {
  const re = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({ level: Number(m[1][1]), text: stripTags(m[2]) });
  }
  return out;
}

/** Anchors: [{ href, text, rel, index }]. */
function getAnchors(html) {
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = parseAttrs(m[1]);
    if (attrs.href == null) continue;
    out.push({ href: attrs.href, text: stripTags(m[2]), rel: attrs.rel || '', index: m.index });
  }
  return out;
}

/** Byte spans of every <picture> block, so images can be marked responsive. */
function pictureSpans(html) {
  const re = /<picture\b[\s\S]*?<\/picture>/gi;
  const spans = [];
  let m;
  while ((m = re.exec(html)) !== null) spans.push([m.index, m.index + m[0].length]);
  return spans;
}

/** Images with the attributes SEO checks look at, plus responsive/format flags. */
function getImages(html) {
  const spans = pictureSpans(html);
  const hasSource = /<source\b[^>]*srcset=/i.test(html);
  return scanTags(html, 'img').map((t) => {
    const a = t.attrs;
    const inPicture = spans.some(([s, e]) => t.index >= s && t.index <= e);
    return {
      src: a.src || a['data-src'] || '',
      alt: a.alt != null ? a.alt : null, // null => attribute absent (a real defect)
      width: a.width || null,
      height: a.height || null,
      loading: a.loading || null,
      srcset: a.srcset || null,
      inPicture,
      responsive: Boolean(a.srcset) || (inPicture && hasSource),
    };
  });
}

/** <script> tags with src / async / defer / type for render-blocking heuristics. */
function getScripts(html) {
  return scanTags(html, 'script').map((t) => ({
    src: t.attrs.src || null,
    async: 'async' in t.attrs,
    defer: 'defer' in t.attrs,
    type: t.attrs.type || null,
    module: (t.attrs.type || '') === 'module',
    index: t.index,
  }));
}

/** Every JSON-LD block: [{ raw, data | null, error | null }]. */
function getJsonLd(html) {
  const re = /<script\b[^>]*type\s*=\s*['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim();
    try {
      out.push({ raw, data: JSON.parse(raw), error: null });
    } catch (err) {
      out.push({ raw, data: null, error: err.message });
    }
  }
  return out;
}

/** Which head position the first render-blocking script sits at (heuristic). */
function headHtml(html) {
  const m = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html);
  return m ? m[1] : html;
}

module.exports = {
  decodeEntities,
  stripTags,
  parseAttrs,
  visibleText,
  getHtmlLang,
  getTitle,
  getMetas,
  metaByName,
  metaByProperty,
  getLinks,
  getCanonical,
  getHeadings,
  getAnchors,
  getImages,
  getScripts,
  getJsonLd,
  headHtml,
};
