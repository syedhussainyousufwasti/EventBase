
const BasePage = require('./BasePage');
const logger = require('../utils/logger');

class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginBtn = page.locator('button:has-text("Enter System")');
    this.signupLink = page.locator('button:has-text("Request Access")');
    this.formTitle = page.locator('.form-title');
  }

  // ── Actions ───────────────────────────────────────────────

  async navigate() {
    await this.allureStep('Navigate → Login page', async () => {
      await this.page.goto('http://localhost:5173/');
    });
  }

  async fillEmail(email) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password) {
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    await this.loginBtn.click();
  }

  async login(email, password) {
    await this.allureStep(`Fill login credentials [${email}]`, async () => {
      await this.fillEmail(email);
      await this.fillPassword(password);
      await this.clickLogin();
    });
  }

  async loginAndWaitForEvents(email, password) {
    await this.login(email, password);
    await this.page.waitForURL('**/events', { timeout: 10_000 });
    logger.success(`✅ Logged in successfully → /events`);
    await this.takeScreenshot('after_login_events_page');
  }

  async clickSignupLink() {
    await this.signupLink.click();
  }

  // ── Getters ───────────────────────────────────────────────

  async getTitle() { return this.formTitle.innerText(); }
  async isLoginBtnVisible() { return this.loginBtn.isVisible(); }
}

module.exports = LoginPage;
