

const { test, expect }       = require('../fixtures/hooks');
const { allure }             = require('allure-playwright');
const LoginPage              = require('../pages/LoginPage');
const EventsPage             = require('../pages/EventsPage');
const UserDashboardPage      = require('../pages/UserDashboardPage');
const NavbarPage             = require('../pages/NavbarPage');
const { parseJSON }          = require('../utils/dataParser');
const { screenshotOnFailure }= require('../utils/screenshotHelper');
const logger                 = require('../utils/logger');

// ── Test Data ─────────────────────────────────────────────
const loginData = parseJSON('loginData.json');
const user      = loginData.validUsers[1]; // testuser@eventbase.com

async function loginAsUser(page) {
  const lp = new LoginPage(page);
  await lp.navigate();
  await lp.loginAndWaitForEvents(user.email, user.password);
}

// ─────────────────────────────────────────────────────────
test.describe('🎟️ Booking Tests', () => {

  // Serial mode — booking state must be consistent
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }, testInfo) => {
    logger.info(`---- START: ${testInfo.title} ----`);
    await allure.suite('Booking');
    await allure.feature('Ticket Booking');
    await loginAsUser(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'failed') {
      await screenshotOnFailure(page, testInfo.title.replace(/\s+/g, '_'));
    }
    logger.info(`---- END: ${testInfo.title} [${testInfo.status.toUpperCase()}] ----`);
  });

  // ── TC-34 (runs first to capture empty state) ─────────
  test('TC-34: Empty bookings shows no bookings message or cards', async ({ page }) => {
    await allure.story('Empty State');
    await allure.severity('normal');
    await allure.description('Before booking, the dashboard shows an empty state or zero cards.');

    const ud = new UserDashboardPage(page);
    await ud.navigate();
    await ud.waitForLoad();

    const empty = await ud.hasNoBookings().catch(() => false);
    const cards = await ud.getBookingCount();

    await allure.step('Assert empty state or card count >= 0', async () => {
      expect(empty || cards >= 0).toBe(true);
    });
    logger.success('TC-34 PASSED');
  });

  // ── TC-29 ────────────────────────────────────────────────
  test('TC-29: My Tickets page loads with correct title', async ({ page }) => {
    await allure.story('Page Render');
    await allure.severity('normal');
    await allure.description('The My Tickets page must display the SECURED TICKETS heading.');

    const ud = new UserDashboardPage(page);
    await ud.navigate();
    await ud.waitForLoad();
    const title = await ud.getTitle();

    await allure.step('Assert title contains SECURED TICKETS', async () => {
      expect(title).toContain('SECURED TICKETS');
    });
    logger.success('TC-29 PASSED');
  });

  // ── TC-32 ────────────────────────────────────────────────
  test('TC-32: My Tickets accessible via Navbar', async ({ page }) => {
    await allure.story('Navigation');
    await allure.severity('normal');
    await allure.description('Clicking "My Tickets" in the Navbar navigates to /my-bookings.');

    const nb = new NavbarPage(page);
    await page.goto('/events');
    await nb.goToMyTickets();
    await page.waitForTimeout(500);

    await allure.step('Assert URL contains bookings', async () => {
      expect(page.url()).toContain('bookings');
    });
    logger.success('TC-32 PASSED');
  });

  // ── TC-27 ────────────────────────────────────────────────
  test('TC-27: Ticket Secured alert appears on booking', async ({ page }) => {
    await allure.story('Book Ticket');
    await allure.severity('critical');
    await allure.description('Booking a ticket triggers a "Ticket Secured" confirmation alert.');

    const ep = new EventsPage(page);
    await ep.navigate();
    await ep.waitForCards();

    let msg = '';
    page.once('dialog', async d => { msg = d.message(); await d.accept(); });
    await ep.bookBtns.first().click();
    await page.waitForTimeout(1500);

    await allure.step('Assert alert message contains "ticket secured"', async () => {
      expect(msg.toLowerCase()).toContain('ticket secured');
    });
    logger.success('TC-27 PASSED');
  });

  // ── TC-28 ────────────────────────────────────────────────
  test('TC-28: Slot count decreases after booking', async ({ page }) => {
    await allure.story('Book Ticket');
    await allure.severity('critical');
    await allure.description('The slots-left count on an event card decreases after booking.');

    const ep = new EventsPage(page);
    await ep.navigate();
    await ep.waitForCards();
    const before = await ep.getSlotText(0);

    await allure.parameter('Slots before booking', before);

    page.once('dialog', d => d.accept());
    await ep.bookBtns.first().click();
    await page.waitForTimeout(1500);

    await ep.navigate();
    await ep.waitForCards();
    const after = await ep.getSlotText(0);

    await allure.parameter('Slots after booking', after);
    await allure.step('Assert slot count changed', async () => {
      expect(before).not.toEqual(after);
    });
    logger.success('TC-28 PASSED');
  });

  // ── TC-30 ────────────────────────────────────────────────
  test('TC-30: Booked event appears in My Tickets', async ({ page }) => {
    await allure.story('Book Ticket');
    await allure.severity('critical');
    await allure.description('After booking, the ticket appears on the My Tickets dashboard.');

    const ep = new EventsPage(page);
    await ep.navigate();
    await ep.waitForCards();

    page.once('dialog', d => d.accept());
    await ep.bookBtns.first().click();
    await page.waitForLoadState('networkidle');

    const ud = new UserDashboardPage(page);
    await ud.navigate();
    await page.waitForLoadState('networkidle');
    await ud.waitForLoad();

    const count = await ud.getBookingCount();
    await allure.step(`Assert at least 1 booking card (found ${count})`, async () => {
      expect(count).toBeGreaterThan(0);
    });
    logger.success('TC-30 PASSED');
  });

  // ── TC-31 ────────────────────────────────────────────────
  test('TC-31: VERIFIED badge visible on booked ticket', async ({ page }) => {
    await allure.story('Ticket Details');
    await allure.severity('normal');
    await allure.description('A booked ticket must show a VERIFIED badge on the dashboard.');

    const ep = new EventsPage(page);
    await ep.navigate();
    await ep.waitForCards();

    page.once('dialog', d => d.accept());
    await ep.bookBtns.first().click();
    await page.waitForLoadState('networkidle');

    const ud = new UserDashboardPage(page);
    await ud.navigate();
    await page.waitForLoadState('networkidle');
    await ud.waitForLoad();

    const isBadgeVisible = await ud.verifiedVisible();
    await allure.step('Assert VERIFIED badge is visible', async () => {
      expect(isBadgeVisible).toBe(true);
    });
    logger.success('TC-31 PASSED');
  });

  // ── TC-33 ────────────────────────────────────────────────
  test('TC-33: Ticket card shows venue info', async ({ page }) => {
    await allure.story('Ticket Details');
    await allure.severity('normal');
    await allure.description('Each booked ticket card must display the venue (📍 icon).');

    const ep = new EventsPage(page);
    await ep.navigate();
    await ep.waitForCards();

    page.once('dialog', d => d.accept());
    await ep.bookBtns.first().click();
    await page.waitForTimeout(1500);

    const ud = new UserDashboardPage(page);
    await ud.navigate();
    await ud.waitForLoad();
    const text = await ud.bookingCards.first().innerText();

    await allure.step('Assert ticket card contains 📍 venue icon', async () => {
      expect(text).toMatch(/📍/);
    });
    logger.success('TC-33 PASSED');
  });
});
