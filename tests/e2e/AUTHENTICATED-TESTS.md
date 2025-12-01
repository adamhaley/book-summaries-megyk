# Authenticated E2E Tests

This guide explains how to run tests that require authentication.

## Setup (One-Time)

### 1. Create Test User Account

Before running authenticated tests, you need a test user account:

1. **Start your dev server:**
   ```bash
   yarn dev
   ```

2. **Sign up at http://localhost:3002/auth/signup with:**
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

## Running Authenticated Tests

### Run All Tests (Both Authenticated & Unauthenticated)

```bash
yarn test:playwright
```

This will:
1. Run setup (authenticate test user)
2. Run unauthenticated tests (landing page, sign-in, etc.)
3. Run authenticated tests (dashboard, library, summaries, preferences)

### Run Only Authenticated Tests

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

### Unauthenticated Tests (`*.spec.ts`)
- Landing page
- Sign-in page
- Authentication redirects
- Public pages

### Authenticated Tests (`*.auth.spec.ts`)
- Dashboard navigation
- Library browsing
- Book search & filtering
- Generate summary modal
- My Summaries page
- Download summaries
- Delete summaries
- User preferences
- Profile management

## Troubleshooting

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
- Auth state is shared across all authenticated tests (fast!)
- Tests run in parallel for speed
- Unauthenticated tests validate that auth is working (redirects)
- Authenticated tests validate actual functionality
