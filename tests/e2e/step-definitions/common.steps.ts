import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { HomePage } from '../support/pages/HomePage';
import { SignInPage } from '../support/pages/SignInPage';
import { LibraryPage } from '../support/pages/LibraryPage';

// Background steps
Given('the application is running', async function (this: CustomWorld) {
  // Just verify we can reach the base URL
  await this.page.goto('/');
  await expect(this.page).toHaveURL(/.*localhost:3002.*/);
});

// Common navigation steps
Given('I am on the home page', async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);
  await homePage.goto();
});

When('I visit the home page', async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);
  await homePage.goto();
});

Given('I am on the sign in page', async function (this: CustomWorld) {
  const signInPage = new SignInPage(this.page);
  await signInPage.goto();
});

Given('I am on the library page', async function (this: CustomWorld) {
  const libraryPage = new LibraryPage(this.page);
  await libraryPage.goto();
});

// Authentication helper
Given('I am signed in as {string}', async function (this: CustomWorld, email: string) {
  // For now, use a test account - in real implementation, this would use Supabase auth
  const signInPage = new SignInPage(this.page);
  await signInPage.goto();
  await signInPage.signIn(email, 'testpassword123');
  await signInPage.waitForRedirect();

  // Store auth state
  this.authenticatedUser = email;
});

// Viewport/device steps
Given('I am viewing on a mobile device', async function (this: CustomWorld) {
  await this.page.setViewportSize({ width: 375, height: 667 });
});

Given('I am viewing on a desktop device', async function (this: CustomWorld) {
  await this.page.setViewportSize({ width: 1280, height: 720 });
});

// Generic button clicks
When('I click the {string} button', async function (this: CustomWorld, buttonText: string) {
  await this.page.click(`button:has-text("${buttonText}")`);
});

When('I click the {string} link', async function (this: CustomWorld, linkText: string) {
  await this.page.click(`a:has-text("${linkText}")`);
});

// Generic assertions
Then('I should see {string} in the hero title', async function (this: CustomWorld, text: string) {
  await expect(this.page.locator('text=' + text)).toBeVisible();
});

Then('I should see the {string} page title', async function (this: CustomWorld, title: string) {
  await expect(this.page.locator(`text=${title}`).first()).toBeVisible();
});

Then('I should see the page title {string}', async function (this: CustomWorld, title: string) {
  await expect(this.page.locator(`text=${title}`).first()).toBeVisible();
});

Then('I should be redirected to the sign in page', async function (this: CustomWorld) {
  await this.page.waitForURL('**/auth/signin');
  expect(this.page.url()).toContain('/auth/signin');
});

Then('I should be redirected to the sign up page', async function (this: CustomWorld) {
  await this.page.waitForURL('**/auth/signup');
  expect(this.page.url()).toContain('/auth/signup');
});

Then('I should be redirected to the dashboard', async function (this: CustomWorld) {
  await this.page.waitForURL('**/dashboard**', { timeout: 10000 });
  expect(this.page.url()).toContain('/dashboard');
});

Then('I should be automatically redirected to the dashboard', async function (this: CustomWorld) {
  await this.page.waitForURL('**/dashboard**', { timeout: 10000 });
  expect(this.page.url()).toContain('/dashboard');
});
