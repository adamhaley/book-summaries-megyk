/**
 * Cucumber configuration for Megyk Books E2E testing
 */
const os = require('os');

if (
  !process.env.PLAYWRIGHT_HOST_PLATFORM_OVERRIDE &&
  process.platform === 'darwin' &&
  os.cpus().length === 0
) {
  const darwinMajor = parseInt(os.release().split('.')[0] || '0', 10);
  const macMajor = Math.min(darwinMajor - 9, 15);
  if (macMajor >= 11) {
    process.env.PLAYWRIGHT_HOST_PLATFORM_OVERRIDE = `mac${macMajor}-arm64`;
  }
}

module.exports = {
  default: {
    require: [
      'tests/e2e/step-definitions/**/*.ts',
      'tests/e2e/support/**/*.ts'
    ],
    requireModule: ['ts-node/register/transpile-only'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      '@cucumber/pretty-formatter'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    publishQuiet: true,
  }
};
