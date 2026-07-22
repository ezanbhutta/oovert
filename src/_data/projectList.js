/**
 * Ordered array of case-study projects, read from _data/projects/*.json.
 * Used to paginate the case-study template and to link the Evidence section to
 * real project URLs, so nothing breaks when a project's slug is edited.
 */
const fs = require('fs');
const path = require('path');

module.exports = () => {
  const dir = path.join(__dirname, 'projects');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
    .sort((a, b) => (a.order || 99) - (b.order || 99));
};
