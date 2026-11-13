const BasePage = require('./BasePage');

class ManagerPage extends BasePage {
  constructor(page) {
    super(page);

    this.pageTitle = page.locator('.form-title');
    this.statNumbers = page.locator('.stat-number');
    this.statCards = page.locator('.stat-card');
    this.eventCards = page.locator('.event-card');
    this.eventTitles = page.locator('.event-title');
  }

  async navigate() {
    await this.allureStep('Navigate → Manager Dashboard', async () => {
      await this.page.goto('http://localhost:5173/manager-stats');
    });
  }

async waitForLoad() {
  await this.pageTitle.waitFor({
    state: 'visible',
    timeout: 15000
  });

  await this.page.waitForTimeout(2000);

  await this.takeScreenshot('manager_dashboard_loaded');
}

  async getTitle() {
    return await this.pageTitle.innerText();
  }

  async getManagedCount() {
    const text = await this.statNumbers.first().innerText();
    return parseInt(text, 10);
  }

  async getTotalSold() {
    const text = await this.statNumbers.last().innerText();
    return parseInt(text, 10);
  }

  async getEventCardCount() {
    return await this.eventCards.count();
  }

  async getEventTitles() {
    return await this.eventTitles.allInnerTexts();
  }
}

module.exports = ManagerPage;