# SUT Gap Analysis: Gherkin Requirements vs Expo App Reality

**Date**: December 1, 2025
**Branch**: `test-integration`
**Purpose**: Identify what needs to be built to align the React Native app with Gherkin specifications

---

## Executive Summary

The Gherkin feature files define **comprehensive user journeys** across authentication, book library, and summary management. The current Expo React Native app has **only a single demo/showcase page** with UI component examples.

**Gap Summary:**
- **0 of 3 required feature areas** are implemented
- **0 of 8 required screens/routes** exist
- **Components exist** but are not wired into functional screens
- **API integration** is stubbed but not connected

---

## Feature 1: Authentication

### Gherkin Requirements

**Scenarios Covered (7 total):**
1. Unauthenticated user sees landing page
2. User navigates to sign in from landing page
3. User navigates to sign in from Get Started
4. User signs in with valid credentials
5. User signs in with invalid credentials
6. User signs in with unconfirmed email
7. User navigates to sign up page
8. Authenticated user is redirected from home page

**Required UI Elements:**

**Landing Page (`/`):**
- Hero section with "Book Summaries" title
- "Get Started" button → redirects to sign in
- "Sign In" button → redirects to sign in
- Should redirect authenticated users to dashboard

**Sign In Page (`/auth/signin`):**
- Page title "Sign In"
- Email input field (`input[type="email"]`)
- Password input field (`input[type="password"]`)
- Submit button (`button[type="submit"]`)
- "Sign up" link → redirects to sign up page
- Error message display for invalid credentials
- Specific error for unconfirmed email with inbox message
- Redirect to `/dashboard/library` on success

**Sign Up Page (`/auth/signup`):**
- Page title "Sign Up"
- Email and password input fields
- Submit button
- Link back to sign in

### Current Expo App Status

**What Exists:**
- ✅ `apps/expo/components/ui/Input.tsx` - Text input component
- ✅ `apps/expo/components/ui/Button.tsx` - Button component

**What's Missing:**
- ❌ Landing page with authentication CTAs
- ❌ `/auth/signin` route
- ❌ `/auth/signup` route
- ❌ Supabase auth integration (client setup exists but not used)
- ❌ Form validation
- ❌ Error message handling
- ❌ Authentication state management
- ❌ Protected route middleware
- ❌ Redirect logic for authenticated users

### Gap Assessment

**Severity**: 🔴 Critical - 0% implemented
**Effort**: High - Requires 3 new screens + auth flow + state management

---

## Feature 2: Book Library

### Gherkin Requirements

**Scenarios Covered (11 total):**
1. User views the book library
2. User sorts books by title
3. User sorts books by author
4. User sorts books by genre
5. User sorts books by publication year
6. User navigates through paginated books
7. User clicks book cover to get summary
8. User clicks "Get Summary" for book with default summary
9. User clicks "Customize" to generate custom summary
10. User generates custom summary for book without default
11. User views book details in mobile/desktop view
12. Library shows empty state when no books exist
13. Library displays book count correctly

**Required UI Elements:**

**Library Page (`/dashboard/library`):**
- Page title "Discover Books"
- **Desktop View (Table Layout):**
  - Sortable columns: Title, Author, Genre, Year
  - Clickable book covers in rows
  - Action buttons per row
- **Mobile View (Card Layout):**
  - Book cover image
  - Title, author, description
  - Genre badge
  - Action buttons
- **Pagination:**
  - Page indicator (e.g., "page 2")
  - Page navigation buttons
  - Book count display: "Showing 10 of 25 books"
- **Empty State:**
  - "No books available yet" message
- **Book Actions:**
  - "Get Summary" button
  - "Customize" button (for books with defaults)
  - Clicking cover opens summary modal/download

### Current Expo App Status

