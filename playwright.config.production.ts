import { defineConfig, devices } from '@playwright/test'

/**
 * Production smoke tests configuration
 * Runs critical path tests against live production environment
 */
export default defineConfig({
  testDir: './tests/e2e/production',

  // Timeout for each test
  timeout: 30000,

  // Fail fast in production
  fullyParallel: false,

  // Retry failed tests
  retries: 2,

  // Single worker for production tests
  workers: 1,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'test-results/production' }],
    ['junit', { outputFile: 'test-results/production-junit.xml' }],
    ['json', { outputFile: 'test-results/production-results.json' }]
  ],

  use: {
    // Production URL
    baseURL: process.env.PRODUCTION_URL || 'https://app.megyk.com',

    // Collect trace on failure
    trace: 'retain-on-failure',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Add test credentials if needed
    extraHTTPHeaders: process.env.PROD_TEST_TOKEN
      ? { 'Authorization': `Bearer ${process.env.PROD_TEST_TOKEN}` }
      : undefined
  },

  projects: [
    {
      name: 'production-chrome',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
