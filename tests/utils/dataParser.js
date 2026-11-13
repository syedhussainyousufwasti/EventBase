

const path = require('path');
const fs   = require('fs');

/**
 * Reads and parses a JSON file from the /tests/data/ directory.
 * @param {string} filename  e.g. 'loginData.json'
 * @returns {object}
 */
function parseJSON(filename) {
  const filepath = path.join(__dirname, '../data', filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`[dataParser] File not found: ${filepath}`);
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

module.exports = { parseJSON };