**What Exists:**
- ✅ `apps/expo/components/ui/Card.tsx` - Card component
- ✅ `apps/expo/components/ui/Badge.tsx` - Badge component
- ✅ `apps/expo/components/ui/Button.tsx` - Button component
- ✅ `apps/expo/components/dashboard/DashboardLayout.tsx` - Layout wrapper
- ✅ `apps/expo/components/dashboard/MainNavigation.tsx` - Sidebar navigation

**What's Missing:**
- ❌ `/dashboard/library` route
- ❌ Book data fetching from API
- ❌ Sortable table/list component
- ❌ Pagination component
- ❌ Responsive layout switching (table vs cards)
- ❌ Book cover image rendering
- ❌ "Get Summary" action handlers
- ❌ "Customize" action handlers
- ❌ Empty state view
- ❌ Book count display logic

### Gap Assessment

**Severity**: 🔴 Critical - 0% implemented
**Effort**: Very High - Requires data layer + complex UI + responsive design

---

## Feature 3: Summary Generation and Management

### Gherkin Requirements

**Scenarios Covered (12 total):**
1. User opens generate summary modal
2. User views summary customization options
3. User generates summary with default preferences
4. User generates summary with custom settings
5. User views their summaries
6. User downloads a previously generated summary
7. User deletes a generated summary
8. User views empty summaries page
9. User generates multiple summaries for the same book
10. User updates their default preferences
11. Summary generation handles long processing time
12. Summary generation displays metadata
13. User navigates from summary back to book library

**Required UI Elements:**

**Generate Summary Modal:**
- Book title and author display
- **Style Options (Slider or Radio):**
  - Narrative
  - Bullet Points
  - Workbook
- **Length Options (Slider or Radio):**
  - Short (1 sentence/chapter)
  - Medium (1 paragraph/chapter)
  - Long (1 page/chapter)
- "Generate Summary" button
- Loading indicator during generation
- PDF download trigger on completion
- Default to user's saved preferences

**My Summaries Page (`/dashboard/summaries`):**
- Page title
- **Summary List (Grid or Table):**
  - Book title and author
  - Style badge (Narrative/Bullet Points/Workbook)
  - Length badge (Short/Medium/Long)
  - Creation date/timestamp
  - Generation time (if available)
  - "Download" button
  - "Delete" button
- **Empty State:**
  - "No summaries yet" message
  - Suggestion to visit library
- Delete confirmation and success message

**Preferences Page (`/dashboard/preferences`):**
- Default style selector
- Default length selector
- Save button
- Confirmation message on save

### Current Expo App Status

**What Exists:**
- ✅ `apps/expo/components/summary/GenerateSummaryModal.tsx` - Modal component with sliders
- ✅ `apps/expo/components/ui/Modal.tsx` - Modal wrapper
- ✅ `apps/expo/components/ui/Button.tsx` - Button component
- ✅ `apps/expo/components/ui/Badge.tsx` - Badge component
- ✅ `apps/expo/components/ui/Card.tsx` - Card component

**What's Missing:**
- ❌ `/dashboard/summaries` route (or `/dashboard/collection`)
- ❌ `/dashboard/preferences` route
- ❌ API integration for summary generation
- ❌ API integration for fetching user summaries
- ❌ API integration for downloading summaries
- ❌ API integration for deleting summaries
- ❌ User preferences loading from API
- ❌ User preferences saving to API
- ❌ PDF download handling in React Native
- ❌ Loading states during generation
- ❌ Error handling for failed generations
- ❌ Empty state views
- ❌ Summary list rendering
- ❌ Delete confirmation modal

### Gap Assessment

**Severity**: 🟡 Medium - 20% implemented (modal exists but not wired up)
**Effort**: High - API integration + 2 new screens + state management

---

## Component Inventory

