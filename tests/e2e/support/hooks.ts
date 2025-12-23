import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, BrowserContext, Page } from '@playwright/test';
import { CustomWorld } from './world';

// Set default timeout to 30 seconds
setDefaultTimeout(30000);

// Global browser instance
let browser: Browser;
const browserName = process.env.E2E_BROWSER || 'chromium';
const browserType =
  browserName === 'firefox' ? firefox : browserName === 'webkit' ? webkit : chromium;

BeforeAll(async function () {
  // Launch browser once for all tests
  browser = await browserType.launch({
    headless: process.env.HEADLESS !== 'false',
  });
});

AfterAll(async function () {
  // Close browser after all tests
  if (browser) {
    await browser.close();
  }
});

Before(async function (this: CustomWorld) {
  // Create new context and page for each scenario
  this.context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    baseURL: process.env.BASE_URL || 'http://localhost:3002',
  });
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld) {
  // Clean up after each scenario
  if (this.page) {
    await this.page.close();
  }
  if (this.context) {
    await this.context.close();
  }
});
