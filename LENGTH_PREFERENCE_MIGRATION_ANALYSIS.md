# Length Preference Migration Analysis

## Change Overview

**Current Format**: `"1pg"`, `"5pg"`, `"15pg"`  
**New Format**: `"short"`, `"medium"`, `"long"`

## Complexity Assessment: **MODERATE** ⚠️

This change requires updates across multiple layers but is **manageable** with proper migration planning.

---

## Impact Areas

### 1. Database Changes 🔴 **REQUIRED**

#### A. `user_profiles` Table (JSONB)
- **Current**: Default value `'{"style": "narrative", "length": "5pg"}'`
- **Impact**: JSONB field stores length as string
- **Migration Needed**: ✅ Yes - Update existing records + default values

#### B. `summaries` Table (VARCHAR)
- **Current**: `length VARCHAR(50) NOT NULL` stores values like "1pg", "5pg", "15pg"
- **Impact**: Existing summary records have old format
- **Migration Needed**: ✅ Yes - Data migration for existing records

#### C. Database Functions
- **Function**: `handle_new_user()` in `001_create_user_profiles.sql`
- **Current**: Hardcoded `'{"style": "narrative", "length": "5pg"}'`
- **Migration Needed**: ✅ Yes - Update function

---

### 2. Type Definitions 🔴 **REQUIRED**

**File**: `lib/types/preferences.ts`
- **Current**: `export type SummaryLength = '1pg' | '5pg' | '15pg'`
- **Change**: `export type SummaryLength = 'short' | 'medium' | 'long'`
- **Impact**: TypeScript type safety
- **Files Affected**: All files importing this type

**File**: `lib/types/preferences.ts` - `SUMMARY_LENGTH_OPTIONS`
- **Current**:
  ```typescript
  { value: '1pg', label: 'Short', description: 'One sentence per chapter' },
  { value: '5pg', label: 'Medium', description: 'One paragraph per chapter' },
  { value: '15pg', label: 'Long', description: 'One page per chapter' }
  ```
- **Change**: Update values to `'short'`, `'medium'`, `'long'`
- **Impact**: All UI components using these options

---

### 3. API Endpoints 🔴 **REQUIRED**

#### A. `/api/v1/profile` (GET/PUT)
**File**: `app/api/v1/profile/route.ts`
- **Line 97**: Validation array `['1pg', '5pg', '15pg']`
- **Line 40**: `DEFAULT_PREFERENCES` uses `'5pg'`
- **Change**: Update validation and defaults

#### B. `/api/v1/summary` (POST)
**File**: `app/api/v1/summary/route.ts`
- **Line 47**: Passes `preferences.length` to webhook
- **Line 107**: Saves `length` to summaries table
- **Impact**: Webhook receives new format, database stores new format
- **Note**: ⚠️ **External dependency** - n8n webhook must handle new format

#### C. `/api/v1/dashboard/stats` (GET)
**File**: `app/api/v1/dashboard/stats/route.ts`
- **Lines 98-102**: `timeMap` with reading time estimates
  ```typescript
  const timeMap: Record<string, number> = {
    '1pg': 3,
    '5pg': 15,
    '15pg': 45
  }
  ```
- **Change**: Update keys to `'short'`, `'medium'`, `'long'`
- **Impact**: Reading time calculations

---

### 4. React Components (Next.js App) 🔴 **REQUIRED**

#### A. `components/preferences/PreferencesForm.tsx`
- Uses `SUMMARY_LENGTH_OPTIONS` for UI
- Caches preferences in `sessionStorage`
- **Impact**: UI displays new values, cache compatibility

#### B. `components/summary/GenerateSummaryModal.tsx`
- Uses `SUMMARY_LENGTH_OPTIONS` for slider
- Fetches and caches preferences
- **Impact**: Modal displays new format

#### C. `components/onboarding/OnboardingWizard.tsx`
- Uses `SUMMARY_LENGTH_OPTIONS` for onboarding
- **Impact**: New users see new format

#### D. `app/dashboard/page.tsx`
- **Line 347**: `getLengthLabel()` function maps values to labels
- **Impact**: Display logic needs update

#### E. `app/dashboard/summaries/page.tsx`
- **Line 120**: `getLengthLabel()` function
- **Impact**: Summary list display

---

### 5. External Dependencies ⚠️ **CRITICAL**

#### n8n Webhook (`get_summary_v2`)
- **Current**: Receives `preferences.length` as `"1pg"`, `"5pg"`, or `"15pg"`
- **Change**: Will receive `"short"`, `"medium"`, or `"long"`
- **Impact**: ⚠️ **BREAKING CHANGE** - Webhook workflow must be updated
- **Action Required**: Update n8n workflow to handle new format

---

### 6. Database Migrations 🔴 **REQUIRED**

#### Migration Strategy

**Option 1: Data Migration (Recommended)**
1. Create migration to update existing records
2. Update `user_profiles.preferences` JSONB
3. Update `summaries.length` VARCHAR
4. Update default values and functions

**Option 2: Dual Support (Temporary)**
1. Support both formats temporarily
2. Migrate data gradually
3. Remove old format support later

