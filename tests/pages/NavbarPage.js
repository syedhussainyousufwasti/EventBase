
const BasePage = require('./BasePage');
const logger   = require('../utils/logger');

class NavbarPage extends BasePage {
  constructor(page) {
    super(page);
    this.logo         = page.locator('.nav-logo');
    this.eventsLink   = page.locator('.nav-item:has-text("Events")');
    this.createLink   = page.locator('.nav-item:has-text("Create Event")');
    this.ticketsLink  = page.locator('.nav-item:has-text("My Tickets")');
    this.statsLink    = page.locator('.nav-item:has-text("Stats")');
    this.logoutBtn    = page.locator('.logout-btn');
    this.loginLink    = page.locator('.nav-item:has-text("Login")');
    this.registerLink = page.locator('.nav-item:has-text("Register")');
  }

  async logout() {
    await this.allureStep('Navbar → Click Logout', async () => {
      await this.logoutBtn.click();
    });
  }

  async goToEvents()      { await this.eventsLink.click(); }
  async goToCreateEvent() { await this.createLink.click(); }
  async goToMyTickets()   { await this.ticketsLink.click(); }
  async goToStats()       { await this.statsLink.click(); }
  async clickLogo()       { await this.logo.click(); }

  async isLoggedIn()  { return this.logoutBtn.isVisible(); }
  async isLoggedOut() { return this.loginLink.isVisible(); }
}

module.exports = NavbarPage;
