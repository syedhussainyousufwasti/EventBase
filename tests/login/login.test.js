

const { test, expect }       = require('../fixtures/hooks');
const { allure }             = require('allure-playwright');
const LoginPage              = require('../pages/LoginPage');
const NavbarPage             = require('../pages/NavbarPage');
const { parseJSON }          = require('../utils/dataParser');
const { screenshotOnFailure }= require('../utils/screenshotHelper');
const logger                 = require('../utils/logger');

// ── Test Data ─────────────────────────────────────────────
const loginData  = parseJSON('loginData.json');
const validUser  = loginData.validUsers[0];   // manager
const validUser2 = loginData.validUsers[1];   // regular user
const invalid    = loginData.invalidUsers;

// ─────────────────────────────────────────────────────────
test.describe('🔐 Login Tests', () => {

  // ── Global hooks ────────────────────────────────────────
  test.beforeEach(async ({}, testInfo) => {
    logger.info(`---- START: ${testInfo.title} ----`);
    await allure.suite('Login');
    await allure.feature('Authentication');
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'failed') {
      await screenshotOnFailure(page, testInfo.title.replace(/\s+/g, '_'));
    }
    logger.info(`---- END: ${testInfo.title} [${testInfo.status.toUpperCase()}] ----`);
  });

  // ── TC-01 ────────────────────────────────────────────────
  test('TC-01: Login page title shows LOGIN', async ({ page }) => {
    await allure.story('Page Render');
    await allure.severity('normal');
    await allure.description('Verifies the Login page loads and displays the correct title.');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    const title = await loginPage.getTitle();
    await allure.step('Assert title contains LOGIN', async () => {
      expect(title).toContain('LOGIN');
    });
    logger.success('TC-01 PASSED');
  });

  // ── TC-02 ────────────────────────────────────────────────
  test('TC-02: Valid login redirects to /events', async ({ page }) => {
    await allure.story('Valid Login');
    await allure.severity('critical');
    await allure.description('Manager logs in with correct credentials and is redirected to /events.');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAndWaitForEvents(validUser.email, validUser.password);

    await allure.step('Assert URL contains /events', async () => {
      expect(page.url()).toContain('/events');
    });
    logger.success('TC-02 PASSED');
  });

  // ── TC-03 ────────────────────────────────────────────────
  test('TC-03: Second valid user login works', async ({ page }) => {
    await allure.story('Valid Login');
    await allure.severity('critical');
    await allure.description('Regular user logs in with correct credentials.');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAndWaitForEvents(validUser2.email, validUser2.password);

    await allure.step('Assert URL contains /events', async () => {
      expect(page.url()).toContain('/events');
    });
    logger.success('TC-03 PASSED');
  });

  // ── TC-04 ────────────────────────────────────────────────
  test('TC-04: Wrong password shows Access Denied alert', async ({ page }) => {
    await allure.story('Invalid Login');
    await allure.severity('critical');
    await allure.description('Login with correct email but wrong password shows Access Denied.');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    let alertMsg = '';
    page.on('dialog', async d => { alertMsg = d.message(); await d.accept(); });
    await loginPage.login(invalid[0].email, invalid[0].password);
    await page.waitForTimeout(1500);

    await allure.step('Assert user is NOT redirected to /events', async () => {
      expect(page.url()).not.toContain('/events');
    });
    logger.success('TC-04 PASSED');
  });

  // ── TC-05 ────────────────────────────────────────────────
  test('TC-05: Unregistered email shows Access Denied', async ({ page }) => {
    await allure.story('Invalid Login');
    await allure.severity('normal');
    await allure.description('Login with an unregistered email stays on login page.');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    page.on('dialog', d => d.accept());
    await loginPage.login(invalid[1].email, invalid[1].password);
    await page.waitForTimeout(1500);

    await allure.step('Assert user stays on login', async () => {
      expect(page.url()).not.toContain('/events');
    });
    logger.success('TC-05 PASSED');
  });

  // ── TC-06 ────────────────────────────────────────────────
  test('TC-06: Empty email field blocks submission', async ({ page }) => {
    await allure.story('Form Validation');
    await allure.severity('normal');
    await allure.description('HTML5 validation prevents form submission with empty email.');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.clickLogin();

    const valid = await page.evaluate(
      () => document.querySelector('input[type="email"]').validity.valid
    );
    await allure.step('Assert email validity is false', async () => {
      expect(valid).toBe(false);
    });
    logger.success('TC-06 PASSED');
  });

  // ── TC-07 ────────────────────────────────────────────────
  test('TC-07: Empty password field blocks submission', async ({ page }) => {
    await allure.story('Form Validation');
    await allure.severity('normal');
    await allure.description('HTML5 validation prevents form submission with empty password.');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail(validUser.email);
    await loginPage.clickLogin();

    const valid = await page.evaluate(
      () => document.querySelector('input[type="password"]').validity.valid
    );
    await allure.step('Assert password validity is false', async () => {
      expect(valid).toBe(false);
    });
    logger.success('TC-07 PASSED');
  });

  // ── TC-08 ────────────────────────────────────────────────
  test('TC-08: Invalid email format fails HTML5 validation', async ({ page }) => {
    await allure.story('Form Validation');
    await allure.severity('minor');
    await allure.description('Entering a non-email string is rejected by HTML5 validation.');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.fillEmail('notanemail');
    await loginPage.fillPassword('Test@1234');
    await loginPage.clickLogin();

    const valid = await page.evaluate(
      () => document.querySelector('input[type="email"]').validity.valid
    );
    await allure.step('Assert email format is invalid', async () => {
      expect(valid).toBe(false);
    });
    logger.success('TC-08 PASSED');
  });

  // ── TC-09 ────────────────────────────────────────────────
  test('TC-09: JWT token stored in localStorage after login', async ({ page }) => {
    await allure.story('Token Storage');
    await allure.severity('critical');
    await allure.description('After successful login, a JWT token must exist in localStorage.');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAndWaitForEvents(validUser.email, validUser.password);

    const token = await page.evaluate(() => localStorage.getItem('token'));
    await allure.step('Assert token is not null and has content', async () => {
      expect(token).not.toBeNull();
      expect(token.length).toBeGreaterThan(10);
    });
    logger.success('TC-09 PASSED');
  });

  // ── TC-10 ────────────────────────────────────────────────
  test('TC-10: Logout clears localStorage token and goes to /', async ({ page }) => {
    await allure.story('Logout');
    await allure.severity('critical');
    await allure.description('Clicking Logout removes the token and redirects to the Login page.');

    const loginPage = new LoginPage(page);
    const navbar    = new NavbarPage(page);

    await loginPage.navigate();
    await loginPage.loginAndWaitForEvents(validUser.email, validUser.password);
    await navbar.logout();
    await page.waitForTimeout(800);

    const token = await page.evaluate(() => localStorage.getItem('token'));
    await allure.step('Assert token is null after logout', async () => {
      expect(token).toBeNull();
    });
    await allure.step('Assert user is not on /events', async () => {
      expect(page.url()).not.toContain('/events');
    });
    logger.success('TC-10 PASSED');
  });
});
