# Test Infrastructure Extraction Plan

## Purpose
Surgically extract ONLY test infrastructure from `test-baseline` branch to merge into `nativewind` branch, excluding all System Under Test (SUT) changes.

## Commit Range Analyzed
- **Start**: `1d75afa` (adding live=true filter to sql queries)
- **End**: `df3264d` (e2e test suite passing 100%)
- **Total commits**: 9 (all test-related, no SUT commits)

## Pure Test Infrastructure Files (29 total)

### Config Files (3)
```
playwright.config.ts
cucumber.js
tsconfig.test.json
```

### Test Directory (24 files)
```
tests/e2e/
├── features/                           (3 Gherkin feature files)
│   ├── authentication.feature
│   ├── book-library.feature
│   └── summary-generation.feature
├── playwright/                         (9 Playwright spec files)
│   ├── authentication.spec.ts
│   ├── library.auth.spec.ts
│   ├── library.guest.spec.ts
│   ├── profile.auth.spec.ts
│   ├── reading-experience.spec.ts
│   ├── search-filter.spec.ts
│   ├── signup.spec.ts
│   ├── summaries.auth.spec.ts
│   └── summary-generation.spec.ts
├── step-definitions/                   (4 step definition files)
│   ├── authentication.steps.ts
│   ├── book-library.steps.ts
│   ├── common.steps.ts
│   └── summary-generation.steps.ts
├── support/                            (6 support files)
│   ├── pages/
│   │   ├── BasePage.ts
│   │   ├── LibraryPage.ts
│   │   └── SummaryGenerationPage.ts
│   ├── cucumber.ts
│   ├── hooks.ts
│   └── world.ts
├── auth.setup.ts
├── AUTHENTICATED-TESTS.md
├── README.md
└── TESTING-STATUS.md
```

### Git Ignore (1 file)
```
.gitignore (test result paths only)
```

### Documentation (1 file)
```
tests/e2e/README.md (already counted above)
```

## package.json Changes - SURGICAL EXTRACTION REQUIRED

### ✅ INCLUDE - Pure Test Infrastructure

**Scripts to add:**
```json
"test:e2e": "TS_NODE_PROJECT=./tsconfig.test.json cucumber-js tests/e2e/features/*.feature",
"test:e2e:auth": "TS_NODE_PROJECT=./tsconfig.test.json cucumber-js tests/e2e/features/authentication.feature",
"test:e2e:library": "TS_NODE_PROJECT=./tsconfig.test.json cucumber-js tests/e2e/features/book-library.feature",
"test:e2e:summary": "TS_NODE_PROJECT=./tsconfig.test.json cucumber-js tests/e2e/features/summary-generation.feature",
"test:playwright": "playwright test",
"test:playwright:ui": "playwright test --ui",
"test:playwright:headed": "playwright test --headed",
"test:playwright:debug": "playwright test --debug"
```

**Dev script modification:**
```json
BEFORE: "dev": "next dev"
AFTER:  "dev": "next dev -p 3000"
```
**Rationale**: The `-p 3000` flag ensures consistent port for test stability.

**devDependencies to add:**
```json
"@cucumber/cucumber": "^12.2.0",
"@cucumber/gherkin": "^37.0.0",
"@playwright/test": "^1.57.0",
"playwright": "^1.57.0",
"ts-node": "^10.9.2"
```

**Note on @types/node version bump:**
```json
BEFORE: "@types/node": "^24.7.2"
AFTER:  "@types/node": "^24.10.1"
```
This was likely an auto-update when test dependencies were installed. Check nativewind branch's current version before deciding whether to include.

### ❌ EXCLUDE - SUT Changes (Not Test Infrastructure)

**Scripts to SKIP:**
```json
"upload-covers": "tsx scripts/upload-book-covers.ts"
```
**Rationale**: This script existed BEFORE test work began (commit 1d75afa). It's from commit `dc08224` (feat: Add book covers infrastructure with Supabase Storage) which is a separate SUT feature.

