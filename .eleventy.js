/**
 * OOVERT — Eleventy build.
 *
 * The public site stays exactly what it was: hand-authored HTML, self-hosted
 * fonts and vendored scripts, zero external requests. Eleventy's only job is to
 * render the templates from editable data files and passthrough-copy the craft
 * (CSS / JS / vendor / assets) byte-for-byte to the same output paths.
 */
module.exports = function (eleventyConfig) {
  // Passthrough the hand-built craft, unchanged, to identical output paths.
  ["css", "js", "vendor", "assets"].forEach((dir) =>
    eleventyConfig.addPassthroughCopy({ [`src/${dir}`]: dir })
  );
  ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "robots.txt", "sitemap.xml"].forEach((f) =>
    eleventyConfig.addPassthroughCopy({ [`src/${f}`]: f })
  );

  // The case study stays a static passthrough until Phase 0b templatizes it
  // into a project collection.
  eleventyConfig.addPassthroughCopy({ "src/work/case-study.html": "work/case-study.html" });

  // Only .njk are templates; every .html is treated as a static asset so the
  // hand-built case study is never re-processed.
  eleventyConfig.setTemplateFormats(["njk"]);

  return {
    dir: { input: "src", output: "_site", data: "_data", includes: "_includes" },
    htmlTemplateEngine: "njk",
  };
};
