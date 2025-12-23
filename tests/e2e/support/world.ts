import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';

/**
 * Custom World class that extends Cucumber's World with Playwright instances
 */
export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page!: Page; // Non-null assertion since it's set in Before hook

  // Test state properties
  authenticatedUser?: string;
  hasDefaultSummary?: boolean;
  hasSummaries?: boolean;
  expectedBookCount?: number;
  userPreferences?: {
    style: string;
    length: string;
  };
  previousSummaries?: string[];
  generationStartTime?: number;
  intent?: string;
  skipPagination?: boolean;
  skipSummaryActions?: boolean;
  skipEmptyState?: boolean;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init() {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(CustomWorld);
