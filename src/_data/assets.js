/**
 * Cache-busting fingerprints for the site's own CSS (and JS, if ever needed).
 *
 * The host serves /css/*.css with a far-future Expires alongside no-cache, so
 * browsers can hold a stale stylesheet for days after a deploy — the sub-pages
 * (which depend on work.css) then render unstyled while the homepage looks fine.
 * Appending ?v=<hash> to each stylesheet link means the URL changes whenever the
 * CSS source changes, so a new deploy is always fetched fresh; when nothing
 * changed the hash is identical, so caches are still used. Content-based, not a
 * timestamp, so a no-op rebuild doesn't needlessly bust every cache.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function hashTree(dir, extensions) {
  const hash = crypto.createHash("md5");
  const walk = (d) => {
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (extensions.includes(path.extname(entry.name))) hash.update(fs.readFileSync(p));
    }
  };
  walk(dir);
  return hash.digest("hex").slice(0, 8);
}

module.exports = {
  css: hashTree(path.join(__dirname, "..", "css"), [".css"]),
  js: hashTree(path.join(__dirname, "..", "js"), [".js"]),
};
