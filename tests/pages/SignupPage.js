const BasePage = require('./BasePage');
const logger   = require('../utils/logger');

class SignupPage extends BasePage {
  constructor(page) {
    super(page);

    this.nameInput     = page.locator('input[placeholder="FULL NAME"]');
    this.emailInput    = page.locator('input[placeholder="AGENT EMAIL"]');
    this.passwordInput = page.locator('input[type="password"]');

    this.signupBtn     = page.locator('button:has-text("Initialize Access")');
    this.loginLink     = page.locator('button:has-text("Already Registered")');
    this.formTitle     = page.locator('.form-title');
  }

  async navigate() {
    await this.page.goto('/register');
  }

  async fillName(name) {
    await this.nameInput.fill(name);
  }

  async fillEmail(email) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password) {
    await this.passwordInput.fill(password);
  }

  async signup(name, email, password) {
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.signupBtn.click();
  }

  async getTitle() {
    return await this.formTitle.innerText();
  }

  async clickLoginLink() {
    await this.loginLink.click();
  }
}

module.exports = SignupPage;