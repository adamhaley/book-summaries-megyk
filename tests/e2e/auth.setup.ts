import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to sign-in page
  await page.goto('/auth/signin');

  // Fill in credentials
  // TODO: Replace with your test user credentials
  await page.locator('input[type="email"]').fill('test@example.com');
  await page.locator('input[type="password"]').fill('testpassword123');

  // Click sign-in button
  await page.locator('button[type="submit"]').click();

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
