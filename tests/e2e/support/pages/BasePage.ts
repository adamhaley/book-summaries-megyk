import { Page } from '@playwright/test';

/**
 * Base Page Object that all page classes extend
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async waitForLoadingToComplete() {
    // Wait for any loaders to disappear
    await this.page.waitForSelector('text=Loading', { state: 'hidden', timeout: 30000 }).catch(() => {
      // Ignore if no loading state
    });
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async getCurrentUrl() {
    return this.page.url();
  }
}