---

### 7. Test Files 🟡 **REQUIRED**

#### E2E Tests
- `tests/e2e/playwright/profile.auth.spec.ts`
  - Line 82: Checks for `input[value*="1pg"]`
  - **Change**: Update selectors

#### Test Data
- Any hardcoded test data with `"1pg"`, `"5pg"`, `"15pg"`
- **Files to check**: Test fixtures, mock data

---

### 8. Documentation 🟡 **RECOMMENDED**

- `CLAUDE.md` - Update examples
- `IMPLEMENTATION_NOTES.md` - Update format documentation
- `DEPLOYMENT_CHECKLIST.md` - Update validation examples
- `MVP_COMPLETION_SUMMARY.md` - Update reading time estimates

---

## Migration Checklist

### Phase 1: Preparation
- [ ] Update n8n webhook workflow to accept new format
- [ ] Create database migration script
- [ ] Backup existing data

### Phase 2: Code Changes
- [ ] Update `lib/types/preferences.ts` type definition
- [ ] Update `SUMMARY_LENGTH_OPTIONS` array
- [ ] Update `DEFAULT_PREFERENCES`
- [ ] Update API validation (`app/api/v1/profile/route.ts`)
- [ ] Update stats calculation (`app/api/v1/dashboard/stats/route.ts`)
- [ ] Update all React components using length options
- [ ] Update display functions (`getLengthLabel`)

### Phase 3: Database Migration
- [ ] Create migration to update `user_profiles.preferences`
- [ ] Create migration to update `summaries.length`
- [ ] Update `handle_new_user()` function default
- [ ] Update default value in `user_profiles` table

### Phase 4: Testing
- [ ] Update E2E tests
- [ ] Test preference saving/loading
- [ ] Test summary generation with new format
- [ ] Test reading time calculations
- [ ] Test webhook integration
- [ ] Verify existing summaries still display correctly

### Phase 5: Documentation
- [ ] Update API documentation
- [ ] Update developer documentation
- [ ] Update deployment checklist

---

## Risk Assessment

### High Risk Areas ⚠️
1. **n8n Webhook** - External dependency, must be updated first
2. **Existing Data** - Existing summaries and user preferences need migration
3. **Reading Time Calculations** - Stats API depends on length values

### Medium Risk Areas
1. **Session Storage Cache** - Cached preferences may have old format
2. **Type Safety** - TypeScript will catch most issues, but runtime data may differ

### Low Risk Areas
1. **UI Components** - Mostly use constants, easy to update
2. **Documentation** - Non-critical, can be updated later

---

## Estimated Effort

- **Database Migration**: 2-3 hours
- **Code Updates**: 3-4 hours
- **Testing**: 2-3 hours
- **Webhook Update**: 1-2 hours (external)
- **Total**: ~8-12 hours

---

## Recommended Approach

### Step 1: Coordinate with External Systems
1. **First**: Update n8n webhook to accept both formats (backward compatible)
2. **Then**: Update codebase to send new format
3. **Finally**: Remove old format support from webhook

### Step 2: Database Migration
1. Create migration script that:
   - Updates `user_profiles.preferences` JSONB
   - Updates `summaries.length` VARCHAR
   - Updates default values
   - Updates functions

### Step 3: Code Updates
1. Update type definitions
2. Update API validations
3. Update components
4. Update display functions

### Step 4: Testing
1. Test with new data
2. Test migration of existing data
3. Test webhook integration
4. Test reading time calculations

---

## Files Requiring Changes

### Core Files (Must Change)
1. `lib/types/preferences.ts` - Type definition + constants
2. `app/api/v1/profile/route.ts` - Validation + defaults
3. `app/api/v1/dashboard/stats/route.ts` - Reading time map
4. `app/api/v1/summary/route.ts` - Webhook payload (format change)
5. `components/preferences/PreferencesForm.tsx` - UI component
6. `components/summary/GenerateSummaryModal.tsx` - UI component
7. `components/onboarding/OnboardingWizard.tsx` - UI component
8. `app/dashboard/page.tsx` - Display function
9. `app/dashboard/summaries/page.tsx` - Display function

### Database Migrations (Must Create)
1. New migration file to update existing data
2. Update `001_create_user_profiles.sql` defaults (or create new migration)

### Test Files (Should Update)
1. `tests/e2e/playwright/profile.auth.spec.ts` - Selector updates

### Documentation (Should Update)
1. `CLAUDE.md`
2. `IMPLEMENTATION_NOTES.md`
3. `DEPLOYMENT_CHECKLIST.md`
4. `MVP_COMPLETION_SUMMARY.md`

---

## Conclusion

**Complexity**: **MODERATE** ⚠️

This change is **manageable** but requires:
- ✅ Careful coordination with external webhook
- ✅ Database migration for existing data
- ✅ Systematic code updates across multiple files
- ✅ Thorough testing

**Recommendation**: Plan for a **coordinated deployment** where:
1. Webhook supports both formats first (backward compatible)
2. Codebase is updated to send new format
3. Database is migrated
4. Old format support is removed from webhook

**Estimated Timeline**: 1-2 days including testing and coordination.

