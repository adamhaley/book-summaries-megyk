import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for Home Page (/)
 */
export class HomePage extends BasePage {
  // Selectors
  private readonly getStartedButton = 'button:has-text("Get Started")';
  private readonly signInButton = 'button:has-text("Sign In")';
  private readonly heroTitle = 'h1:has-text("Book Summaries")';
  private readonly heroDescription = 'text=Discover personalized AI-generated book summaries';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/');
    await this.waitForLoadingToComplete();
  }

  async isLandingPageVisible() {
    return await this.page.locator(this.heroTitle).isVisible();
  }

  async clickGetStarted() {
    await this.page.click(this.getStartedButton);
  }

  async clickSignIn() {
    await this.page.click(this.signInButton);
  }

  async getHeroTitle() {
    return await this.page.locator(this.heroTitle).textContent();
  }

  async getHeroDescription() {
    return await this.page.locator(this.heroDescription).textContent();
  }
}
