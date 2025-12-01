# E2E Testing with Playwright and Cucumber

This directory contains end-to-end integration tests for the Megyk Books application, using Playwright for browser automation and Cucumber for BDD-style Gherkin feature files.

## Purpose

These tests serve as the **ground truth** for the application's UI flows and functionality. They were created against the master branch (Mantine UI implementation) to document and validate all user interactions before migrating to NativeWind + React Native.

## Directory Structure

```
tests/e2e/
├── features/                    # Gherkin feature files
│   ├── authentication.feature   # Sign in, sign up, auth redirects
│   ├── book-library.feature     # Book browsing, sorting, pagination
│   └── summary-generation.feature # Summary generation and management
├── step-definitions/            # Cucumber step implementations (TODO)
├── support/                     # Helper files and Page Object Models
│   ├── pages/                   # Page Object Models
│   │   ├── BasePage.ts          # Base POM with common methods
│   │   ├── HomePage.ts          # Landing page
│   │   ├── SignInPage.ts        # Authentication
│   │   └── LibraryPage.ts       # Book library
│   └── world.ts                 # Cucumber World with Playwright integration
└── README.md                    # This file
```

## Test Coverage

### Authentication (authentication.feature)
- ✅ Landing page display for unauthenticated users
- ✅ Navigation to sign in from home page
- ✅ Sign in with valid credentials
- ✅ Sign in with invalid credentials
- ✅ Sign in with unconfirmed email
- ✅ Navigation to sign up page
- ✅ Authenticated user redirect from home page

### Book Library (book-library.feature)
- ✅ View book library with covers, titles, authors
- ✅ Sort by title, author, genre, year, page count
- ✅ Pagination through books (10 per page)
- ✅ Click book cover to get summary
- ✅ Download pre-generated default summary
- ✅ Customize summary generation
- ✅ Mobile card view vs desktop table view
- ✅ Empty state when no books exist
- ✅ Book count display

### Summary Generation (summary-generation.feature)
- ✅ Open generate summary modal
- ✅ View customization options (style, length)
- ✅ Generate with default preferences
- ✅ Generate with custom settings
- ✅ View all generated summaries
- ✅ Download previously generated summary
- ✅ Delete generated summary
- ✅ Empty summaries page state
- ✅ Multiple summaries for same book
- ✅ Update default preferences
- ✅ Long processing time handling
- ✅ Summary metadata display

## Setup

### Install Dependencies

```bash
# From project root
yarn add -D @playwright/test @cucumber/cucumber @cucumber/gherkin playwright
npx playwright install
```

### Configuration Files

- **playwright.config.ts** - Playwright configuration with browser setup
- **cucumber.js** - Cucumber configuration for step definitions and reporting

## Running Tests

### Playwright Tests (Standard)

```bash
# Run all tests
npx playwright test

# Run in UI mode
npx playwright test --ui

# Run specific test
npx playwright test tests/e2e/features/authentication.feature

# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Cucumber Tests (TODO: After step definitions are implemented)

```bash
# Run cucumber tests
npx cucumber-js

# Run specific feature
npx cucumber-js tests/e2e/features/authentication.feature

# Generate HTML report
npx cucumber-js --format html:test-results/cucumber-report.html
```

## Page Object Model (POM)

We use the Page Object Model pattern to encapsulate page-specific selectors and actions:

### BasePage
- Common methods: `goto()`, `waitForLoadingToComplete()`, `getCurrentUrl()`
- Extended by all page classes

### HomePage (`app/page.tsx`)
- Landing page interactions
- "Get Started" and "Sign In" buttons
- Hero title and description

### SignInPage (`app/auth/signin/page.tsx`)
- Email and password input
- Submit button
- Error message display
- Navigation to sign up

### LibraryPage (`app/dashboard/library/page.tsx`)
- Book table/card display
- Sorting by columns
- Pagination controls
- "Get Summary" and "Customize" buttons
- Book cover interactions
- Generate summary modal

## Next Steps

1. **Implement Step Definitions** - Create TypeScript step definitions for all Gherkin scenarios
2. **Add More Page Objects** - Create POMs for:
   - SignUpPage
   - DashboardPage
   - SummariesPage
   - PreferencesPage
   - ProfilePage
3. **Run Baseline Tests** - Execute all tests against master branch to establish baseline
4. **Document Test Results** - Record baseline test results for comparison
5. **Run Against NativeWind Branch** - After refactoring, run same tests to validate feature parity

## Writing New Tests

### Gherkin Guidelines

- Use **Given-When-Then** format
- Write scenarios from user perspective
- Keep scenarios focused and independent
- Use background for common setup
- Use scenario outlines for data-driven tests

### Example

```gherkin
Feature: Book Discovery
  As a user
  I want to search for books
  So that I can find specific titles quickly

  Background:
    Given I am signed in

  Scenario: User searches for book by title
    Given I am on the library page
    When I enter "Great Gatsby" in the search box
    Then I should see books matching "Great Gatsby"
    And the results should be filtered
```

### Page Object Guidelines

- One POM per page or major component
- Use descriptive selector names
- Encapsulate all page interactions
- Return values for assertions
- Keep selectors private

## Test Data

### Test Users
- `test@example.com` / `testpassword123` - Valid authenticated user
- `invalid@example.com` / `wrongpassword` - Invalid credentials
- `unconfirmed@example.com` / `testpassword123` - Unconfirmed email

### Test Books
- TBD: Seed database with test books for consistent test data

## Troubleshooting

### Tests Failing on Master Branch
- Ensure dev server is running at http://localhost:3002
- Check that Supabase is accessible
- Verify test user accounts exist in database

### Playwright Installation Issues
```bash
# Reinstall browsers
npx playwright install --force
```

### Cucumber Not Finding Steps
- Ensure step definitions are in `tests/e2e/step-definitions/`
- Check `cucumber.js` require paths
- Verify TypeScript is configured with `ts-node/register`

## CI/CD Integration

### GitHub Actions (TODO)
```yaml
- name: Install dependencies
  run: yarn install

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: npx playwright test

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Migration Workflow

1. **Master Branch**: Create and validate all tests against Mantine UI app
2. **Document Baseline**: Record passing test results
3. **NativeWind Branch**: Run same tests after component refactoring
4. **Compare Results**: Identify any functionality regressions
5. **Fix Issues**: Address failing tests until feature parity achieved
6. **Merge**: Confidently merge NativeWind branch knowing functionality is preserved

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Cucumber Documentation](https://cucumber.io/docs/guides/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Gherkin Syntax](https://cucumber.io/docs/gherkin/reference/)
