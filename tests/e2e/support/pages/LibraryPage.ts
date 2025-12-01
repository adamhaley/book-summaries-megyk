import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for Library Page (/dashboard/library)
 */
export class LibraryPage extends BasePage {
  // Selectors
  private readonly pageTitle = 'text=Discover Books';
  private readonly bookTable = 'table';
  private readonly bookCards = '[class*="mantine-Card"]';
  private readonly getSummaryButtons = 'button:has-text("Get Summary")';
  private readonly customizeButtons = 'button:has-text("Customize")';
  private readonly bookCovers = 'img[alt*="Cover of"]';
  private readonly sortHeaders = '[class*="sortableHeader"]';
  private readonly pagination = '[class*="mantine-Pagination"]';
  private readonly loadingIndicator = 'text=Loading books';
  private readonly noBooksMessage = 'text=No books available yet';
  private readonly generateSummaryModal = '[class*="mantine-Modal"]';

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/dashboard/library');
    await this.waitForLoadingToComplete();
  }

  async isPageLoaded() {
    return await this.page.locator(this.pageTitle).isVisible();
  }

  async getBookCount() {
    // Wait for either table or cards to load
    await this.page.waitForSelector(`${this.bookTable}, ${this.bookCards}`, { timeout: 10000 });

    const rows = await this.page.locator('table tbody tr').count();
    if (rows > 0) return rows;

    return await this.page.locator(this.bookCards).count();
  }

  async clickFirstGetSummaryButton() {
    await this.page.locator(this.getSummaryButtons).first().click();
  }

  async clickFirstCustomizeButton() {
    await this.page.locator(this.customizeButtons).first().click();
  }

  async clickBookCover(index: number = 0) {
    await this.page.locator(this.bookCovers).nth(index).click();
  }

  async sortByColumn(columnName: string) {
    await this.page.locator(`text=${columnName}`).click();
  }

  async goToPage(pageNumber: number) {
    await this.page.locator(`[class*="mantine-Pagination"] button:has-text("${pageNumber}")`).click();
  }

  async isGenerateSummaryModalVisible() {
    return await this.page.locator(this.generateSummaryModal).isVisible();
  }

  async getFirstBookTitle() {
    const titleLocator = this.page.locator('table td').filter({ hasText: /^.+$/ }).first();
    return await titleLocator.textContent();
  }

  async searchForBook(title: string) {
    // Assuming search functionality exists or will be added
    const searchInput = this.page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(title);
    }
  }

  async isNoBooksMessageVisible() {
    return await this.page.locator(this.noBooksMessage).isVisible();
  }
}
