
async function waitForVisible(page, locator, timeout = 10_000) {
  await page.locator(locator).waitFor({ state: 'visible', timeout });
}

async function waitForURL(page, urlPart, timeout = 10_000) {
  await page.waitForURL(`**${urlPart}**`, { timeout });
}

async function waitForText(page, locator, text, timeout = 10_000) {
  await page.locator(locator).filter({ hasText: text })
            .waitFor({ state: 'visible', timeout });
}

async function waitForNetworkIdle(page, timeout = 15_000) {
  await page.waitForLoadState('networkidle', { timeout });
}

module.exports = { waitForVisible, waitForURL, waitForText, waitForNetworkIdle };
