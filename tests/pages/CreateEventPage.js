

const BasePage = require('./BasePage');
const logger = require('../utils/logger');

class CreateEventPage extends BasePage {
  constructor(page) {
    super(page);
    this.titleInput = page.locator('input[placeholder="Event Name"]');
    this.descInput = page.locator('textarea[placeholder="Brief Description"]');
    this.venueSelect = page.locator('select');
    this.dateInput = page.locator('input[type="date"]');
    this.publishBtn = page.locator('button:has-text("Publish Event")');
    this.formTitle = page.locator('.form-title');
    this.capacitySpan = page.locator('span').filter({ hasText: /\d+ Seats|\d$/ }).last();
  }

  async navigate() {
    await this.allureStep('Navigate → Create Event', async () => {
      await this.page.goto('http://localhost:5173/create-event');
    });
  }

  async fillForm(title, description, venueLabel, date) {
    await this.allureStep(`Fill Create Event form: "${title}"`, async () => {
      await this.titleInput.fill(title);
      await this.descInput.fill(description);
      await this.venueSelect.selectOption({ label: venueLabel });
      await this.dateInput.fill(date);
    });
  }

  async publish() {
    await this.allureStep('Publish Event', async () => {
      this.page.once('dialog', async d => {
        logger.success(`Alert accepted: ${d.message()}`);
        await d.accept();
      });
      await this.publishBtn.click();
      await this.page.waitForTimeout(1500);
    });
  }

  async getTitle() { return this.formTitle.innerText(); }
}

module.exports = CreateEventPage;
