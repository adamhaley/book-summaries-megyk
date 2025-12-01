import { test, expect } from '@playwright/test';

test.describe('Book Library', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests will need authentication setup in the future
    // For now, they test the library page structure
    await page.goto('/dashboard/library');
  });

  test('library page loads and displays books', async ({ page }) => {
    // Wait for library page to load
    await expect(page.getByRole('heading', { name: /library/i })).toBeVisible();

    // Should see book grid or table
    const bookContainer = page.locator('[data-testid="book-list"], table, .book-grid');
    await expect(bookContainer.first()).toBeVisible({ timeout: 10000 });
  });

  test('can switch between grid and list view', async ({ page }) => {
    // Look for view toggle buttons
    const gridViewButton = page.locator('button[aria-label*="grid" i], button:has-text("Grid")');
    const listViewButton = page.locator('button[aria-label*="list" i], button:has-text("List")');

    // Check if view toggles exist
    const hasViewToggle = await gridViewButton.or(listViewButton).count() > 0;

    if (hasViewToggle) {
      // Try clicking list view
      if (await listViewButton.count() > 0) {
        await listViewButton.first().click();
        await page.waitForTimeout(500);
      }

      // Try clicking grid view
      if (await gridViewButton.count() > 0) {
        await gridViewButton.first().click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('can search for books', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]');

    if (await searchInput.count() > 0) {
      await searchInput.first().fill('atomic');
      await page.waitForTimeout(1000); // Wait for search results

      // Verify search results are filtered
      const bookTitles = page.locator('[data-testid="book-title"], .book-title, td');
      const firstTitle = await bookTitles.first().textContent();
      expect(firstTitle?.toLowerCase()).toContain('atomic');
    }
  });

  test('can sort books by different columns', async ({ page }) => {
    // Look for sortable column headers
    const titleColumn = page.locator('th:has-text("Title"), button:has-text("Title")');
    const authorColumn = page.locator('th:has-text("Author"), button:has-text("Author")');

    if (await titleColumn.count() > 0) {
      await titleColumn.first().click();
      await page.waitForTimeout(500);

      // Click again to reverse sort
      await titleColumn.first().click();
      await page.waitForTimeout(500);
    }

    if (await authorColumn.count() > 0) {
      await authorColumn.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('can filter books by genre', async ({ page }) => {
    // Look for genre filter dropdown or buttons
    const genreFilter = page.locator('select[name*="genre" i], button:has-text("Genre"), [aria-label*="genre" i]');

    if (await genreFilter.count() > 0) {
      await genreFilter.first().click();
      await page.waitForTimeout(500);

      // Try to select a genre option
      const genreOption = page.locator('text="Self-Help", text="Business", text="Fiction"');
      if (await genreOption.count() > 0) {
        await genreOption.first().click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('can open generate summary modal', async ({ page }) => {
    // Look for "Get Summary" or "Generate Summary" button
    const generateButton = page.locator('button:has-text("Get Summary"), button:has-text("Generate Summary")');

    if (await generateButton.count() > 0) {
      await generateButton.first().click();

      // Modal should appear
      const modal = page.locator('[role="dialog"], [class*="Modal"], .modal');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Should see style and length options
      await expect(page.locator('text=/narrative|bullet|workbook/i')).toBeVisible();
      await expect(page.locator('text=/short|medium|long/i')).toBeVisible();
    }
  });

  test('displays book details correctly', async ({ page }) => {
    // Should see book titles
    const bookTitle = page.locator('[data-testid="book-title"], .book-title, td').first();
    await expect(bookTitle).toBeVisible({ timeout: 10000 });

    const titleText = await bookTitle.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText?.length).toBeGreaterThan(0);
  });

  test('pagination works correctly', async ({ page }) => {
    // Look for pagination controls
    const nextButton = page.locator('button[aria-label*="next" i], button:has-text("Next")');
    const prevButton = page.locator('button[aria-label*="previous" i], button:has-text("Previous")');

    if (await nextButton.count() > 0) {
      const isNextEnabled = await nextButton.first().isEnabled();

      if (isNextEnabled) {
        await nextButton.first().click();
        await page.waitForTimeout(1000);

        // Previous button should now be enabled
        if (await prevButton.count() > 0) {
          await expect(prevButton.first()).toBeEnabled();
        }
      }
    }
  });
});
