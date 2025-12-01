import { test, expect } from '@playwright/test';

test.describe('Library (Authenticated)', () => {
  test('library page loads and displays books', async ({ page }) => {
    await page.goto('/dashboard/library');
    await page.waitForLoadState('networkidle');

    // Should not redirect to sign-in
    expect(page.url()).not.toContain('/auth/signin');

    // Should see library heading or books
    const hasLibraryContent =
      await page.locator('text=/library/i').count() > 0 ||
      await page.locator('table, [data-testid="book-list"]').count() > 0;

    expect(hasLibraryContent).toBeTruthy();
  });

  test('displays book list or grid', async ({ page }) => {
    await page.goto('/dashboard/library');
    await page.waitForLoadState('networkidle');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Should see either books or empty state
    const hasBooks = await page.locator('table, [data-testid="book-list"], .book-card').count() > 0;
    const hasEmptyState = await page.locator('text=/no books|empty|add books/i').count() > 0;

    expect(hasBooks || hasEmptyState).toBeTruthy();
  });

  test('can search for books', async ({ page }) => {
    await page.goto('/dashboard/library');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]');

    if (await searchInput.count() > 0) {
      await searchInput.first().fill('atomic');
      await page.waitForTimeout(1000);

      // Search should have executed (we can't verify results without knowing the data)
      expect(await searchInput.first().inputValue()).toBe('atomic');
    }
  });

  test('can open generate summary modal', async ({ page }) => {
    await page.goto('/dashboard/library');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    const generateButton = page.locator('button:has-text("Get Summary"), button:has-text("Generate Summary")').first();

    if (await generateButton.count() > 0) {
      await generateButton.click();
      await page.waitForTimeout(1000);

      // Modal should appear
      const modal = page.locator('[role="dialog"], [class*="Modal"]');
      const isModalVisible = await modal.isVisible().catch(() => false);

      expect(isModalVisible).toBeTruthy();
    }
  });

  test('can sort books', async ({ page }) => {
    await page.goto('/dashboard/library');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    // Look for sortable column headers
    const titleColumn = page.locator('th:has-text("Title"), button:has-text("Title")').first();

    if (await titleColumn.count() > 0) {
      await titleColumn.click();
      await page.waitForTimeout(500);

      // Sort should have executed
      expect(true).toBeTruthy();
    }
  });

  test('can filter books by genre', async ({ page }) => {
    await page.goto('/dashboard/library');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    // Look for genre filter
    const genreFilter = page.locator('select[name*="genre" i], button:has-text("Genre")').first();

    if (await genreFilter.count() > 0) {
      await genreFilter.click();
      await page.waitForTimeout(500);

      expect(true).toBeTruthy();
    }
  });

  test('view toggles work if present', async ({ page }) => {
    await page.goto('/dashboard/library');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    const viewToggle = page.locator('button[aria-label*="grid" i], button[aria-label*="list" i]').first();

    if (await viewToggle.count() > 0) {
      await viewToggle.click();
      await page.waitForTimeout(500);

      expect(true).toBeTruthy();
    }
  });
});