## .gitignore Changes - INCLUDE

**Add these lines:**
```gitignore
# Test results
/test-results/
/playwright-report/
/test-results.xml
/.auth/
```

## yarn.lock Changes

**Status**: Will auto-generate when you run `yarn install` after adding test dependencies to package.json. Do NOT manually copy yarn.lock.

## Extraction Strategy

### Option 1: Manual File Copy (Recommended for Maximum Control)

1. **Checkout nativewind branch:**
   ```bash
   git checkout nativewind
   ```

2. **Create test-integration branch:**
   ```bash
   git checkout -b test-integration
   ```

3. **Copy test files from test-baseline:**
   ```bash
   # Config files
   git checkout test-baseline -- playwright.config.ts cucumber.js tsconfig.test.json

   # Entire test directory
   git checkout test-baseline -- tests/e2e/
   ```

4. **Manually edit package.json:**
   - Add test scripts
   - Add `-p 3000` to dev script (if nativewind branch uses Next.js dev server)
   - Add test devDependencies
   - **DO NOT** add or modify `upload-covers` script

5. **Manually edit .gitignore:**
   - Add test result paths

6. **Install dependencies:**
   ```bash
   yarn install  # This will update yarn.lock automatically
   ```

7. **Commit:**
   ```bash
   git add .
   git commit -m "test: integrate E2E testing infrastructure from test-baseline

- Add Playwright + Cucumber test framework
- Add 79 E2E tests (authentication, library, summaries, preferences)
- Add auth setup and page objects
- Configure test scripts and dependencies
- All tests passing on master branch (100% baseline)"
   ```

### Option 2: Cherry-Pick with Manual Cleanup (More Complex)

1. Cherry-pick all test commits from test-baseline
2. Manually revert any `upload-covers` changes if they appear
3. Resolve merge conflicts in package.json structure changes

**Not recommended** due to nativewind branch's monorepo structure changes.

### Option 3: Interactive Rebase (Advanced)

Not recommended for this use case - too complex given structural differences between branches.

## Post-Integration Tasks

After merging test infrastructure into nativewind branch:

### 1. Adapt Test Selectors for React Native
- **Current**: Next.js DOM (`<table>`, `<div>`, `<input>`)
- **Target**: React Native DOM (`<View>`, `<Text>`, Gluestack components)
- **Files to update**: All 9 Playwright spec files

### 2. Verify Monorepo Structure Compatibility
- nativewind branch has `/apps/expo/` structure
- May need to adjust test paths or create new test suites per app

### 3. Update Auth Setup
- Verify Supabase auth works in React Native context
- May need different auth storage mechanism (AsyncStorage vs cookies)

### 4. Update Test Scripts (if monorepo structure changed)
- May need to adjust paths in package.json test scripts
- Consider workspace-level vs app-level test commands

### 5. Run Baseline Tests
- Expect failures initially (DOM structure differences)
- Document new baseline (X/79 passing before fixes)

## Verification Checklist

Before finalizing integration:

- [ ] All 29 test files copied successfully
- [ ] All 8 test scripts added to package.json
- [ ] `-p 3000` added to dev script (if applicable)
- [ ] All 5 test devDependencies added
- [ ] `@types/node` version reviewed
- [ ] `upload-covers` script NOT added or modified
- [ ] Test result paths added to .gitignore
- [ ] `yarn install` completed successfully
- [ ] yarn.lock regenerated (not manually copied)
- [ ] No SUT files from master branch inadvertently copied

## Notes

- **"Slowly and methodically"**: This plan ensures zero SUT contamination
- **Surgical approach**: Only test infrastructure, no business logic changes
- **Clean separation**: Clear documentation of what to include vs exclude
- **Future-proof**: Documented rationale for all decisions

## References

- Test baseline branch: `origin/test-baseline`
- Commit range: `1d75afa..df3264d`
- All 79 tests passing on master branch as of `df3264d`
