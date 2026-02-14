# Summary Generation Wizard - Implementation Notes

## What Was Implemented

A complete MVP flow for generating personalized book summaries with user preference overrides.

### Components Created

1. **GenerateSummaryModal** (`components/summary/GenerateSummaryModal.tsx`)
   - Modal wizard for summary generation
   - Loads user's saved preferences by default
   - Allows override of style and length preferences
   - Matches the design of the Preferences page
   - Shows success notification on generation start

2. **API Endpoint** (`app/api/v1/summary/route.ts`)
   - POST endpoint that accepts `book_id` and `preferences`
   - Calls n8n webhook with the payload
   - Skips auth check (as requested, since auth is TBD)
   - Returns detailed error messages for debugging

3. **Library Integration** (`app/dashboard/library/page.tsx`)
   - "Generate Summary" button opens the wizard modal
   - Passes selected book to the modal

## Webhook Payload Structure

When a user clicks "Generate Summary", the following JSON payload is sent to the n8n webhook:

```json
{
  "book_id": "string",
  "preferences": {
    "style": "narrative" | "bullet_points" | "workbook",
    "length": "short" | "medium" | "long"
  },
  "user_id": "anonymous",
  "timestamp": "2025-10-19T23:55:00.000Z"
}
```

## Environment Variable Required

Make sure `.env.local` has the n8n webhook URL configured:

```bash
N8N_WEBHOOK_URL=https://n8n.megyk.com/webhook-test/get_summary_v2
```

## Testing the Flow

### 1. Start the Development Server
```bash
yarn dev
```

### 2. Navigate to Library
- Go to `http://localhost:3001/dashboard/library`
- You should see the book library table

### 3. Click "Generate Summary"
- Click the "Generate Summary" button on any book row
- The wizard modal will open

### 4. Adjust Preferences (Optional)
- The sliders will be pre-populated with your saved preferences
- You can adjust the style and length for this specific generation
- See the real-time preview of your selections

### 5. Generate
- Click the "Generate Summary" button in the modal
- The app will call `/api/v1/summary` which forwards to n8n
- A success notification will appear (green toast)
- The modal will close automatically

## Current Behavior - Synchronous PDF Download

The app now supports **immediate PDF download** for the best demo experience:

1. User clicks "Generate Summary" in the wizard
2. Modal shows loading state with message: "This may take a few moments..."
3. Next.js API calls n8n webhook and **waits** for the response
4. n8n generates the PDF and returns it as binary data
5. Next.js streams the PDF to the browser
6. Browser automatically downloads the PDF
7. Success notification shows: "Summary Generated!"

### n8n Configuration Required

For this to work, your n8n workflow must:

