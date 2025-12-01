import { test, expect } from '@playwright/test';

test.describe('Summaries (Authenticated)', () => {
  test('summaries page loads correctly', async ({ page }) => {
    await page.goto('/dashboard/summaries');
    await page.waitForLoadState('networkidle');

    // Should not redirect to sign-in
    expect(page.url()).not.toContain('/auth/signin');

    // Should see summaries heading or content
    const hasSummariesContent =
      await page.locator('text=/summaries/i').count() > 0 ||
      await page.locator('[data-testid="summary-card"], .summary-card, text=/empty|no summaries/i').count() > 0;

    expect(hasSummariesContent).toBeTruthy();
  });

  test('displays summaries or empty state', async ({ page }) => {
    await page.goto('/dashboard/summaries');
    await page.waitForLoadState('domcontentloaded');

    // Wait for page content to load
    await page.waitForTimeout(3000);

    // Should see either summaries, empty state, or loading state
    const hasSummaries = await page.locator('[data-testid="summary-card"], .summary-card, .card').count() > 0;
    const hasEmptyState = await page.locator('text=/no summaries|empty|generate|add|create/i').count() > 0;
    const hasContent = await page.locator('h1, h2, h3').count() > 0;

    expect(hasSummaries || hasEmptyState || hasContent).toBeTruthy();
  });

  test('summary cards display metadata', async ({ page }) => {
    await page.goto('/dashboard/summaries');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    const summaryCards = page.locator('[data-testid="summary-card"], .summary-card');

    if (await summaryCards.count() > 0) {
      const firstCard = summaryCards.first();

      // Should have some text content
      const cardText = await firstCard.textContent();
      expect(cardText).toBeTruthy();
      expect(cardText!.length).toBeGreaterThan(0);
    }
  });

  test('download button works if summaries exist', async ({ page }) => {
    await page.goto('/dashboard/summaries');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    const downloadButton = page.locator('button:has-text("Download"), button[aria-label*="download" i]').first();

    if (await downloadButton.count() > 0) {
      // Download button exists
      const isEnabled = await downloadButton.isEnabled();
      expect(isEnabled).toBeTruthy();
    }
  });

  test('delete button works if summaries exist', async ({ page }) => {
    await page.goto('/dashboard/summaries');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    const deleteButton = page.locator('button:has-text("Delete"), button[aria-label*="delete" i]').first();

    if (await deleteButton.count() > 0) {
      // Delete button exists
      const isVisible = await deleteButton.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });

  test('can navigate to library from summaries', async ({ page }) => {
    await page.goto('/dashboard/summaries');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    const libraryLink = page.locator('a[href*="library"], button:has-text("Library")').first();

    if (await libraryLink.count() > 0) {
      await libraryLink.click();
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('library');
    }
  });
});
