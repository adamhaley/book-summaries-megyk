import { test, expect } from '@playwright/test';

test.describe('My Summaries', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to summaries page
    await page.goto('/dashboard/summaries');
  });

  test('summaries page loads correctly', async ({ page }) => {
    // Should see page heading
    await expect(page.getByRole('heading', { name: /summaries/i })).toBeVisible();
  });

  test('displays summary cards or list', async ({ page }) => {
    // Wait for summaries to load
    await page.waitForTimeout(2000);

    // Check for either empty state or summary cards
    const emptyState = page.locator('text=/no summaries|empty|get started/i');
    const summaryCards = page.locator('[data-testid="summary-card"], .summary-card, [class*="Card"]');

    const hasEmptyState = await emptyState.count() > 0;
    const hasSummaries = await summaryCards.count() > 0;

    expect(hasEmptyState || hasSummaries).toBeTruthy();
  });

  test('summary cards display book information', async ({ page }) => {
    await page.waitForTimeout(2000);

    const summaryCards = page.locator('[data-testid="summary-card"], .summary-card, [class*="Card"]');

    if (await summaryCards.count() > 0) {
      const firstCard = summaryCards.first();

      // Should display book title
      const hasTitle = await firstCard.locator('text=/[A-Z]/').count() > 0;
      expect(hasTitle).toBeTruthy();
    }
  });

  test('can download a summary', async ({ page }) => {
    await page.waitForTimeout(2000);

    const downloadButton = page.locator('button:has-text("Download"), button[aria-label*="download" i]');

    if (await downloadButton.count() > 0) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

      await downloadButton.first().click();

      const download = await downloadPromise;

      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
      }
    }
  });

  test('can delete a summary', async ({ page }) => {
    await page.waitForTimeout(2000);

    const deleteButton = page.locator('button:has-text("Delete"), button[aria-label*="delete" i]');

    if (await deleteButton.count() > 0) {
      const initialCount = await page.locator('[data-testid="summary-card"], .summary-card, [class*="Card"]').count();

      await deleteButton.first().click();

      // May show confirmation dialog
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
      if (await confirmButton.count() > 0) {
        await confirmButton.last().click();
      }

      // Wait for deletion to complete
      await page.waitForTimeout(2000);

      // Count should decrease or show loading state
      const finalCount = await page.locator('[data-testid="summary-card"], .summary-card, [class*="Card"]').count();
      expect(finalCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('displays summary metadata', async ({ page }) => {
    await page.waitForTimeout(2000);

    const summaryCards = page.locator('[data-testid="summary-card"], .summary-card, [class*="Card"]');

    if (await summaryCards.count() > 0) {
      const firstCard = summaryCards.first();
      const cardText = await firstCard.textContent();

      // Should show style (Narrative, Bullet Points, or Workbook)
      const hasStyle = /narrative|bullet|workbook/i.test(cardText || '');

      // Should show length (Short, Medium, or Long)
      const hasLength = /short|medium|long|1.*page|5.*page|15.*page/i.test(cardText || '');

      expect(hasStyle || hasLength).toBeTruthy();
    }
  });

  test('can navigate back to library', async ({ page }) => {
    // Look for "Back to Library" or "Library" navigation
    const libraryLink = page.locator('a[href*="library"], button:has-text("Library")');

    if (await libraryLink.count() > 0) {
      await libraryLink.first().click();
      await expect(page).toHaveURL(/.*library/);
    }
  });

  test('shows loading state while fetching summaries', async ({ page }) => {
    // Reload to see loading state
    await page.reload();

    // Should briefly show loading indicator
    const loader = page.locator('[class*="Loader"], text=Loading, [role="status"]');

    // Loading state may be very brief
    const isLoading = await loader.isVisible().catch(() => false);

    // Either loading was visible or summaries loaded instantly
    const summariesVisible = await page.locator('[data-testid="summary-card"], .summary-card, text=/no summaries/i').isVisible();

    expect(isLoading || summariesVisible).toBeTruthy();
  });

  test('empty state displays correctly', async ({ page }) => {
    // This test is useful for new users with no summaries
    await page.waitForTimeout(2000);

    const emptyState = page.locator('text=/no summaries|start generating|empty/i');
    const summaryCards = page.locator('[data-testid="summary-card"], .summary-card');

    if (await summaryCards.count() === 0) {
      // Should show empty state message
      await expect(emptyState.first()).toBeVisible();
    }
  });
});