1. **Accept POST requests** at the webhook URL ✅
2. **Return PDF binary** with `Content-Type: application/pdf` header
3. **Respond synchronously** (don't use async processing)

Currently, n8n is returning JSON `{}` instead of PDF. To fix:

- In your n8n workflow, make sure the final node returns the PDF file directly
- Set the response content type to `application/pdf`
- The workflow should NOT return JSON if generating synchronously

### Fallback Behavior

If n8n returns JSON instead of PDF, the app will:
- Show "Summary Generation Started" notification
- Work as async (user would need to check back later)
- This maintains backward compatibility

## Testing with curl

You can test the API endpoint directly:

```bash
curl -X POST http://localhost:3001/api/v1/summary \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "test-book-123",
    "preferences": {
      "style": "narrative",
      "length": "medium"
    }
  }'
```

## Next Steps for Client

1. **Set up n8n workflow** at `https://n8n.megyk.com/webhook-test/get_summary_v2`
   - Configure it to accept POST requests
   - Process the `book_id` and `preferences` from the payload
   - Return a JSON response (structure TBD)

2. **Test with real books** once books are added to the database

3. **Optional enhancements** (for future sprints):
   - Add loading states/progress indicators
   - Store summary requests in database
   - Add summary status tracking
   - Implement real-time notifications when summary is ready
   - Add authentication flow

## UTM Tracking Implementation

### Overview
Complete UTM parameter tracking system for marketing campaign attribution. UTM parameters are captured, persisted across sessions, and included in n8n webhooks for both signup and email verification events.

### Components Created

1. **UTM Utilities** (`lib/utils/utm.ts`)
   - Parse UTM parameters from URL search params
   - Cookie management for 30-day persistence
   - Server-side UTM extraction from cookies
   - Supports all standard UTM parameters: source, medium, campaign, term, content

2. **React Hook** (`hooks/useUTMTracking.ts`)
   - Client-side UTM parameter detection and storage
   - Automatic cookie persistence when UTM params are found
   - Retrieves stored UTM data when no params in current URL
   - Provides clearUTM function for cleanup

3. **API Endpoint** (`app/api/utm/route.ts`)
   - Optional endpoint for server-side UTM processing
   - Sets cookies with proper expiration and security flags
   - Returns UTM data for validation

### Integration Points

1. **Signup Webhook** (`app/auth/signup/page.tsx:64`)
   - UTM parameters automatically included in signup webhook payload
   - Uses `useUTMTracking` hook to get stored UTM data
   - Graceful handling if no UTM parameters exist

2. **Verification Webhook** (`app/auth/confirm/route.ts:56`)
   - UTM parameters included in email verification webhook
   - Uses server-side `getUTMFromCookies` for persistence
   - Maintains attribution through email verification flow

### Webhook Payload Structure

Both signup and verification webhooks now include UTM data:

```json
{
  "event": "user_signup" | "user_verified",
  "email": "user@example.com",
  "user_id": "123",
  "utm": {
    "utm_source": "google",
    "utm_medium": "cpc", 
    "utm_campaign": "book-summaries",
    "utm_term": "ai book summary",
    "utm_content": "ad-variant-a"
  }
}
```

### Usage Examples

**Marketing Campaign URLs:**
```
https://megyk.com?utm_source=google&utm_medium=cpc&utm_campaign=book-summaries
https://megyk.com?utm_source=facebook&utm_medium=social&utm_campaign=summer-promo
```

**Attribution Flow:**
1. User visits site with UTM parameters
2. Parameters stored in cookies for 30 days
3. User signs up → UTM data sent to n8n
4. User verifies email → UTM data sent again for complete funnel tracking

### Technical Details

- **Cookie Storage:** 30-day expiration with SameSite=Lax
- **Client-side:** Uses Next.js `useSearchParams` hook
- **Server-side:** Uses Next.js `cookies()` for SSR compatibility
- **Error Handling:** Graceful fallbacks if UTM parsing fails
- **Privacy:** No PII stored, only campaign attribution data

## Files Modified

- ✅ `components/summary/GenerateSummaryModal.tsx` (NEW)
- ✅ `app/api/v1/summary/route.ts` (UPDATED - webhook integration)
- ✅ `app/dashboard/library/page.tsx` (UPDATED - modal integration)
- ✅ `lib/utils/utm.ts` (NEW - UTM utilities)
- ✅ `hooks/useUTMTracking.ts` (NEW - client-side UTM tracking)
- ✅ `app/api/utm/route.ts` (NEW - UTM API endpoint)
- ✅ `app/auth/signup/page.tsx` (UPDATED - UTM integration)
- ✅ `app/auth/confirm/route.ts` (UPDATED - UTM integration)

## Referral System Implementation

### Overview

A referral/sharing system where users earn Megyk Credits (MC) when friends sign up AND activate their accounts. Activation is triggered by the user's first chat message or first summary generation.

### Reward Structure

| Recipient | Amount | Trigger |
|-----------|--------|---------|
| Referrer (inviter) | 1,500 MC | When invitee activates |
| Referred (invitee) | 1,000 MC | On activation (+ 500 MC signup bonus = 1,500 MC total) |

### Activation Triggers

- First chat message sent, OR
- First summary generated (whichever comes first)
- One-time only: Each user can only be referred once

### Database Schema

**Tables Created** (`supabase/migrations/016_create_referral_system.sql`):

1. **`referral_codes`** - Unique 8-character code per user
   - Auto-generated on signup via trigger
   - Uses alphanumeric chars excluding confusing ones (0, O, I, 1, L)
   - Tracks total_referrals and successful_referrals counts

2. **`referrals`** - Tracks referrer→referred relationships
   - Status: `pending`, `completed`, `expired`
   - Activation type: `chat` or `summary`
   - Unique constraint on referred_id (one referral per user)
   - Check constraint prevents self-referral

**Database Functions**:
- `generate_referral_code()` - Creates 8-char alphanumeric codes
- `create_referral_code_for_user()` - Trigger function for auto-generation
- `activate_referral()` - Atomically activates referral and awards credits

### Files Created

| File | Purpose |
|------|---------|
| `/supabase/migrations/016_create_referral_system.sql` | Database tables, triggers, functions |
| `/lib/types/referral.ts` | TypeScript types and constants |
| `/lib/services/referrals.ts` | Service layer for referral operations |
| `/app/api/v1/referrals/route.ts` | GET - Fetch user's referral code and stats |
| `/app/api/v1/referrals/validate/route.ts` | GET - Validate a referral code |
| `/components/referral/ReferralShareSection.tsx` | Profile page UI component |
| `/components/referral/index.ts` | Component export |

### Files Modified

| File | Changes |
|------|---------|
| `/app/auth/signup/page.tsx` | Captures `?ref=CODE`, validates, shows badge, stores in cookie |
| `/app/auth/confirm/route.ts` | Creates pending referral after email verification |
| `/app/api/v1/book-chat/route.ts` | Calls `activateReferral()` after successful chat |
| `/app/api/v1/summary/route.ts` | Calls `activateReferral()` after successful summary |
| `/app/dashboard/profile/page.tsx` | Added `<ReferralShareSection />` component |

### Referral Flow

1. **User A** visits Profile page → sees referral link with unique code
2. **User A** shares link: `https://app.megyk.com/auth/signup?ref=ABCD1234`
3. **User B** clicks link → Signup page shows "Referral Applied" badge
4. **User B** signs up → Code stored in cookie for email verification
5. **User B** verifies email → Pending referral record created
6. **User B** sends first chat OR generates first summary
7. **Both users** receive bonus credits automatically
8. Referral status changes from `pending` to `completed`

### API Endpoints

#### GET `/api/v1/referrals`
Returns user's referral code and stats:
```json
{
  "stats": {
    "referral_code": "ABCD1234",
    "referral_link": "https://app.megyk.com/auth/signup?ref=ABCD1234",
    "pending": 2,
    "successful": 5,
    "total_earned": 7500
  }
}
```

#### GET `/api/v1/referrals/validate?code=ABCD1234`
Validates a referral code (public endpoint for signup page):
```json
{
  "valid": true,
  "code": "ABCD1234"
}
```

### Constants

Defined in `/lib/types/referral.ts`:

```typescript
REFERRAL_CODE_PARAM = 'ref'          // URL parameter name
REFERRAL_CODE_COOKIE = 'megyk_ref_code'  // Cookie name
REFERRAL_COOKIE_MAX_AGE = 2592000    // 30 days in seconds

REFERRAL_REWARDS = {
  referrer_bonus: 1500,
  referred_bonus: 1000,
}
```

### Profile Page Component

The `<ReferralShareSection />` component displays:
- Copy-to-clipboard referral link
- Native share button (on supported devices)
- Stats grid: Total Invited, Pending, Activated, Credits Earned
- "How it works" explainer with reward amounts

### Edge Cases Handled

- Invalid referral code → No badge shown, signup proceeds normally
- Self-referral → Prevented by database constraint
- Already referred → User can only be referred once
- Multiple activations → Only first activation triggers rewards
- Cross-device signup → Referral code passed via URL params survives email verification

### Testing Checklist

- [ ] Run migration on Supabase
- [ ] Verify tables created with RLS policies
- [ ] Verify existing users get referral codes backfilled
- [ ] Verify new users auto-get referral code on signup
- [ ] User A gets referral link on profile page
- [ ] User B signs up with `?ref=CODE` - shows badge
- [ ] After email verification, pending referral created
- [ ] User B sends first chat message
- [ ] User B gets 1000 MC bonus (check credit_transactions)
- [ ] User A gets 1500 MC bonus (check credit_transactions)
- [ ] Referral status changes to `completed`
- [ ] Second activation attempt does nothing (already completed)

## Dev Server

Currently running on: http://localhost:3001
