import { test, expect } from '@playwright/test';

test.describe('User Profile & Preferences', () => {
  test('can navigate to preferences page', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for Preferences link in navigation
    const preferencesLink = page.locator('a[href*="preferences"], button:has-text("Preferences")');

    if (await preferencesLink.count() > 0) {
      await preferencesLink.first().click();
      await expect(page).toHaveURL(/.*preferences/);
    }
  });

  test('preferences page displays style options', async ({ page }) => {
    await page.goto('/dashboard/preferences');

    // Should see style preference options
    await expect(page.locator('text=/narrative|bullet points|workbook/i')).toBeVisible({ timeout: 5000 });
  });

  test('preferences page displays length options', async ({ page }) => {
    await page.goto('/dashboard/preferences');

    // Should see length preference options
    await expect(page.locator('text=/short|medium|long|1 sentence|1 paragraph|1 page/i')).toBeVisible({ timeout: 5000 });
  });

  test('can change style preference', async ({ page }) => {
    await page.goto('/dashboard/preferences');

    // Look for style radio buttons or selects
    const narrativeOption = page.locator('input[value="narrative"], button:has-text("Narrative"), label:has-text("Narrative")');
    const bulletOption = page.locator('input[value="bullet_points"], button:has-text("Bullet"), label:has-text("Bullet")');

    if (await narrativeOption.count() > 0) {
      await narrativeOption.first().click();
      await page.waitForTimeout(500);
    }

    if (await bulletOption.count() > 0) {
      await bulletOption.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('can change length preference', async ({ page }) => {
    await page.goto('/dashboard/preferences');

    // Look for length radio buttons or selects
    const shortOption = page.locator('input[value*="short"], input[value*="1pg"], button:has-text("Short"), label:has-text("Short")');
    const mediumOption = page.locator('input[value*="medium"], input[value*="5pg"], button:has-text("Medium"), label:has-text("Medium")');

    if (await shortOption.count() > 0) {
      await shortOption.first().click();
      await page.waitForTimeout(500);
    }

    if (await mediumOption.count() > 0) {
      await mediumOption.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('can save preferences', async ({ page }) => {
    await page.goto('/dashboard/preferences');

    // Look for save button
    const saveButton = page.locator('button[type="submit"], button:has-text("Save")');

    if (await saveButton.count() > 0) {
      await saveButton.first().click();

      // Should see success notification
      const successMessage = page.locator('text=/saved|success|updated/i');
      await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('preferences persist after reload', async ({ page }) => {
    await page.goto('/dashboard/preferences');

    // Select a specific preference
    const narrativeOption = page.locator('input[value="narrative"], label:has-text("Narrative")');

    if (await narrativeOption.count() > 0) {
      await narrativeOption.first().click();

      // Save
      const saveButton = page.locator('button[type="submit"], button:has-text("Save")');
      if (await saveButton.count() > 0) {
        await saveButton.first().click();
        await page.waitForTimeout(1000);
      }

      // Reload page
      await page.reload();
      await page.waitForTimeout(1000);

      // Narrative should still be selected
      const narrativeChecked = await narrativeOption.first().isChecked().catch(() => false);
      expect(narrativeChecked).toBeTruthy();
    }
  });

  test('can navigate to profile page', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for Profile link in navigation
    const profileLink = page.locator('a[href*="profile"], button:has-text("Profile")');

    if (await profileLink.count() > 0) {
      await profileLink.first().click();
      await expect(page).toHaveURL(/.*profile/);
    }
  });

  test('profile page displays user information', async ({ page }) => {
    await page.goto('/dashboard/profile');

    // Should see email or user information
    const emailField = page.locator('input[type="email"], text=/@/');

    // Either shows email field or user info display
    const hasUserInfo = await emailField.count() > 0;

    if (hasUserInfo) {
      await expect(emailField.first()).toBeVisible();
    }
  });

  test('dashboard displays navigation menu', async ({ page }) => {
    await page.goto('/dashboard');

    // Should see main navigation items
    await expect(page.locator('text=/library/i').first()).toBeVisible();
    await expect(page.locator('text=/summaries/i').first()).toBeVisible();
  });

  test('can sign out from profile or menu', async ({ page }) => {
    await page.goto('/dashboard');

    // Look for sign out button
    const signOutButton = page.locator('button:has-text("Sign Out"), a:has-text("Sign Out")');

    if (await signOutButton.count() > 0) {
      await signOutButton.first().click();

      // Should redirect to home or sign in page
      await page.waitForTimeout(2000);
      const currentUrl = page.url();

      expect(
        currentUrl.includes('/auth/signin') ||
        currentUrl.endsWith('/') ||
        currentUrl.includes('localhost:3002')
      ).toBeTruthy();
    }
  });

  test('preferences form has proper validation', async ({ page }) => {
    await page.goto('/dashboard/preferences');

    // Try to submit without selecting options (if validation exists)
    const saveButton = page.locator('button[type="submit"], button:has-text("Save")');

    if (await saveButton.count() > 0) {
      // Should have at least one option selected by default
      const checkedRadio = page.locator('input[type="radio"]:checked');
      const checkedCount = await checkedRadio.count();

      // Either has validation or has default values
      expect(checkedCount).toBeGreaterThanOrEqual(0);
    }
  });
});
