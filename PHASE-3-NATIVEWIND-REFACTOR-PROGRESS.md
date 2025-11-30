# Phase 3: NativeWind Component Refactoring - IN PROGRESS

**Date Started:** 2025-11-30
**Branch:** `nativewind-pivot`
**Status:** 6/40 UI components refactored (15%)

## Overview

Phase 3 focuses on refactoring all existing UI components from custom theme-based styling to NativeWind className utilities. This maintains the same component API while leveraging Tailwind CSS utility classes for consistent, maintainable styling across web, iOS, and Android.

---

## Critical Issue Resolved: React Hooks Bug

### Problem
React hooks error: "Cannot read properties of null (reading 'useRef')" caused by nested React installations in:
- `node_modules/use-sync-external-store/node_modules/react`
- `node_modules/react-remove-scroll/node_modules/react`

### Root Cause
Yarn resolutions in `package.json` didn't prevent nested `node_modules` folders. Metro bundler was loading React from nested locations instead of root, causing multiple React instances.

### Solution
```bash
rm -rf node_modules/use-sync-external-store/node_modules
rm -rf node_modules/react-remove-scroll/node_modules
```

### Result
✅ App now renders successfully at http://localhost:8081
✅ Metro bundled: **751 modules** (vs 1901 before)
✅ Single React 19.1.0 instance across all packages

---

## Completed Components (6/40)

### ✅ 1. Button Component
**File:** `apps/expo/components/ui/Button.tsx`
**Status:** Complete

**Changes:**
- Removed `useTheme()` hook dependency
- Replaced inline styles with NativeWind className prop
- Maintained all variants: primary, secondary, accent, outline, ghost
- Maintained all sizes: sm, md, lg, xl
- Maintained all features: loading, disabled, fullWidth, icons

**Example:**
```tsx
// Before (theme-based)
style={{ backgroundColor: theme.colors.primary.DEFAULT, height: 40 }}

// After (NativeWind)
className="bg-primary h-11 px-4 rounded-lg active:bg-primary-700"
```

---

### ✅ 2. Card Component
**File:** `apps/expo/components/ui/Card.tsx`
**Status:** Complete

**Changes:**
- Removed `useTheme()` hook
- Replaced inline styles with Tailwind classes
- Variants: elevated (shadow-md), outlined (border), filled (bg-gray-50)
- Padding sizes: none (p-0), sm (p-2), md (p-4), lg (p-6)

**Example:**
```tsx
// Before
style={{ backgroundColor: '#FFFFFF', padding: theme.spacing[4], ...theme.shadows.md }}

// After
className="bg-white rounded-lg p-4 shadow-md"
```

---

### ✅ 3. Badge Component
**File:** `apps/expo/components/ui/Badge.tsx`
**Status:** Complete

**Changes:**
- Removed `useTheme()` hook
- Clean variant classes with Tailwind utilities
- Variants: primary, secondary, accent, success, warning, error, neutral
- Sizes: sm, md, lg

**Example:**
```tsx
// Before
style={{ backgroundColor: theme.colors.primary[100], color: theme.colors.primary[700] }}

// After
className="bg-primary-100 text-primary-700 rounded-full px-2 py-1"
```

---

### ✅ 4. HStack Component
**File:** `apps/expo/components/layout/HStack.tsx`
**Status:** Complete

**Changes:**
- Flexbox alignment with Tailwind classes
- Alignment: items-start, items-center, items-end, items-stretch
- Justify: justify-start, justify-center, justify-end, justify-between, etc.
- Wrap support: flex-wrap, flex-nowrap

**Example:**
```tsx
// Before
style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}

// After
className="flex-row items-center justify-between"
```

---

### ✅ 5. VStack Component
**File:** `apps/expo/components/layout/VStack.tsx`
**Status:** Complete

**Changes:**
- Vertical flex layout with Tailwind
- Same alignment/justify options as HStack
- Column direction: flex-col

**Example:**
```tsx
// Before
style={{ flexDirection: 'column', alignItems: 'center' }}

// After
className="flex-col items-center"
```

---

### ✅ 6. Container Component
**File:** `apps/expo/components/layout/Container.tsx`
**Status:** Complete

**Changes:**
- Max-width constraints with arbitrary values
- Sizes: sm (640px), md (768px), lg (1024px), xl (1280px), full
- Padding: none, sm, md, lg, xl
- Center alignment: self-center

**Example:**
```tsx
// Before
style={{ width: '100%', maxWidth: 1024, padding: theme.spacing[4] }}

// After
className="w-full max-w-[1024px] p-4 self-center"
```

---

## Pending Components (34/40)

### 🔲 UI Components
- [ ] Input
- [ ] Modal
- [ ] Spinner
- [ ] Checkbox
- [ ] Radio
- [ ] Select
- [ ] Textarea
- [ ] Switch
- [ ] Slider

