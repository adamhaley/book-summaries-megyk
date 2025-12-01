/**
 * Cucumber configuration for Megyk Books E2E testing
 */
module.exports = {
  default: {
    require: [
      'tests/e2e/step-definitions/**/*.ts',
      'tests/e2e/support/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    loader: ['ts-node/esm'],
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

// Configure ts-node to use the test tsconfig
require('ts-node').register({
  project: './tsconfig.test.json'
});
