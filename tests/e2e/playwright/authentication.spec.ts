import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('unauthenticated user sees landing page', async ({ page }) => {
    await page.goto('/');

    // Should see landing page with specific heading
    await expect(page.getByRole('heading', { name: 'Book Summaries' })).toBeVisible();
    await expect(page.locator('button:has-text("Get Started")')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('user can navigate to sign in page', async ({ page }) => {
    await page.goto('/');

    // Click Sign In button
    await page.click('button:has-text("Sign In")');

    // Should be on sign in page
    await expect(page).toHaveURL(/.*auth\/signin/);
    await expect(page.locator('text=Sign In').first()).toBeVisible();
  });

  test('sign in form displays correctly', async ({ page }) => {
    await page.goto('/auth/signin');

    // Form elements should be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/auth/signup"]')).toBeVisible();
  });
});