### 🔲 Dashboard Components
- [ ] DashboardLayout
- [ ] MainNavigation
- [ ] Sidebar
- [ ] Header

### 🔲 Feature Components
- [ ] GenerateSummaryModal
- [ ] PreferencesForm
- [ ] OnboardingWizard
- [ ] BookCard
- [ ] BookCarousel
- [ ] SummaryCard

### 🔲 Screen Components
- [ ] Homepage
- [ ] Library
- [ ] Summaries
- [ ] Profile
- [ ] Auth screens (signin, signup, confirm, error)

---

## Integration Testing Strategy

### Overview
To ensure feature parity between the Mantine UI app (master branch) and the NativeWind app (nativewind-pivot branch), we will create a comprehensive integration test suite using Gherkin scenarios and Playwright.

### Approach

#### 1. Test Suite Creation (On Master Branch)
**Branch:** `master` (current working Mantine UI app)
**Location:** `/tests/` directory

**Files to Create:**
```
tests/
├── features/
│   ├── authentication.feature
│   ├── book-library.feature
│   ├── summary-generation.feature
│   ├── user-preferences.feature
│   ├── my-summaries.feature
│   └── navigation.feature
├── steps/
│   ├── authentication.steps.ts
│   ├── book-library.steps.ts
│   ├── summary-generation.steps.ts
│   └── shared.steps.ts
├── support/
│   ├── page-objects/
│   │   ├── HomePage.ts
│   │   ├── LibraryPage.ts
│   │   ├── SummariesPage.ts
│   │   └── PreferencesPage.ts
│   └── helpers.ts
└── playwright.config.ts
```

#### 2. Technology Stack

**Playwright** (recommended over Puppeteer):
- ✅ Cross-browser support (Chromium, Firefox, WebKit)
- ✅ Built-in test runner with parallel execution
- ✅ Better mobile viewport emulation
- ✅ Auto-waiting for elements
- ✅ Official Cucumber/Gherkin integration

**Packages to Install:**
```bash
yarn add -D @playwright/test @cucumber/cucumber @cucumber/gherkin
```

#### 3. Example Gherkin Feature

**File:** `tests/features/summary-generation.feature`

```gherkin
Feature: Book Summary Generation
  As a registered user
  I want to generate personalized book summaries
  So that I can quickly understand book content in my preferred style

  Background:
    Given I am logged in as a user
    And I am on the book library page

  Scenario: Generate summary with default preferences
    When I click the "Generate Summary" button for "The Great Gatsby"
    Then I should see the summary generation modal
    And the style slider should be at "Narrative"
    And the length slider should be at "Medium"
    When I click "Generate"
    Then I should see a loading indicator
    And after generation completes I should see a download button
    And the summary should appear in "My Summaries"

  Scenario: Customize summary before generation
    When I click the "Generate Summary" button for "To Kill a Mockingbird"
    And I set the style to "Bullet Points"
    And I set the length to "Long"
    And I click "Generate"
    Then the generated summary should use bullet point style
    And the summary should be approximately 1 page per chapter

  Scenario: Summary appears in library
    Given I have generated 3 summaries
    When I navigate to "My Summaries"
    Then I should see 3 summary cards
    And each card should show book title, author, style, and date
    When I click "Download" on the first summary
    Then a PDF file should download
```

#### 4. Workflow

**Step 1: Create Tests on Master Branch**
```bash
git checkout master
# Install Playwright
cd tests && yarn add -D @playwright/test @cucumber/cucumber
# Write features and step definitions
# Run tests to ensure they pass against current Mantine UI app
yarn test:e2e
```

**Step 2: Switch to NativeWind Branch**
```bash
git checkout nativewind-pivot
# Continue refactoring components
# Run same test suite
yarn test:e2e
```

**Step 3: Validate Feature Parity**
- Tests run against both implementations
- Same Gherkin scenarios work for both UIs
- Any failing tests identify missing functionality
- Fix issues until all tests pass

#### 5. Benefits

1. **Ground Truth Documentation**
   - Gherkin scenarios describe actual user flows in plain English
   - Product managers and designers can read and validate

2. **Regression Safety**
   - Ensures NativeWind app maintains all Mantine UI functionality
   - Catches UI/UX differences early

3. **Behavioral Specification**
   - Tests describe what the app should do, not how it's built
   - Implementation-agnostic (works for Mantine, NativeWind, or future rewrites)

4. **Cross-Platform Validation**
   - Same tests can run against web, iOS, Android
   - Consistent behavior across all platforms

5. **Future-Proof**
   - Tests serve as living documentation
   - Can be reused for future migrations or refactors

---

## Key Design Decisions

### 1. NativeWind Over GlueStack Provider
**Decision:** Use NativeWind className utilities directly, avoid GluestackUIProvider

**Reason:** GluestackUIProvider caused React hooks errors due to dependency conflicts. NativeWind alone provides all needed styling without provider overhead.

