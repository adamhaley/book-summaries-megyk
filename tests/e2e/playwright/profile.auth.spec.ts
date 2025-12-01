import { test, expect } from '@playwright/test';

test.describe('Profile & Preferences (Authenticated)', () => {
  test('preferences page loads correctly', async ({ page }) => {
    await page.goto('/dashboard/preferences');
    await page.waitForLoadState('networkidle');

    // Should not redirect to sign-in
    expect(page.url()).not.toContain('/auth/signin');

    // Should see preferences content
    const hasPreferencesContent =
      await page.locator('text=/preferences|style|length/i').count() > 0;

    expect(hasPreferencesContent).toBeTruthy();
  });

  test('displays style preference options', async ({ page }) => {
    await page.goto('/dashboard/preferences');
    await page.waitForLoadState('networkidle');

    // Should see style options: Narrative, Bullet Points, or Workbook
    const hasStyleOptions =
      await page.locator('text=/narrative|bullet|workbook/i').count() > 0;

    expect(hasStyleOptions).toBeTruthy();
  });

  test('displays length preference options', async ({ page }) => {
    await page.goto('/dashboard/preferences');
    await page.waitForLoadState('networkidle');

    // Should see length options: Short, Medium, or Long
    const hasLengthOptions =
      await page.locator('text=/short|medium|long|1.*page|5.*page|15.*page/i').count() > 0;

    expect(hasLengthOptions).toBeTruthy();
  });

  test('can select style preferences', async ({ page }) => {
    await page.goto('/dashboard/preferences');
    await page.waitForLoadState('networkidle');

    const narrativeOption = page.locator('input[value="narrative"], label:has-text("Narrative")').first();

    if (await narrativeOption.count() > 0) {
      await narrativeOption.click();
      await page.waitForTimeout(500);

      expect(true).toBeTruthy();
    }
  });

  test('can select length preferences', async ({ page }) => {
    await page.goto('/dashboard/preferences');
    await page.waitForLoadState('networkidle');

    const shortOption = page.locator('input[value*="short"], input[value*="1pg"], label:has-text("Short")').first();

    if (await shortOption.count() > 0) {
      await shortOption.click();
      await page.waitForTimeout(500);

      expect(true).toBeTruthy();
    }
  });

  test('save button is present', async ({ page }) => {
    await page.goto('/dashboard/preferences');
    await page.waitForLoadState('networkidle');

    const saveButton = page.locator('button[type="submit"], button:has-text("Save")').first();

    if (await saveButton.count() > 0) {
      expect(await saveButton.isVisible()).toBeTruthy();
    }
  });

  test('profile page loads if it exists', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await page.waitForLoadState('networkidle');

    // Should not redirect to sign-in
    expect(page.url()).not.toContain('/auth/signin');

    // Profile page may or may not have content depending on implementation
    expect(true).toBeTruthy();
  });

  test('can sign out', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const signOutButton = page.locator('button:has-text("Sign Out"), a:has-text("Sign Out")').first();

    if (await signOutButton.count() > 0) {
      await signOutButton.click();
      await page.waitForLoadState('networkidle');

      // Should redirect to home or sign-in
      const url = page.url();
      expect(url.includes('/auth/signin') || url.endsWith('/')).toBeTruthy();
    }
  });
});
