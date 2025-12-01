# Authenticated E2E Tests

This guide explains how to run tests that require authentication.

## Setup (One-Time)

### 1. Create Test User Account

Before running authenticated tests, you need a test user account:

1. **Start your dev server:**
   ```bash
   yarn dev
   ```

2. **Sign up at http://localhost:3000/auth/signup with:**
   - Email: `test@example.com`
   - Password: `testpassword123`

3. **Confirm your email** (check your email inbox or Supabase dashboard)

### 2. Run Authentication Setup

Once your test user is created and confirmed:

```bash
# This will sign in and save authentication state
npx playwright test auth.setup.ts
```

This creates `.auth/user.json` with your authenticated session.

## Running Tests

### Run All Authenticated Tests (Default)

```bash
yarn test:playwright
```

This will:
1. Run setup (authenticate test user)
2. Run ALL tests as an authenticated user across 3 browsers (Chrome, Firefox, Safari)
3. Test all functionality: dashboard, library, summaries, preferences, profile

**Note:** By default, only authenticated browser projects run. We skip unauthenticated redirect testing since the app requires authentication for most functionality.

### Run Single Browser

```bash
npx playwright test --project=chromium-auth
npx playwright test --project=firefox-auth
npx playwright test --project=webkit-auth
```

### Run Specific Authenticated Test Files

```bash
npx playwright test tests/e2e/playwright/dashboard.auth.spec.ts
npx playwright test tests/e2e/playwright/library.auth.spec.ts
npx playwright test tests/e2e/playwright/summaries.auth.spec.ts
npx playwright test tests/e2e/playwright/profile.auth.spec.ts
```

## Test Coverage

All tests run with authentication enabled. The test suite covers:

### Core Authenticated Tests (`*.auth.spec.ts`)
- **Dashboard** - Navigation, content loading, page transitions
- **Library** - Book browsing, search, filtering, sorting, view toggles, generate summary modal
- **Summaries** - View summaries, download PDFs, delete summaries, metadata display
- **Preferences** - Style/length options, preference selection, save functionality
- **Profile** - Profile page, sign out functionality

### Legacy Tests (`*.spec.ts`)
These tests also run with authentication and validate:
- Landing page (accessible when logged in)
- Dashboard/Library/Summaries access (no redirects since user is authenticated)
- Basic navigation flows

**Total:** ~78 tests across 3 browsers (Chrome, Firefox, Safari)

## Troubleshooting

### "missing required error components" or React Errors

If the browser shows "missing required error components, refreshing..." or you see React module errors:

**Cause:** Corrupted build artifacts or multiple React versions

**Solution:**
```bash
# Stop dev server (Ctrl+C)
rm -rf .next node_modules/.cache
yarn dev
```

Then re-run the auth setup.

### "Authentication failed" Error

If you see this error:
```
⚠️  Authentication failed - test user may not exist
```

**Solution:**
1. Make sure you created the test user at `/auth/signup`
2. Verify the email is confirmed (check Supabase or email)
3. Credentials are: `test@example.com` / `testpassword123`
4. Try signing in manually to confirm it works
5. Re-run: `npx playwright test auth.setup.ts`

### Different Test Credentials

To use different credentials, edit `tests/e2e/auth.setup.ts`:

```typescript
await page.locator('input[type="email"]').fill('your-email@example.com');
await page.locator('input[type="password"]').fill('your-password');
```

### Reset Authentication

If auth state becomes stale:

```bash
# Delete saved auth and re-run setup
rm -rf .auth/
npx playwright test auth.setup.ts
```

## CI/CD Setup

For continuous integration:

1. **Create test user in your test environment**
2. **Set environment variables:**
   ```bash
   TEST_USER_EMAIL=test@example.com
   TEST_USER_PASSWORD=testpassword123
   ```
3. **Update `auth.setup.ts` to use env vars:**
   ```typescript
   await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL!);
   await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD!);
   ```

## File Structure

```
tests/e2e/
├── auth.setup.ts                      # Authenticates once before tests
├── playwright/
│   ├── authentication.spec.ts          # Unauthenticated tests
│   ├── dashboard.spec.ts               # Unauthenticated (validates redirects)
│   ├── library.spec.ts                 # Unauthenticated (validates redirects)
│   ├── summaries.spec.ts               # Unauthenticated (validates redirects)
│   ├── profile.spec.ts                 # Unauthenticated (validates redirects)
│   ├── dashboard.auth.spec.ts          # ✨ Authenticated dashboard tests
│   ├── library.auth.spec.ts            # ✨ Authenticated library tests
│   ├── summaries.auth.spec.ts          # ✨ Authenticated summaries tests
│   └── profile.auth.spec.ts            # ✨ Authenticated profile tests
└── AUTHENTICATED-TESTS.md              # This file
```

## Notes

- `.auth/user.json` is gitignored (contains session tokens)
- Auth state is shared across all tests (fast!)
- Tests run in parallel for speed
- **All tests run with authentication** - We focus on testing actual app functionality
- Unauthenticated browser projects are disabled by default (can be re-enabled in `playwright.config.ts` if needed)