### ✅ Existing Components (Available but Not Used)

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| `GenerateSummaryModal` | `apps/expo/components/summary/` | Summary customization modal | ✅ Built, needs API integration |
| `DashboardLayout` | `apps/expo/components/dashboard/` | Layout with sidebar | ✅ Built, needs screens to wrap |
| `MainNavigation` | `apps/expo/components/dashboard/` | Sidebar navigation | ✅ Built, links need real routes |
| `Button` | `apps/expo/components/ui/` | Button component | ✅ Ready |
| `Input` | `apps/expo/components/ui/` | Text input | ✅ Ready |
| `Badge` | `apps/expo/components/ui/` | Badge/tag component | ✅ Ready |
| `Card` | `apps/expo/components/ui/` | Card container | ✅ Ready |
| `Modal` | `apps/expo/components/ui/` | Modal wrapper | ✅ Ready |
| `Container` | `apps/expo/components/layout/` | Responsive container | ✅ Ready |
| `HStack` | `apps/expo/components/layout/` | Horizontal stack | ✅ Ready |
| `VStack` | `apps/expo/components/layout/` | Vertical stack | ✅ Ready |

### ❌ Missing Components

- Sortable table component
- Pagination component
- Form validation component
- Error message component
- Loading spinner/skeleton component
- Empty state component
- Confirmation dialog component

---

## Route Inventory

### Required Routes (from Gherkin)

| Route | Feature | Priority | Status |
|-------|---------|----------|--------|
| `/` | Landing page with auth CTAs | 🔴 Critical | ❌ Not implemented |
| `/auth/signin` | Sign in form | 🔴 Critical | ❌ Not implemented |
| `/auth/signup` | Sign up form | 🔴 Critical | ❌ Not implemented |
| `/dashboard/library` | Book browsing | 🔴 Critical | ❌ Not implemented |
| `/dashboard/summaries` | My Summaries list | 🔴 Critical | ❌ Not implemented |
| `/dashboard/preferences` | User preferences | 🟡 Medium | ❌ Not implemented |
| `/dashboard/profile` | User profile | 🟢 Low | ❌ Not implemented |
| `/auth/confirm` | Email confirmation callback | 🟡 Medium | ❌ Not implemented |

### Current Routes

| Route | Screen | Purpose |
|-------|--------|---------|
| `/` | `apps/expo/app/index.tsx` | Demo/showcase page with component examples |

**Total Routes:** 1 implemented, 8 required = **12.5% coverage**

---

## API Integration Status

### Required API Endpoints (from CLAUDE.md)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/books` | GET | Fetch books list | ❌ Not called |
| `/api/v1/summary` | POST | Generate summary | ❌ Not called |
| `/api/v1/summaries` | GET | Fetch user summaries | ❌ Not called |
| `/api/v1/summaries/[id]/download` | GET | Download summary PDF | ❌ Not called |
| `/api/v1/summaries/[id]` | DELETE | Delete summary | ❌ Not called |
| `/api/v1/profile` | GET | Get user profile | ❌ Not called |
| `/api/v1/profile` | PUT | Update preferences | ❌ Not called |
| Supabase Auth | - | Sign in/sign up | ❌ Not integrated |

**Note:** API server exists (`apps/api`) but Expo app does not consume it.

---

## Critical Path to Baseline

To achieve 79/79 passing tests, these items must be built in priority order:

### Phase 1: Authentication Foundation (Blocks all tests)
**Priority**: 🔴 Critical
**Blockers**: Auth setup test failure blocks all 78 other tests

1. **Create `/auth/signin` route**
   - Email/password input fields
   - Submit button
   - Integrate with Supabase auth
   - Error handling
   - Redirect to `/dashboard/library` on success

2. **Create `/auth/signup` route**
   - Email/password/confirm password fields
   - Submit button
   - Supabase signup integration
   - Email verification handling

3. **Create landing page (`/`)**
   - Hero with "Book Summaries" title
   - "Get Started" and "Sign In" buttons
   - Redirect authenticated users to dashboard

4. **Add authentication state management**
   - Supabase session handling
   - Protected route wrapper
   - Auth context provider

