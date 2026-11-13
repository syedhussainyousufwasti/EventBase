// ============================================================
//  Yeh standalone helper hai; BasePage.takeScreenshot() bhi
//  same kaam karta hai per-instance.
//  Test files mein directly import karke bhi use kar sakte ho.
// ============================================================

const path   = require('path');
const fs     = require('fs');
const logger = require('./logger');

const dir = path.join(__dirname, '../screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

/**
 * Takes a full-page screenshot and saves it.
 * @param {import('@playwright/test').Page} page
 * @param {string} name   - label for filename
 * @returns {string} filepath
 */
async function takeScreenshot(page, name = 'screenshot') {
  const ts   = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(dir, `${name}_${ts}.png`);
  await page.screenshot({ path: file, fullPage: true });
  logger.info(`📸 Screenshot: ${name}_${ts}.png`);
  return file;
}

/**
 * Takes a screenshot on test failure.
 * @param {import('@playwright/test').Page} page
 * @param {string} testName
 */
async function screenshotOnFailure(page, testName) {
  logger.error(`❌ Test FAILED — screenshot: ${testName}`);
  return takeScreenshot(page, `FAIL_${testName}`);
}

module.exports = { takeScreenshot, screenshotOnFailure };
