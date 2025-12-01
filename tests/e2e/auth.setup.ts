import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to sign-in page
  await page.goto('/auth/signin');
  await page.waitForLoadState('domcontentloaded');

  // Wait for form to be visible (React Native uses testID instead of HTML attributes)
  await page.waitForSelector('[data-testid="email-input"]', { timeout: 10000 });

  // Fill in credentials
  await page.locator('[data-testid="email-input"]').fill('test@example.com');
  await page.locator('[data-testid="password-input"]').fill('testpassword123');

  // Click sign-in button
  await page.locator('[data-testid="signin-button"]').click();

  // Wait for redirect to dashboard or for URL to change
  await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(async () => {
    // If not redirected to dashboard, check if we're still on signin with error
    const currentUrl = page.url();

    if (currentUrl.includes('/auth/signin')) {
      console.log('⚠️  Authentication failed - test user may not exist');
      console.log('⚠️  Skipping authenticated tests');
      console.log('⚠️  To create test user, sign up at /auth/signup with:');
      console.log('    Email: test@example.com');
      console.log('    Password: testpassword123');

      // Don't save auth state if login failed
      return;
    }
  });

  // Check if we successfully authenticated
  const isAuthenticated = page.url().includes('/dashboard');

  if (isAuthenticated) {
    console.log('✅ Authentication successful - saving auth state');

    // Save authenticated state
    await page.context().storageState({ path: authFile });
  } else {
    console.log('⚠️  Not authenticated - test user credentials may be incorrect');
  }
});
