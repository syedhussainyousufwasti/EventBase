// ============================================================
//
//  Har Page Object is class se extend karega.
//  Common features:
//    • takeScreenshot()     — manual screenshot (Allure attach)
//    • screenshotOnStep()   — step ke baad auto screenshot
//    • waitForVisible()     — reliable element wait
//    • waitForURL()         — navigation wait
//    • allureStep()         — Allure mein step log
// ============================================================

const { allure } = require('allure-playwright');
const path       = require('path');
const fs         = require('fs');
const logger     = require('../utils/logger');

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Ensure screenshots directory exists
    const dir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // ── Screenshot helpers ────────────────────────────────────

  /**
   * Takes a full-page screenshot and attaches it to Allure report.
   * @param {string} name  — label shown in Allure
   */
  async takeScreenshot(name = 'screenshot') {
    const ts       = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${ts}.png`;
    const filepath = path.join(__dirname, '../screenshots', filename);

    const buffer = await this.page.screenshot({ path: filepath, fullPage: true });

    // Attach to Allure
    await allure.attachment(name, buffer, 'image/png');

    logger.info(`📸 Screenshot saved: ${filename}`);
    return filepath;
  }

  /**
   * Takes a screenshot only when a test step fails.
   * Call in afterEach hooks.
   * @param {string} testName
   */
  async screenshotOnFailure(testName) {
    logger.error(`❌ FAILED — capturing screenshot: ${testName}`);
    return this.takeScreenshot(`FAIL_${testName.replace(/\s+/g, '_')}`);
  }

  // ── Wait helpers ──────────────────────────────────────────

  /**
   * Wait for a CSS selector to be visible.
   * @param {string} selector
   * @param {number} timeout   ms (default 10 000)
   */
  async waitForVisible(selector, timeout = 10_000) {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for the URL to contain a substring.
   * @param {string} urlPart
   * @param {number} timeout
   */
  async waitForURL(urlPart, timeout = 10_000) {
    await this.page.waitForURL(`**${urlPart}**`, { timeout });
  }

  /**
   * Wait for network to settle (networkidle).
   * @param {number} timeout
   */
  async waitForNetworkIdle(timeout = 15_000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  // ── Allure helpers ────────────────────────────────────────

  /**
   * Wraps a step with an Allure step label + screenshot after.
   * Usage:  await this.allureStep('Fill login form', async () => { ... });
   *
   * @param {string}   stepName
   * @param {Function} fn
   */
  async allureStep(stepName, fn) {
    logger.step(stepName);
    await allure.step(stepName, async () => {
      await fn();
      await this.takeScreenshot(stepName.replace(/\s+/g, '_'));
    });
  }

  // ── Navigation ────────────────────────────────────────────

  /**
   * Generic navigate; subclasses typically override with specific URL.
   * @param {string} url
   */
  async goto(url) {
    logger.step(`Navigate → ${url}`);
    await this.page.goto(url);
    await this.takeScreenshot(`page_load_${url.replace(/\//g, '_')}`);
  }
}

module.exports = BasePage;
