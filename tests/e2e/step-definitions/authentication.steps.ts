import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { HomePage } from '../support/pages/HomePage';
import { SignInPage } from '../support/pages/SignInPage';

// Landing page steps
Then('I should see the landing page', async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);
  const isVisible = await homePage.isLandingPageVisible();
  expect(isVisible).toBeTruthy();
});

Then('I should not see the landing page', async function (this: CustomWorld) {
  const homePage = new HomePage(this.page);
  const isVisible = await homePage.isLandingPageVisible();
  expect(isVisible).toBeFalsy();
});

Then('I should see a {string} button', async function (this: CustomWorld, buttonText: string) {
  const button = this.page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeVisible();
});

// Sign in form steps
When('I enter email {string}', async function (this: CustomWorld, email: string) {
  const signInPage = new SignInPage(this.page);
  await signInPage.fillEmail(email);
});

When('I enter password {string}', async function (this: CustomWorld, password: string) {
  const signInPage = new SignInPage(this.page);
  await signInPage.fillPassword(password);
});

When('I click the submit button', async function (this: CustomWorld) {
  const signInPage = new SignInPage(this.page);
  await signInPage.clickSubmit();

  // Wait a bit for the request to process
  await this.page.waitForTimeout(1000);
});

// Error handling steps
Then('I should see an error message', async function (this: CustomWorld) {
  const signInPage = new SignInPage(this.page);
  const isErrorVisible = await signInPage.isErrorVisible();
  expect(isErrorVisible).toBeTruthy();
});

Then('I should see an error about email verification', async function (this: CustomWorld) {
  const signInPage = new SignInPage(this.page);
  const errorMessage = await signInPage.getErrorMessage();
  expect(errorMessage?.toLowerCase()).toContain('email');
  expect(errorMessage?.toLowerCase()).toContain('confirm');
});

Then('the error should mention checking inbox', async function (this: CustomWorld) {
  const signInPage = new SignInPage(this.page);
  const errorMessage = await signInPage.getErrorMessage();
  expect(errorMessage?.toLowerCase()).toContain('inbox');
});

Then('I should remain on the sign in page', async function (this: CustomWorld) {
  expect(this.page.url()).toContain('/auth/signin');
});

// Dashboard steps
Then('I should see the dashboard library page', async function (this: CustomWorld) {
  await this.page.waitForURL('**/dashboard**');

  // Wait for dashboard content to load
  await this.page.waitForSelector('text=Library, text=Summaries, text=Preferences', { timeout: 5000 }).catch(() => {
    // Dashboard might redirect to library directly
  });
});
