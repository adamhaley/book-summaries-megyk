import { test, expect } from '@playwright/test';

test.describe('Dashboard (Authenticated)', () => {
  test('dashboard loads and displays content', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Wait for navigation to be visible (React Native uses testID instead of semantic nav element)
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 10000 });

    // Should not redirect to sign-in
    expect(page.url()).not.toContain('/auth/signin');

    // Should see dashboard content
    const hasDashboardContent =
      await page.locator('text=/dashboard|library|summaries|preferences/i').count() > 0;

    expect(hasDashboardContent).toBeTruthy();
  });

  test('navigation menu is accessible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Wait for navigation links using testID selectors
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 10000 });

    // Should see navigation links
    const libraryLink = page.locator('[data-testid="nav-link-library"]');
    const summariesLink = page.locator('[data-testid="nav-link-my-summaries"]');

    expect(await libraryLink.count()).toBeGreaterThan(0);
    expect(await summariesLink.count()).toBeGreaterThan(0);
  });

  test('can navigate to library', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    await page.waitForSelector('[data-testid="nav-link-library"]', { timeout: 10000 });

    const libraryLink = page.locator('[data-testid="nav-link-library"]').first();

    if (await libraryLink.count() > 0) {
      await libraryLink.click();
      await page.waitForLoadState('domcontentloaded');

      // Wait for URL to change
      await page.waitForURL('**/library**', { timeout: 10000 });

      // Should be on library page
      expect(page.url()).toContain('library');
    }
  });

  test('can navigate to summaries', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    await page.waitForSelector('[data-testid="nav-link-my-summaries"]', { timeout: 10000 });

    const summariesLink = page.locator('[data-testid="nav-link-my-summaries"]').first();

    if (await summariesLink.count() > 0) {
      await summariesLink.click();
      await page.waitForLoadState('domcontentloaded');

      // Wait for URL to change
      await page.waitForURL('**/summaries**', { timeout: 10000 });

      // Should be on summaries page
      expect(page.url()).toContain('summaries');
    }
  });

  test('can navigate to preferences', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    await page.waitForSelector('[data-testid="nav-link-preferences"]', { timeout: 10000 });

    const preferencesLink = page.locator('[data-testid="nav-link-preferences"]').first();

    if (await preferencesLink.count() > 0) {
      await preferencesLink.click();
      await page.waitForLoadState('domcontentloaded');

      // Wait for URL to change
      await page.waitForURL('**/preferences**', { timeout: 10000 });

      // Should be on preferences page
      expect(page.url()).toContain('preferences');
    }
  });
});
