

const BasePage = require('./BasePage');
const logger   = require('../utils/logger');

class EventsPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle   = page.locator('.form-title');
    this.eventCards  = page.locator('.event-card');
    this.bookBtns    = page.locator('.btn-secure');
    this.eventTitles = page.locator('.event-title');
  }

  async navigate() {
    await this.allureStep('Navigate → Events page (/events)', async () => {
      await this.page.goto('/events');
    });
  }

  async waitForCards() {
    await this.page.locator('.event-card').first()
                   .waitFor({ state: 'visible', timeout: 10_000 });
    await this.takeScreenshot('events_cards_loaded');
  }

  async bookFirst() {
    await this.allureStep('Book first available event', async () => {
      this.page.once('dialog', d => d.accept());
      await this.bookBtns.first().click();
      await this.page.waitForTimeout(1200);
    });
  }

  async getEventCount()  { return this.eventCards.count(); }
  async getEventTitles() { return this.eventTitles.allInnerTexts(); }
  async getTitle()       { return this.pageTitle.innerText(); }

  async getSlotText(index = 0) {
    return this.eventCards.nth(index).locator('p').last().innerText();
  }
}

module.exports = EventsPage;
