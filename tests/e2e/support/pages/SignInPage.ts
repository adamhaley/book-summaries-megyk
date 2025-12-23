import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for Sign In Page (/auth/signin)
 */
export class SignInPage extends BasePage {
  // Selectors
  private readonly emailInput = 'input[type="email"]';
  private readonly passwordInput = 'input[type="password"]';
  private readonly submitButton = 'button[type="submit"]';
  private readonly signUpLink = 'a[href="/auth/signup"]';
  private readonly errorAlert = '[role="alert"]';
  private readonly errorMessage = '[role="alert"] [id$="-body"]';
  private readonly pageTitle = 'text=Sign In';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/auth/signin');
    await this.waitForLoadingToComplete();
  }

  async fillEmail(email: string) {
    await this.page.fill(this.emailInput, email);
  }

  async fillPassword(password: string) {
    await this.page.fill(this.passwordInput, password);
  }

  async clickSubmit() {
    await this.page.click(this.submitButton);
  }

  async signIn(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  async clickSignUpLink() {
    await this.page.click(this.signUpLink);
  }

  async getErrorMessage() {
    const message = await this.page.locator(this.errorMessage).first().textContent();
    if (message) return message;
    return await this.page.locator(this.errorAlert).first().textContent();
  }

  async isErrorVisible() {
    return await this.page.locator(this.errorAlert).first().isVisible();
  }

  async waitForRedirect() {
    await this.page.waitForURL('**/dashboard**', { timeout: 10000 });
  }
}
