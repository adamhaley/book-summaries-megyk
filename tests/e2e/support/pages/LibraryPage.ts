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
  private readonly generateSummaryModal = '[role="dialog"]';

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
    const tableRows = this.page.locator('table tbody tr');
    const cards = this.page.locator(this.bookCards);
    const emptyState = this.page.locator(this.noBooksMessage);

    await Promise.race([
      tableRows.first().waitFor({ state: 'visible', timeout: 15000 }),
      cards.first().waitFor({ state: 'visible', timeout: 15000 }),
      emptyState.first().waitFor({ state: 'visible', timeout: 15000 }),
    ]).catch(() => undefined);

    const emptyStateVisible = await emptyState.isVisible().catch(() => false);
    if (emptyStateVisible) return 0;

    const rows = await tableRows.count();
    if (rows > 0) return rows;

    return await cards.count();
  }

  async clickFirstGetSummaryButton() {
    const button = this.page.getByRole('button', { name: 'Get Summary' }).first();
    if ((await button.count()) === 0) return false;
    await button.click();
    return true;
  }

  async clickFirstCustomizeButton() {
    const button = this.page.getByRole('button', { name: 'Customize' }).first();
    if ((await button.count()) === 0) return false;
    await button.click();
    return true;
  }

  async clickBookCover(index: number = 0) {
    const cover = this.page.locator(this.bookCovers).nth(index);
    if ((await cover.count()) === 0) return false;
    await cover.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
    try {
      await cover.click({ timeout: 5000 });
    } catch (error) {
      return false;
    }
    return true;
  }

  async sortByColumn(columnName: string) {
    const headerButton = this.page.locator('table thead button').filter({ hasText: columnName }).first();
    if ((await headerButton.count()) > 0) {
      await headerButton.click();
      return;
    }

    await this.page.getByRole('button', { name: columnName }).first().click();
  }

  async goToPage(pageNumber: number) {
    const button = this.page
      .locator(`[class*="mantine-Pagination"] button:has-text("${pageNumber}")`)
      .first();
    if ((await button.count()) === 0) return false;
    try {
      await button.click({ timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async isGenerateSummaryModalVisible() {
    return await this.page.locator(this.generateSummaryModal).first().isVisible();
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