**Trade-off:** Lost some GlueStack component abstractions, but gained:
- Simpler architecture
- No provider conflicts
- Direct Tailwind utility access
- Smaller bundle size (751 vs 1901 modules)

### 2. Maintain Component APIs
**Decision:** Keep all component props and interfaces identical

**Reason:** Minimizes refactoring work on consumer components. Only internal implementation changes.

**Example:**
```tsx
// API stays the same
<Button
  title="Submit"
  variant="primary"
  size="lg"
  onPress={handleSubmit}
  loading={isLoading}
/>
```

### 3. Theme Hook as Optional
**Decision:** Remove theme hook from components, but keep `theme/` directory for reference

**Reason:**
- Components don't need theme hook with NativeWind
- Theme tokens still useful for documentation
- Can be used for edge cases requiring inline styles

---

## Git Configuration

### .gitignore Updates
Fixed monorepo .gitignore to properly ignore all node_modules:

```gitignore
# Before (only ignored root)
/node_modules

# After (ignores all recursively)
node_modules/

# Added Expo ignores
.expo/
.expo-shared/
dist/
web-build/
```

### Untracked node_modules Files
Removed 23 accidentally-tracked node_modules files from git:
```bash
git rm --cached -r apps/api/node_modules packages/*/node_modules
```

---

## Current Project Status

### Running Services
- **Metro Bundler:** Running on http://localhost:8081
- **Modules Loaded:** 751 (optimized, down from 1901)
- **App Status:** ✅ Rendering successfully with "Welcome to Megyk Books"

### Dependencies
**Root:**
- Yarn resolutions enforcing React 19.1.0, React DOM 19.1.0

**Expo App:**
- `nativewind@4.2.1` - Tailwind for React Native
- `tailwindcss@4.1.17` - Tailwind CSS v4
- `@gluestack-style/react@1.0.57` - (unused but installed)
- `@gluestack-ui/nativewind-utils@1.0.28` - (unused but installed)
- `react@19.1.0`, `react-native@0.81.5`
- `expo@~54.0.25`, `expo-router@^6.0.15`

---

## Commands Reference

```bash
# Development
cd apps/expo && yarn web              # Start Expo web dev server

# Check for nested React (troubleshooting)
find node_modules -name "react" -type d | grep node_modules/.*node_modules

# Remove problematic nested packages
rm -rf node_modules/use-sync-external-store/node_modules
rm -rf node_modules/react-remove-scroll/node_modules

# Git
git status --short                    # Check uncommitted changes
git add . && git commit -m "..."     # Commit progress
git checkout master                   # Switch to master for tests
git checkout nativewind-pivot        # Return to NativeWind work
```

---

## Next Steps

### Immediate (Current Session)
1. ✅ Document current progress in this file
2. ⬜ Switch to `master` branch
3. ⬜ Set up Playwright + Cucumber/Gherkin test framework
4. ⬜ Write Gherkin features for all user flows
5. ⬜ Implement step definitions and page objects
6. ⬜ Run tests against Mantine UI app (establish baseline)

### After Integration Tests
7. ⬜ Switch back to `nativewind-pivot` branch
8. ⬜ Continue refactoring remaining 34 components
9. ⬜ Run integration tests to validate feature parity
10. ⬜ Fix any failing tests (missing functionality)
11. ⬜ Complete all 40 component refactors

### Testing Priority Order
1. Authentication flows (signin, signup, confirm)
2. Book library browsing and filtering
3. Summary generation with preferences
4. My Summaries (view, download, delete)
5. User preferences management
6. Navigation and routing

---

## Progress Tracking

**Components Refactored:** 6/40 (15%)
**Phases Complete:** 2/7 (Phase 1: Monorepo, Phase 2: Expo Setup)
**Current Phase:** Phase 3 - Component Refactoring
**Next Milestone:** Integration test suite creation

**Estimated Remaining Work:**
- 34 components to refactor: ~8-12 hours
- Integration tests: ~4-6 hours
- Testing and validation: ~4-6 hours
- **Total:** ~16-24 hours

---

## Lessons Learned

### React Hooks Bug
**Problem:** Multiple React instances from nested node_modules
**Solution:** Remove nested node_modules folders manually
**Prevention:** Yarn resolutions alone not enough; need to verify with `find` command

### GlueStack Provider Issues
**Problem:** Provider caused React hooks conflicts
**Solution:** Use NativeWind directly without provider
**Lesson:** Simpler is often better; providers add complexity

### Component API Design
**Success:** Maintaining identical APIs makes refactoring transparent to consumers
**Lesson:** Internal implementation can change freely when interfaces stay stable

---

**Last Updated:** 2025-11-30 16:48 EST
**Branch:** `nativewind-pivot`
**Status:** ✅ App running successfully, ready for test suite creation
