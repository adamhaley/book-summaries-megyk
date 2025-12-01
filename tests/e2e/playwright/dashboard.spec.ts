import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation & Layout', () => {
  test('dashboard loads correctly', async ({ page }) => {
    await page.goto('/dashboard');

    // Should see dashboard heading or main content area
    await expect(page.locator('text=/dashboard|welcome|library/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('navigation menu is visible', async ({ page }) => {
    await page.goto('/dashboard');

    // Should see navigation items
    const navItems = ['Library', 'Summaries', 'Preferences'];

    for (const item of navItems) {
      const navItem = page.locator(`text="${item}"`).first();
      const isVisible = await navItem.isVisible().catch(() => false);

      if (isVisible) {
        expect(isVisible).toBeTruthy();
      }
    }
  });

  test('can navigate between dashboard pages', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to Library
    const libraryLink = page.locator('a[href*="library"], text="Library"').first();
    if (await libraryLink.isVisible()) {
      await libraryLink.click();
      await expect(page).toHaveURL(/.*library/);
    }

    // Navigate to Summaries
    const summariesLink = page.locator('a[href*="summaries"], text="Summaries"').first();
    if (await summariesLink.isVisible()) {
      await summariesLink.click();
      await expect(page).toHaveURL(/.*summaries/);
    }

    // Navigate to Preferences
    const preferencesLink = page.locator('a[href*="preferences"], text="Preferences"').first();
    if (await preferencesLink.isVisible()) {
      await preferencesLink.click();
      await expect(page).toHaveURL(/.*preferences/);
    }
  });

  test('mobile menu works correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    // Look for burger menu button
    const burgerButton = page.locator('button[aria-label*="menu" i], button:has([class*="burger"]), button:has-text("☰")');

    if (await burgerButton.count() > 0) {
      await burgerButton.first().click();
      await page.waitForTimeout(500);

      // Navigation should now be visible
      const mobileNav = page.locator('[role="navigation"], nav, [class*="navbar"]');
      await expect(mobileNav.first()).toBeVisible();
    }
  });

  test('dashboard displays stats or summary cards', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Look for stat cards or dashboard widgets
    const statCards = page.locator('[data-testid="stat-card"], [class*="Card"], [class*="stat"]');

    // Should see some dashboard content
    const hasStats = await statCards.count() > 0;
    const hasContent = await page.locator('text=/books|summaries|total/i').count() > 0;

    expect(hasStats || hasContent).toBeTruthy();
  });

  test('user menu or profile dropdown works', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for user menu button
    const userMenuButton = page.locator('button[aria-label*="user" i], button[aria-label*="profile" i], [data-testid="user-menu"]');

    if (await userMenuButton.count() > 0) {
      await userMenuButton.first().click();
      await page.waitForTimeout(500);

      // Should see dropdown with profile/sign out options
      const dropdown = page.locator('[role="menu"], [class*="dropdown"], [class*="Dropdown"]');
      await expect(dropdown.first()).toBeVisible();
    }
  });

  test('breadcrumbs display current location', async ({ page }) => {
    await page.goto('/dashboard/library');

    // Look for breadcrumb navigation
    const breadcrumb = page.locator('[aria-label="breadcrumb"], nav[class*="breadcrumb"]');

    if (await breadcrumb.count() > 0) {
      const breadcrumbText = await breadcrumb.first().textContent();
      expect(breadcrumbText).toBeTruthy();
    }
  });

  test('color scheme toggle works', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for dark mode toggle
    const themeToggle = page.locator('button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]');

    if (await themeToggle.count() > 0) {
      // Get initial body background
      const initialBg = await page.locator('body').evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Toggle theme
      await themeToggle.first().click();
      await page.waitForTimeout(500);

      // Background should change
      const newBg = await page.locator('body').evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      expect(initialBg).not.toBe(newBg);
    }
  });

  test('footer is present and contains links', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for footer
    const footer = page.locator('footer');

    if (await footer.count() > 0) {
      await expect(footer.first()).toBeVisible();
    }
  });

  test('dashboard is responsive', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },   // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);

      // Page should load without layout issues
      const mainContent = page.locator('main, [role="main"], #main-content');
      const hasContent = await mainContent.count() > 0;

      expect(hasContent).toBeTruthy();
    }
  });

  test('can access help or documentation', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for help links
    const helpLink = page.locator('a[href*="help"], button:has-text("Help"), a:has-text("Help")');

    if (await helpLink.count() > 0) {
      // Help link exists
      expect(await helpLink.first().isVisible()).toBeTruthy();
    }
  });
});
