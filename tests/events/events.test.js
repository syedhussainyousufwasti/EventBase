

const { test, expect }       = require('../fixtures/hooks');
const { allure }             = require('allure-playwright');
const LoginPage              = require('../pages/LoginPage');
const EventsPage             = require('../pages/EventsPage');
const CreateEventPage        = require('../pages/CreateEventPage');
const { parseJSON }          = require('../utils/dataParser');
const { screenshotOnFailure }= require('../utils/screenshotHelper');
const logger                 = require('../utils/logger');

// ── Test Data ─────────────────────────────────────────────
const loginData = parseJSON('loginData.json');
const eventData = parseJSON('eventData.json');
const manager   = loginData.validUsers[0];
const events    = eventData.events;

async function loginAsManager(page) {
  const lp = new LoginPage(page);
  await lp.navigate();
  await lp.loginAndWaitForEvents(manager.email, manager.password);
}

// ─────────────────────────────────────────────────────────
test.describe('📅 Events Tests', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    logger.info(`---- START: ${testInfo.title} ----`);
    await allure.suite('Events');
    await allure.feature('Event Management');
    await loginAsManager(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'failed') {
      await screenshotOnFailure(page, testInfo.title.replace(/\s+/g, '_'));
    }
    logger.info(`---- END: ${testInfo.title} [${testInfo.status.toUpperCase()}] ----`);
  });

  // ── TC-18 ────────────────────────────────────────────────
  test('TC-18: Events page shows LIVE EVENTS title', async ({ page }) => {
    await allure.story('Page Render');
    await allure.severity('normal');
    await allure.description('The Events page must display the LIVE EVENTS heading.');

    const ep = new EventsPage(page);
    await ep.navigate();
    const title = await ep.getTitle();

    await allure.step('Assert title contains LIVE EVENTS', async () => {
      expect(title).toContain('LIVE EVENTS');
    });
    logger.success('TC-18 PASSED');
  });

  // ── TC-19 ────────────────────────────────────────────────
  test('TC-19: At least one event card visible', async ({ page }) => {
    await allure.story('Event Listing');
    await allure.severity('critical');
    await allure.description('At least one event card should be visible on the Events page.');

    const ep = new EventsPage(page);
    await ep.navigate();
    await ep.waitForCards();
    const count = await ep.getEventCount();

    await allure.step(`Assert event count > 0 (found ${count})`, async () => {
      expect(count).toBeGreaterThan(0);
    });
    logger.success('TC-19 PASSED');
  });

  // ── TC-20 ────────────────────────────────────────────────
  test('TC-20: Event cards have titles', async ({ page }) => {
    await allure.story('Event Listing');
    await allure.severity('normal');
    await allure.description('Each event card must have a non-empty title.');

    const ep = new EventsPage(page);
    await ep.navigate();
    await ep.waitForCards();
    const titles = await ep.getEventTitles();

    await allure.step('Assert every title is non-empty', async () => {
      titles.forEach(t => expect(t.trim().length).toBeGreaterThan(0));
    });
    logger.success('TC-20 PASSED');
  });

  // ── TC-21 ────────────────────────────────────────────────
  test('TC-21: Event card shows Slots Left info', async ({ page }) => {
    await allure.story('Event Listing');
    await allure.severity('normal');
    await allure.description('The first event card must display remaining slot count.');

    const ep = new EventsPage(page);
    await ep.navigate();
    await ep.waitForCards();
    const slotText = await ep.getSlotText(0);

    await allure.step('Assert slot text contains "Slots Left"', async () => {
      expect(slotText).toContain('Slots Left');
    });
    logger.success('TC-21 PASSED');
  });

  // ── TC-22 ────────────────────────────────────────────────
  test('TC-22: Secure Seat buttons exist', async ({ page }) => {
    await allure.story('Event Booking');
    await allure.severity('critical');
    await allure.description('Every event must have a visible Secure Seat button.');

    const ep = new EventsPage(page);
    await ep.navigate();
    await ep.waitForCards();
    const count = await ep.bookBtns.count();

    await allure.step(`Assert at least one book button (found ${count})`, async () => {
      expect(count).toBeGreaterThan(0);
    });
    logger.success('TC-22 PASSED');
  });

  // ── TC-23 ────────────────────────────────────────────────
  test('TC-23: Create Event page title shows HOST NEW EVENT', async ({ page }) => {
    await allure.story('Create Event');
    await allure.severity('normal');
    await allure.description('The Create Event page must display the HOST NEW EVENT heading.');

    const cp = new CreateEventPage(page);
    await cp.navigate();
    const title = await cp.getTitle();

    await allure.step('Assert title contains HOST NEW EVENT', async () => {
      expect(title).toContain('HOST NEW EVENT');
    });
    logger.success('TC-23 PASSED');
  });

  // ── TC-24 ────────────────────────────────────────────────
  test('TC-24: Create Event form has all required fields', async ({ page }) => {
    await allure.story('Create Event');
    await allure.severity('normal');
    await allure.description('All form fields — title, description, venue, date, publish button — must be visible.');

    const cp = new CreateEventPage(page);
    await cp.navigate();

    await allure.step('Assert all form fields are visible', async () => {
      expect(await cp.titleInput.isVisible()).toBe(true);
      expect(await cp.descInput.isVisible()).toBe(true);
      expect(await cp.venueSelect.isVisible()).toBe(true);
      expect(await cp.dateInput.isVisible()).toBe(true);
      expect(await cp.publishBtn.isVisible()).toBe(true);
    });
    logger.success('TC-24 PASSED');
  });

  // ── TC-25 ────────────────────────────────────────────────
  test('TC-25: Sizabist Auditorium sets 200 seat capacity', async ({ page }) => {
    await allure.story('Create Event');
    await allure.severity('normal');
    await allure.description('Selecting "Sizabist Auditorium" must auto-populate capacity to 200.');

    const cp = new CreateEventPage(page);
    await cp.navigate();
    await cp.venueSelect.selectOption({ label: events[0].venueOption });

    const capText = await page.locator('span[style*="color"]').last().innerText();
    await allure.step('Assert capacity shows 200', async () => {
      expect(capText).toContain('200');
    });
    logger.success('TC-25 PASSED');
  });

  // ── TC-26 ────────────────────────────────────────────────
  test('TC-26: Create new event using JSON data', async ({ page }) => {
    await allure.story('Create Event');
    await allure.severity('critical');
    await allure.description('Data-driven: creates a new event from eventData.json[0] and publishes it.');

    const cp = new CreateEventPage(page);
    await cp.navigate();
    const ev = events[0];

    await allure.parameter('Event Title', ev.title);
    await allure.parameter('Venue',       ev.venue);
    await allure.parameter('Date',        ev.date);

    await cp.fillForm(ev.title, ev.description, ev.venueOption, ev.date);
    await cp.publish();

    logger.success('TC-26 PASSED');
  });
});
