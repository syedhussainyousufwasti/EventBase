// ============================================================

//  Yeh file custom Playwright fixtures define karti hai:
//   • loginPage, signupPage, eventsPage, etc. auto-inject
//   • Allure step, screenshot, attach — sab automatic
//   • beforeEach / afterEach globally har test mein
// ============================================================

const { test: base, expect } = require('@playwright/test');
const { allure }             = require('allure-playwright');

const LoginPage         = require('../pages/LoginPage');
const SignupPage        = require('../pages/SignupPage');
const EventsPage        = require('../pages/EventsPage');
const CreateEventPage   = require('../pages/CreateEventPage');
const UserDashboardPage = require('../pages/UserDashboardPage');
const NavbarPage        = require('../pages/NavbarPage');
const ManagerPage       = require('../pages/ManagerPage');
const { takeScreenshot } = require('../utils/screenshotHelper');
const logger             = require('../utils/logger');

// ── Extend base test with custom fixtures ─────────────────
const test = base.extend({

  // ── Page Object Fixtures ─────────────────────────────────
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },

  eventsPage: async ({ page }, use) => {
    await use(new EventsPage(page));
  },

  createEventPage: async ({ page }, use) => {
    await use(new CreateEventPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new UserDashboardPage(page));
  },

  navbarPage: async ({ page }, use) => {
    await use(new NavbarPage(page));
  },

  managerPage: async ({ page }, use) => {
    await use(new ManagerPage(page));
  },

  // ── Authenticated Page Fixtures ──────────────────────────

  // Logs in as manager before test, page ready on /events
  authenticatedManagerPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAndWaitForEvents(
      'arbaaz@eventbase.com',
      'Arbaaz@1234'
    );
    await use(page);
  },

  // Logs in as regular user before test
  authenticatedUserPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAndWaitForEvents(
      'testuser@eventbase.com',
      'Test@1234'
    );
    await use(page);
  },
});

// ── Re-export expect unchanged ────────────────────────────
module.exports = { test, expect };
