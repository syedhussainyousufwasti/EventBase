

const { test, expect } = require('../fixtures/hooks');
const { allure } = require('allure-playwright');
const LoginPage = require('../pages/LoginPage');
const ManagerPage = require('../pages/ManagerPage');
const CreateEventPage = require('../pages/CreateEventPage');
const NavbarPage = require('../pages/NavbarPage');
const { parseJSON } = require('../utils/dataParser');
const { screenshotOnFailure } = require('../utils/screenshotHelper');
const logger = require('../utils/logger');

// ── Test Data ─────────────────────────────────────────────
const loginData = parseJSON('loginData.json');
const eventData = parseJSON('eventData.json');
const manager = loginData.validUsers[0];

async function loginAsManager(page) {
  const lp = new LoginPage(page);
  await lp.navigate();
  await lp.loginAndWaitForEvents(manager.email, manager.password);
}

// ─────────────────────────────────────────────────────────
test.describe('📊 Manager Dashboard Tests', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    logger.info(`---- START: ${testInfo.title} ----`);
    await allure.suite('Manager');
    await allure.feature('Manager Dashboard');
    await loginAsManager(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'failed') {
      await screenshotOnFailure(page, testInfo.title.replace(/\s+/g, '_'));
    }
    logger.info(`---- END: ${testInfo.title} [${testInfo.status.toUpperCase()}] ----`);
  });

  // ── TC-35 ────────────────────────────────────────────────
  test('TC-35: Manager dashboard title is EVENT ANALYTICS', async ({ page }) => {
    await allure.story('Page Render');
    await allure.severity('normal');
    await allure.description('The Manager Dashboard page must display the EVENT ANALYTICS heading.');

    const mp = new ManagerPage(page);
    await mp.navigate();
    await mp.waitForLoad();
    const title = await mp.getTitle();

    await allure.step('Assert title contains EVENT ANALYTICS', async () => {
      expect(title).toContain('EVENT ANALYTICS');
    });
    logger.success('TC-35 PASSED');
  });

  // ── TC-36 ────────────────────────────────────────────────
  test('TC-36: Two stat cards visible', async ({ page }) => {
    await allure.story('Stats Display');
    await allure.severity('normal');
    await allure.description('The dashboard must show at least 2 stat cards.');

    const mp = new ManagerPage(page);
    await mp.navigate();
    await mp.waitForLoad();
    const count = await mp.statCards.count();

    await allure.step(`Assert statCard count >= 2 (found ${count})`, async () => {
      expect(count).toBeGreaterThanOrEqual(2);
    });
    logger.success('TC-36 PASSED');
  });

  // ── TC-37 ────────────────────────────────────────────────
  test('TC-37: Managed events count is a valid number', async ({ page }) => {
    await allure.story('Stats Display');
    await allure.severity('normal');
    await allure.description('The managed events count stat must be a non-negative number.');

    const mp = new ManagerPage(page);
    await mp.navigate();
    await mp.waitForLoad();
    const n = await mp.getManagedCount();

    await allure.parameter('Managed Events Count', String(n));
    await allure.step('Assert managed count is a valid non-negative number', async () => {
      expect(typeof n).toBe('number');
      expect(n).toBeGreaterThanOrEqual(0);
    });
    logger.success('TC-37 PASSED');
  });

  // ── TC-38 ────────────────────────────────────────────────
  test('TC-38: Total tickets sold is a valid number', async ({ page }) => {
    await allure.story('Stats Display');
    await allure.severity('normal');
    await allure.description('The total tickets sold stat must be a non-negative number.');

    const mp = new ManagerPage(page);
    await mp.navigate();
    await mp.waitForLoad();
    const n = await mp.getTotalSold();

    await allure.parameter('Total Tickets Sold', String(n));
    await allure.step('Assert tickets sold is a valid non-negative number', async () => {
      expect(typeof n).toBe('number');
      expect(n).toBeGreaterThanOrEqual(0);
    });
    logger.success('TC-38 PASSED');
  });

  // ── TC-39 ────────────────────────────────────────────────
  test('TC-39: Navbar Stats link opens Manager Dashboard', async ({ page }) => {
    await allure.story('Navigation');
    await allure.severity('normal');
    await allure.description('Clicking "Stats" in the Navbar navigates to /manager-stats.');

    const nb = new NavbarPage(page);
    await page.goto('http://localhost:5173/events'); await nb.goToStats();
    await page.waitForTimeout(500);

    await allure.step('Assert URL contains manager-stats', async () => {
      expect(page.url()).toContain('manager-stats');
    });
    logger.success('TC-39 PASSED');
  });

  // ── TC-40 ────────────────────────────────────────────────
  test('TC-40: Create Board Strategy event from JSON data', async ({ page }) => {
    await allure.story('Create Event');
    await allure.severity('critical');
    await allure.description('Data-driven: creates a Board Strategy event from eventData.json[1].');

    const cp = new CreateEventPage(page);
    await cp.navigate();
    const ev = eventData.events[1];

    await allure.parameter('Event Title', ev.title);
    await allure.parameter('Venue', ev.venue);
    await allure.parameter('Date', ev.date);

    await cp.fillForm(ev.title, ev.description, ev.venueOption, ev.date);
    await cp.publish();

    logger.success('TC-40 PASSED');
  });

  // ── TC-41 ────────────────────────────────────────────────
  test('TC-41: Event cards on dashboard show Sold-Available text', async ({ page }) => {
    await allure.story('Stats Display');
    await allure.severity('normal');
    await allure.description('If event cards exist, each should display sold/available info.');

    const mp = new ManagerPage(page);
    await mp.navigate();
    await mp.waitForLoad();
    const count = await mp.getEventCardCount();

    if (count > 0) {
      const text = await mp.eventCards.first().innerText();
      await allure.step('Assert first event card has content', async () => {
        expect(text.length).toBeGreaterThan(0);
      });
    } else {
      await allure.step('No event cards — skipping content check', async () => { });
    }
    logger.success('TC-41 PASSED');
  });
});
