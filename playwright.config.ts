import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Megyk Books E2E testing
 * Tests the Mantine UI application on master branch
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3002',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    // Setup project - runs once before all other projects
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Authenticated tests - use saved auth state
    {
      name: 'chromium-auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*\.auth\.spec\.ts/,
    },
    {
      name: 'firefox-auth',
      use: {
        ...devices['Desktop Firefox'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*\.auth\.spec\.ts/,
    },
    {
      name: 'webkit-auth',
      use: {
        ...devices['Desktop Safari'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*\.auth\.spec\.ts/,
    },

    // Unauthenticated tests - run without auth state
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /.*\.auth\.spec\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /.*\.auth\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /.*\.auth\.spec\.ts/,
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: /.*\.auth\.spec\.ts/,
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testIgnore: /.*\.auth\.spec\.ts/,
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
