
const BasePage = require('./BasePage');
const logger   = require('../utils/logger');

class UserDashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle    = page.locator('.form-title');
    this.bookingCards = page.locator('.event-card');
    this.emptyMsg     = page.locator('p:has-text("No active bookings")');
    this.verifiedBadge= page.locator('div:has-text("VERIFIED")');
  }

  async navigate() {
    await this.allureStep('Navigate → My Tickets (/my-bookings)', async () => {
      await this.page.goto('/my-bookings');
    });
  }

  async waitForLoad() {
    await this.pageTitle.waitFor({ state: 'visible', timeout: 10_000 });
    await this.takeScreenshot('my_tickets_page_loaded');
  }

  async getTitle()        { return this.pageTitle.innerText(); }
  async getBookingCount() { return this.bookingCards.count(); }
  async hasNoBookings()   { return this.emptyMsg.isVisible(); }
  async verifiedVisible() { return this.verifiedBadge.first().isVisible(); }
}

module.exports = UserDashboardPage;
