
const { test, expect } = require('../fixtures/hooks');
const { allure } = require('allure-playwright');
const SignupPage = require('../pages/SignupPage');
const LoginPage = require('../pages/LoginPage');
const { parseJSON } = require('../utils/dataParser');
const { screenshotOnFailure } = require('../utils/screenshotHelper');
const logger = require('../utils/logger');

// ── Test Data ─────────────────────────────────────────────
const signupData = parseJSON('signupData.json');
const valid = signupData.validSignups;
const invalid = signupData.invalidSignups;

// ─────────────────────────────────────────────────────────
test.describe('📝 Signup Tests', () => {

  test.beforeEach(async ({ }, testInfo) => {
    logger.info(`---- START: ${testInfo.title} ----`);
    await allure.suite('Signup');
    await allure.feature('Registration');
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'failed') {
      await screenshotOnFailure(testInfo.title.replace(/\s+/g, '_'));
    }
    logger.info(`---- END: ${testInfo.title} [${testInfo.status.toUpperCase()}] ----`);
  });

  // ── TC-11 ────────────────────────────────────────────────
  test('TC-11: Signup page title shows SIGNUP', async ({ page }) => {
    await allure.story('Page Render');
    await allure.severity('normal');
    await allure.description('Verifies the Signup page loads with the correct form title.');

    const signupPage = new SignupPage(page);
    await signupPage.navigate();

    const title = await signupPage.getTitle();
    await allure.step('Assert title contains SIGNUP', async () => {
      expect(title).toContain('SIGNUP');
    });
    logger.success('TC-11 PASSED');
  });

  // ── TC-12 ────────────────────────────────────────────────
  test('TC-12: Successful signup redirects correctly', async ({ page }) => {
    await allure.story('Valid Signup');
    await allure.severity('critical');
    await allure.description('A new unique user signs up and is redirected to the Login page.');

    await allure.step('Navigate to /register', async () => {
      await page.goto('/register');
    });

    const uniqueEmail = `testuser_${Date.now()}@eventbase.com`;
    await allure.step(`Fill signup form [${uniqueEmail}]`, async () => {
      await page.locator('input[placeholder="FULL NAME"]').fill('M Arbaaz Hussain');
      await page.locator('input[placeholder="AGENT EMAIL"]').fill(uniqueEmail);
      await page.locator('input[placeholder="PASSWORD"]').fill('password123');
    });

    page.once('dialog', async dialog => { await dialog.accept(); });

    await allure.step('Click Initialize Access', async () => {
      await page.locator('button:has-text("Initialize Access")').click();
    });

    await page.waitForLoadState('networkidle');
    await page.waitForURL('**/');

    await allure.step('Assert redirected to Login (/)', async () => {
      expect(page.url()).toMatch(/\/$/);
    });
    logger.success('TC-12 PASSED');
  });

  // ── TC-13 ────────────────────────────────────────────────
  test('TC-13: Empty name blocks signup', async ({ page }) => {
    await allure.story('Form Validation');
    await allure.severity('normal');
    await allure.description('Submitting signup without a name is blocked by HTML5 validation.');

    const signupPage = new SignupPage(page);
    await signupPage.navigate();
    await signupPage.signupBtn.click();

    const valid = await page.evaluate(
      () => document.querySelector('input[placeholder="FULL NAME"]').validity.valid
    );
    await allure.step('Assert name field is invalid', async () => {
      expect(valid).toBe(false);
    });
    logger.success('TC-13 PASSED');
  });

  // ── TC-14 ────────────────────────────────────────────────
  test('TC-14: Empty email blocks signup', async ({ page }) => {
    await allure.story('Form Validation');
    await allure.severity('normal');
    await allure.description('Submitting signup without an email is blocked by HTML5 validation.');

    const signupPage = new SignupPage(page);
    await signupPage.navigate();
    await signupPage.fillName('Test Name');
    await signupPage.signupBtn.click();

    const v = await page.evaluate(
      () => document.querySelector('input[type="email"]').validity.valid
    );
    await allure.step('Assert email field is invalid', async () => {
      expect(v).toBe(false);
    });
    logger.success('TC-14 PASSED');
  });

  // ── TC-15 ────────────────────────────────────────────────
  test('TC-15: Invalid email format blocked', async ({ page }) => {
    await allure.story('Form Validation');
    await allure.severity('minor');
    await allure.description('An improperly formatted email fails HTML5 email validation.');

    const signupPage = new SignupPage(page);
    await signupPage.navigate();
    await signupPage.fillName('Test Name');
    await signupPage.fillEmail('bademail');
    await signupPage.fillPassword('Pass@1234');
    await signupPage.signupBtn.click();

    const v = await page.evaluate(
      () => document.querySelector('input[type="email"]').validity.valid
    );
    await allure.step('Assert email format is invalid', async () => {
      expect(v).toBe(false);
    });
    logger.success('TC-15 PASSED');
  });

  // ── TC-16 ────────────────────────────────────────────────
  test('TC-16: Link to Login page works from Signup', async ({ page }) => {
    await allure.story('Navigation');
    await allure.severity('normal');
    await allure.description('Clicking "Already Registered" on Signup goes to the Login page.');

    const signupPage = new SignupPage(page);
    await signupPage.navigate();
    await signupPage.clickLoginLink();
    await page.waitForTimeout(500);

    await allure.step('Assert URL is login root (/)', async () => {
      expect(page.url()).toMatch(/\/$/);
    });
    logger.success('TC-16 PASSED');
  });

  // ── TC-17 ────────────────────────────────────────────────
  test('TC-17: Link to Signup page works from Login', async ({ page }) => {
    await allure.story('Navigation');
    await allure.severity('normal');
    await allure.description('Clicking "Request Access" on Login goes to /register.');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.clickSignupLink();
    await page.waitForURL('**/register');

    await allure.step('Assert URL contains /register', async () => {
      expect(page.url()).toContain('/register');
    });
    logger.success('TC-17 PASSED');
  });
});
