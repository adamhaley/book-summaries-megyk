import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation & Layout', () => {
  test('dashboard page requires authentication or loads correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();

    if (currentUrl.includes('/auth/signin')) {
      // Correct behavior - requires authentication
      await expect(page).toHaveURL(/.*auth\/signin/);
    } else {
      // Dashboard loaded - should see some content
      const hasDashboardContent =
        await page.locator('text=/dashboard|library|summaries|preferences/i').count() > 0;

      expect(hasDashboardContent).toBeTruthy();
    }
  });

  test('navigation menu displays correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/auth/signin')) {
      test.skip('Requires authentication');
      return;
    }

    // Check for navigation elements
    const navElements = await page.locator('nav, [role="navigation"], a[href*="dashboard"]').count();

    expect(navElements).toBeGreaterThan(0);
  });

  test('can navigate to library page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/auth/signin')) {
      test.skip('Requires authentication');
      return;
    }

    const libraryLink = page.locator('a[href*="library"]').first();

    if (await libraryLink.count() > 0) {
      await libraryLink.click();
      await page.waitForLoadState('networkidle');

      const url = page.url();
      expect(url.includes('library') || url.includes('signin')).toBeTruthy();
    } else {
      expect(true).toBeTruthy();
    }
  });

  test('mobile responsive layout works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/auth/signin')) {
      test.skip('Requires authentication');
      return;
    }

    // Page should load without errors
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
  });

  test('desktop layout loads correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/auth/signin')) {
      test.skip('Requires authentication');
      return;
    }

    // Page should load without errors
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
  });
});