**Estimated Effort**: 3-5 days
**Test Impact**: Unblocks all 78 tests

### Phase 2: Core Dashboard Screens
**Priority**: 🔴 Critical
**Blockers**: 26+ tests expect these screens

5. **Create `/dashboard/library` route**
   - Fetch books from API
   - Display in responsive layout (table/cards)
   - "Get Summary" buttons
   - Book cover images
   - Open GenerateSummaryModal on action

6. **Create `/dashboard/summaries` route**
   - Fetch user's summaries from API
   - Display in grid/list
   - Download buttons
   - Delete buttons with confirmation

7. **Wire up GenerateSummaryModal**
   - Call `/api/v1/summary` POST
   - Handle loading state
   - Trigger PDF download
   - Error handling

**Estimated Effort**: 5-7 days
**Test Impact**: Unblocks library and summary tests

### Phase 3: Preferences and Polish
**Priority**: 🟡 Medium

8. **Create `/dashboard/preferences` route**
   - Style and length selectors
   - Save to API
   - Load user's current preferences

9. **Create `/dashboard/profile` route**
   - User info display
   - Profile editing

10. **Add sorting and pagination to library**
    - Sortable columns
    - Pagination controls
    - Book count display

**Estimated Effort**: 2-3 days
**Test Impact**: Completes remaining edge case tests

### Phase 4: Test Adaptation
**Priority**: 🔴 Critical
**Blockers**: Step definitions expect HTML DOM

11. **Update step definitions for React Native DOM**
    - Replace `input[type="email"]` with React Native selectors
    - Replace `button[type="submit"]` with React Native selectors
    - Replace table selectors with React Native FlatList/View selectors
    - Test on React Native Web rendering

**Estimated Effort**: 2-4 days
**Test Impact**: Required for all tests to pass

---

## Terminology Alignment

### Current Naming vs Gherkin Expectations

| Gherkin Term | Current Expo App | Recommendation |
|--------------|------------------|----------------|
| "My Summaries" | N/A (user mentioned "Collection") | Use "My Summaries" per Gherkin |
| "Library" | N/A | Use "Library" per Gherkin |
| "Discover Books" | N/A | Use as page title for library |
| "Generate Summary" | ✅ Modal exists | Keep naming |
| "Preferences" | N/A | Use "Preferences" per Gherkin |

**Decision Required**: Follow Gherkin naming as ground truth, or update Gherkin?

---

## Recommendations

### Option A: Build to Match Gherkin (Recommended)
**Approach**: Treat Gherkin as ground truth, build missing screens to spec.

**Pros:**
- Tests pass immediately after screen implementation
- Clear requirements already documented
- Faster to baseline (no test rewriting)

**Cons:**
- More SUT work upfront
- May duplicate some Next.js functionality

**Estimated Timeline**: 2-3 weeks to 100% baseline

### Option B: Update Gherkin to Match New Vision
**Approach**: Revise Gherkin scenarios for new app design, then build.

**Pros:**
- Opportunity to improve UX
- Fresh start with React Native patterns

**Cons:**
- Requires re-documenting requirements
- Delays baseline achievement
- Tests still need adaptation to React Native DOM

**Estimated Timeline**: 3-4 weeks to 100% baseline

### Option C: Hybrid Approach
**Approach**: Keep core user journeys from Gherkin, simplify complex scenarios.

**Pros:**
- Balances speed and quality
- Keeps critical paths tested

**Cons:**
- Requires careful decision-making per scenario
- Some tests may be temporarily skipped

**Estimated Timeline**: 2-3 weeks to 90% baseline, 4 weeks to 100%

---

## Next Steps

1. **User Decision**: Choose Option A, B, or C approach
2. **If Option A**: Begin Phase 1 (Authentication Foundation)
3. **If Option B**: Schedule requirements review session
4. **If Option C**: Identify which scenarios to keep vs revise

**Immediate Action**: Await user direction on approach before proceeding with implementation.
