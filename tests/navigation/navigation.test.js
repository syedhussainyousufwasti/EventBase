

const { test, expect } = require('../fixtures/hooks');
const { allure } = require('allure-playwright');
const LoginPage = require('../pages/LoginPage');
const NavbarPage = require('../pages/NavbarPage');
const { parseJSON } = require('../utils/dataParser');
const { screenshotOnFailure } = require('../utils/screenshotHelper');
const logger = require('../utils/logger');

// ── Test Data ─────────────────────────────────────────────
const loginData = parseJSON('loginData.json');
const manager = loginData.validUsers[0];

async function loginAs(page, u) {
  const lp = new LoginPage(page);
  await lp.navigate();
  await lp.loginAndWaitForEvents(u.email, u.password);
}

// ─────────────────────────────────────────────────────────
test.describe('🧭 Navigation Tests', () => {

  test.beforeAll(async () => {
    logger.info('==== Navigation Suite: beforeAll ====');
  });

  test.afterAll(async () => {
    logger.info('==== Navigation Suite: afterAll ====');
  });

  test.beforeEach(async ({ page }, testInfo) => {
    logger.info(`---- START: ${testInfo.title} ----`);
    await allure.suite('Navigation');
    await allure.feature('App Navigation');
    await loginAs(page, manager);
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'failed') {
      await screenshotOnFailure(page, testInfo.title.replace(/\s+/g, '_'));
    }
    logger.info(`---- END: ${testInfo.title} [${testInfo.status.toUpperCase()}] ----`);
  });

  // ── TC-42 ────────────────────────────────────────────────
  test('TC-42: All navbar links visible when logged in', async ({ page }) => {
    await allure.story('Navbar');
    await allure.severity('normal');
    await allure.description('All navigation links must be visible to an authenticated user.');

    const nb = new NavbarPage(page);
    await page.goto('http://localhost:5173/events');

    await allure.step('Assert all navbar links are visible', async () => {
      expect(await nb.eventsLink.isVisible()).toBe(true);
      expect(await nb.createLink.isVisible()).toBe(true);
      expect(await nb.ticketsLink.isVisible()).toBe(true);
      expect(await nb.statsLink.isVisible()).toBe(true);
      expect(await nb.logoutBtn.isVisible()).toBe(true);
    });
    logger.success('TC-42 PASSED');
  });

  // ── TC-43 ────────────────────────────────────────────────
  test('TC-43: Unauthenticated user redirected from /events', async ({ page }) => {
    await allure.story('Auth Guard');
    await allure.severity('critical');
    await allure.description('A user without a token should be redirected away from /events.');

    await allure.step('Remove token from localStorage', async () => {
      await page.evaluate(() => localStorage.removeItem('token'));
    });

    await allure.step('Attempt to access /events', async () => {
      await page.goto('http://localhost:5173/events');
      await page.waitForTimeout(500);
    });

    await allure.step('Assert user is NOT on /events', async () => {
      expect(page.url()).not.toContain('/events');
    });
    logger.success('TC-43 PASSED');
  });

  // ── TC-44 ────────────────────────────────────────────────
  test('TC-44: Browser back button works correctly', async ({ page }) => {
    await allure.story('Browser Navigation');
    await allure.severity('normal');
    await allure.description('Pressing browser Back from /create-event returns to /events.');

    await allure.step('Navigate to /events', async () => {
      await page.goto('http://localhost:5173/events');
    });

    await allure.step('Navigate to /create-event', async () => {
      await page.goto('http://localhost:5173/create-event');
    });

    await allure.step('Press browser Back', async () => {
      await page.goBack();
      await page.waitForTimeout(300);
    });

    await allure.step('Assert URL is back at /events', async () => {
      expect(page.url()).toContain('/events');
    });
    logger.success('TC-44 PASSED');
  });

  // ── TC-45 ────────────────────────────────────────────────
  test('TC-45: Unauthenticated access to /create-event redirects', async ({ page }) => {
    await allure.story('Auth Guard');
    await allure.severity('critical');
    await allure.description('A user without a token should be redirected from /create-event.');

    await allure.step('Remove token from localStorage', async () => {
      await page.evaluate(() => localStorage.removeItem('token'));
    });

    await allure.step('Attempt to access /create-event', async () => {
      await page.goto('http://localhost:5173/create-event');
      await page.waitForTimeout(500);
    });

    await allure.step('Assert user is NOT on /create-event', async () => {
      expect(page.url()).not.toContain('/create-event');
    });
    logger.success('TC-45 PASSED');
  });
});
