# Book Summaries Platform - Claude Context

## Project Overview
A personalized book summarizer platform that delivers AI-generated, reader-personalized book summaries. Built with Next.js for web with future mobile app support via React Native.

## Technology Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Mantine UI** - Component library (AppShell, forms, modals, notifications, etc.)
- **Tabler Icons** - Icon library (used by Mantine)

### Backend & Database
- **Supabase** - Postgres database, Auth, **Storage (for PDFs)**, pgvector for embeddings
- **n8n** - Automation & AI orchestration (self-hosted)
- **Ollama/OpenAI** - AI models for embeddings and summary generation

## Project Structure

```
/app
  /api/v1          # Versioned API endpoints
    /books         # GET - Fetch summaries & embeddings
    /profile       # GET/PUT - User profile & preferences
    /summary       # POST - Trigger summary generation via n8n, save PDF & DB record
    /summaries     # GET - Fetch user's generated summaries
      /[id]/download  # GET - Download saved summary PDF
  /auth
    /signin        # Sign in page
    /signup        # Sign up page with email verification
    /confirm       # Email confirmation callback handler
    /error         # Authentication error page
  /dashboard
    /library       # Book library with "Generate Summary" functionality
    /summaries     # My Summaries page - displays all generated summaries
    /preferences   # User preferences management
    /profile       # User profile page
  globals.css
  layout.tsx       # Root layout with nav and footer
  page.tsx         # Home page

/lib
  /supabase
    client.ts      # Browser Supabase client
    server.ts      # Server-side Supabase client
    middleware.ts  # Auth session management
  /types
    preferences.ts # Summary style & length type definitions
    summaries.ts   # Summary record types
    books.ts       # Book types
    credits.ts     # Credit system types and constants
    referral.ts    # Referral system types and constants
  /services
    credits.ts     # Credit service layer
    referrals.ts   # Referral service layer
  theme.ts         # Mantine theme configuration
  utils.ts         # Utility functions (cn for Tailwind className merging)

/components        # React components
  /dashboard       # Dashboard layout with Mantine AppShell
  /summary         # GenerateSummaryModal component
  /preferences     # PreferencesForm component
  /onboarding      # OnboardingWizard component
  /credits         # CreditBalance, CreditCostBadge, InsufficientCreditsModal
  /referral        # ReferralShareSection component
  /pwa             # InstallAppSection, useInstallPrompt

/supabase
  /migrations
    001_create_user_profiles.sql  # User profiles & preferences
    002_create_summaries.sql      # Summaries table with metadata
    003_update_summaries_rls.sql  # Updated RLS policies for summaries
    004_create_storage_bucket.sql # Supabase Storage bucket for PDFs

/files             # Legacy local files (deprecated - now using Supabase Storage)

/packages          # Future monorepo structure for mobile app
  /ui             # Shared React components
  /api            # Supabase + n8n API client utilities
  /lib            # Shared hooks, utils, schemas

middleware.ts      # Next.js middleware for Supabase auth
```

## Environment Variables

Create `.env.local` from `.env.local.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://supabase.megyk.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# n8n Webhook
N8N_WEBHOOK_URL=https://n8n.megyk.com/webhook/get_summary_v2
N8N_WEBHOOK_URL_TEST=https://n8n.megyk.com/webhook-test/get_summary_v2

# Resend API (for email sending via custom endpoint)
RESEND_API_KEY=your-resend-api-key

# Public Site URL (REQUIRED for auth redirects)
NEXT_PUBLIC_SITE_URL=https://megyk.com
```

**Important**: `NEXT_PUBLIC_SITE_URL` is required for proper email confirmation redirects. Without it, the app may redirect to internal server addresses (0.0.0.0:3200) instead of the public domain.

## Email Verification Setup

The platform uses **Resend.com** for transactional emails via Supabase Auth (self-hosted).

### Configuration Overview

For self-hosted Supabase, email verification requires configuring GoTrue (Supabase's auth service) with SMTP settings. The configuration is split between:
1. **Supabase GoTrue environment variables** (in docker-compose.yml)
2. **Next.js environment variables** (in .env.local)
3. **Custom route handlers** (in /app/auth/confirm)

### Supabase GoTrue Configuration

**File**: `/root/supabase/docker/docker-compose.yml` on Supabase droplet

Critical GoTrue environment variables:

```yaml
auth:
  environment:
    # API URLs - controls where email links point
    GOTRUE_SITE_URL: ${SITE_URL}
    GOTRUE_API_EXTERNAL_URL: https://megyk.com

    # Email link generation - DOMAIN ORDER MATTERS!
    # First domain in list is used for email confirmation links
    GOTRUE_MAILER_EXTERNAL_HOSTS: megyk.com,supabase.megyk.com,localhost,kong
    GOTRUE_MAILER_URLPATHS_CONFIRMATION: /auth/confirm
    GOTRUE_MAILER_URLPATHS_INVITE: /auth/confirm
    GOTRUE_MAILER_URLPATHS_RECOVERY: /auth/confirm

    # SMTP Settings - Resend.com
    GOTRUE_SMTP_HOST: smtp.resend.com
    GOTRUE_SMTP_PORT: 587  # Use 587 or 2525 (Digital Ocean may block port 25)
    GOTRUE_SMTP_USER: resend
    GOTRUE_SMTP_PASS: ${RESEND_API_KEY}  # From .env file
    GOTRUE_SMTP_ADMIN_EMAIL: noreply@megyk.com
    GOTRUE_MAILER_AUTOCONFIRM: false  # Require email confirmation
```

**Critical Configuration Notes**:
1. **Domain Ordering**: `GOTRUE_MAILER_EXTERNAL_HOSTS` uses the FIRST domain for email links. Put your public domain first.
2. **Port Selection**: Use port 587 or 2525 for SMTP. Port 25 may be blocked by hosting providers.
3. **API External URL**: Must match your public domain, not internal Supabase URL.

### Next.js Configuration

**File**: `.env.local` in Next.js project root

```bash
# Public Site URL (REQUIRED for auth redirects)
NEXT_PUBLIC_SITE_URL=https://megyk.com

# Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://supabase.megyk.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend API (for custom email endpoint at /api/v1/send-email)
RESEND_API_KEY=your-resend-api-key
```

### Auth Flow

1. User signs up at `/auth/signup` with email and password
2. Next.js calls `supabase.auth.signUp()` with `emailRedirectTo: ${origin}/auth/confirm`
3. Supabase GoTrue sends verification email via Resend SMTP
4. Email contains link: `https://megyk.com/auth/confirm?token=...&type=signup`
5. User clicks link → Next.js route handler at `/app/auth/confirm/route.ts`
6. Handler calls `supabase.auth.verifyOtp()` with token
7. On success: redirect to `/dashboard`
8. On failure: redirect to `/auth/error?message=...`

### Route Handlers

**Key Files**:
- `/app/auth/signup/page.tsx` - Sign up form with `emailRedirectTo` option
- `/app/auth/confirm/route.ts` - Confirmation callback (verifies token, handles redirects)
- `/app/auth/error/page.tsx` - Error display with Suspense boundary for `useSearchParams()`
- `/app/api/v1/send-email/route.ts` - Custom endpoint for sending emails via Resend (future use)

**Important Implementation Details**:
- `/app/auth/confirm/route.ts` accepts both `token` and `token_hash` parameters for compatibility
- Uses `NEXT_PUBLIC_SITE_URL` for redirect URLs (not `request.url` origin due to reverse proxy)
- Error page requires Suspense boundary around `useSearchParams()` (Next.js 15 requirement)

### Email Template Customization

Supabase uses default email templates. To customize:
1. GoTrue templates are in the Supabase container
2. Override with `GOTRUE_MAILER_TEMPLATES_*` environment variables
3. Or use custom `/api/v1/send-email` endpoint for fully custom emails

### Troubleshooting Guide

#### Issue 1: SMTP Port Blocking (Digital Ocean, AWS, etc.)

**Symptoms**: Timeout errors when sending emails, `telnet smtp.resend.com 587` fails

**Cause**: Many cloud providers (Digital Ocean, AWS) block outbound SMTP ports by default to prevent spam.

**Solution**:
1. **Test connectivity**: `timeout 5 bash -c 'cat < /dev/null > /dev/tcp/smtp.resend.com/587'`
2. If timeout occurs, contact hosting provider support to unblock SMTP ports
3. Digital Ocean: Submit support ticket requesting SMTP port access (usually approved within 24hrs)
4. Alternative: Use port 2525 instead of 587 (sometimes unblocked)

**Verification**:
```bash
# Test SMTP authentication with swaks
swaks --to test@example.com \
  --from noreply@megyk.com \
  --server smtp.resend.com:587 \
  --auth LOGIN \
  --auth-user resend \
  --auth-password YOUR_API_KEY
```

#### Issue 2: Resend API Key Case Sensitivity

**Symptoms**: `535 API key not found` error from Resend, even though key looks correct

**Cause**: Resend API keys are case-sensitive. Common issue: trailing character copied with wrong case (e.g., 'C' vs 'c').

**Solution**:
1. Double-check API key in Resend dashboard
2. Verify exact case in both `.env` file and `docker-compose.yml`
3. Check for trailing whitespace or invisible characters
4. Regenerate API key if needed

**Example**: Key ending in `...3yAC` (uppercase C) vs `...3yAc` (lowercase c) will cause auth failure.

#### Issue 3: Wrong Domain in Email Links

**Symptoms**: Confirmation links point to `supabase.megyk.com` instead of `megyk.com`, or redirect to internal IPs

**Cause**: `GOTRUE_MAILER_EXTERNAL_HOSTS` uses FIRST domain in comma-separated list for email link generation.

**Solution**:
1. Check `GOTRUE_MAILER_EXTERNAL_HOSTS` in docker-compose.yml
2. Ensure public domain is FIRST: `megyk.com,supabase.megyk.com,localhost,kong`
3. Restart Supabase auth service: `cd /root/supabase/docker && docker-compose restart auth`

**Before**: `GOTRUE_MAILER_EXTERNAL_HOSTS: supabase.megyk.com,megyk.com` ❌
**After**: `GOTRUE_MAILER_EXTERNAL_HOSTS: megyk.com,supabase.megyk.com` ✅

#### Issue 4: Redirect to Internal IP (0.0.0.0:3200)

**Symptoms**: After clicking email link, user redirected to `0.0.0.0:3200/auth/error` instead of public domain

**Cause**: Using `requestUrl.origin` in route handler returns internal server address when behind reverse proxy.

**Solution**:
1. Add `NEXT_PUBLIC_SITE_URL` to `.env.local`: `NEXT_PUBLIC_SITE_URL=https://megyk.com`
2. Update `/app/auth/confirm/route.ts` to use environment variable:
   ```typescript
   const publicUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://megyk.com'
   return NextResponse.redirect(new URL(next, publicUrl))
   ```
3. Rebuild Next.js: `yarn build && sudo systemctl restart megyk-books.service`

#### Issue 5: "Invalid verification link" Error

**Symptoms**: Confirmation page shows "Invalid verification link" immediately, no verification attempted

**Cause**: Parameter name mismatch - email uses `token=...` but code expects `token_hash=...`

**Solution**: Support both parameter names in `/app/auth/confirm/route.ts`:
```typescript
const token_hash = requestUrl.searchParams.get('token_hash') || requestUrl.searchParams.get('token')
```

This provides backward compatibility with different Supabase versions.

#### Issue 6: Next.js Build Failure - useSearchParams

**Symptoms**: Build fails with error: `useSearchParams() should be wrapped in a suspense boundary`

**Cause**: Next.js 15 requires `useSearchParams()` to be wrapped in Suspense for proper SSR.

**Solution**: Extract component using `useSearchParams()` and wrap in Suspense:
```typescript
function ErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'An error occurred'
  return <Alert>{message}</Alert>
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ErrorContent />
    </Suspense>
  )
}
```

### Debugging Commands

**Check Supabase logs**:
```bash
# On Supabase droplet
cd /root/supabase/docker
docker-compose logs -f auth --tail=100
```

**Check Next.js logs**:
```bash
# On production server
sudo journalctl -u megyk-books.service -f
```

**Test SMTP connectivity**:
```bash
# Test port 587
timeout 5 bash -c 'cat < /dev/null > /dev/tcp/smtp.resend.com/587' && echo "Port 587 open" || echo "Port 587 blocked"

# Test port 2525
timeout 5 bash -c 'cat < /dev/null > /dev/tcp/smtp.resend.com/2525' && echo "Port 2525 open" || echo "Port 2525 blocked"
```

**Verify email links**:
1. Sign up with test account
2. Check email source (View → Message Source in Gmail)
3. Look for confirmation URL structure
4. Verify domain matches `GOTRUE_MAILER_EXTERNAL_HOSTS` first entry

### Production Status

✅ **Fully implemented and tested** (as of Nov 2025)
- Resend.com SMTP integration working
- Email verification flow end-to-end tested
- Debug logging active in `/app/auth/confirm/route.ts` for monitoring
- All major issues resolved and documented above

**Note**: Debug `console.log` statements are intentionally left in place for monitoring. Remove after multi-user testing confirms stability.

## Database Schema

### ✅ Implemented Tables

- **`user_profiles`** - User demographics & preferences (JSONB)
  - Stores style (narrative/bullet_points/workbook) and length (short/medium/long) preferences
  - One profile per user with automatic creation on signup
  - Migration: `001_create_user_profiles.sql`

- **`summaries`** - Generated book summaries with metadata
  - Links user_id and book_id (no unique constraint - multiple summaries allowed)
  - Stores style, length, file_path (Supabase Storage path), tokens_spent, generation_time
  - Timestamps: created_at, updated_at
  - Row Level Security enabled for user isolation
  - Migration: `002_create_summaries.sql`, `003_update_summaries_rls.sql`

- **`storage.buckets.summaries`** - Supabase Storage bucket for PDF files
  - Stores generated summary PDFs with user-specific folder structure: `user_id/summary_id.pdf`
  - Row Level Security policies ensure users can only access their own files
  - Works across all environments (local dev and production) - no more orphaned files!
  - Migration: `004_create_storage_bucket.sql`

- **`credit_balances`** - User credit balance tracking
  - Current balance, lifetime earned, lifetime spent
  - Auto-created on user signup
  - Migration: `013_create_credit_system.sql`

- **`credit_transactions`** - Immutable ledger of all credit movements
  - Transaction types: signup_bonus, summary_generation, chat_message, referral_bonus, etc.
  - Tracks balance before/after for audit trail
  - Migration: `013_create_credit_system.sql`

- **`referral_codes`** - Unique 8-character referral code per user
  - Auto-generated on signup via database trigger
  - Uses alphanumeric chars excluding confusing ones (0, O, I, 1, L)
  - Tracks total_referrals and successful_referrals counts
  - Migration: `016_create_referral_system.sql`

- **`referrals`** - Tracks referrer→referred relationships
  - Status: `pending`, `completed`, `expired`
  - Activation type: `chat` or `summary`
  - Unique constraint on referred_id (one referral per user)
  - Migration: `016_create_referral_system.sql`

### 📋 To Be Implemented

- `books` - Core book content
- `chapters` - Chapter-level content
- `embeddings` - Vector embeddings for personalization

## API Routes

All API routes follow versioned pattern (`/api/v1/...`) for future SDK/public API support.

### ✅ `/api/v1/summary` (POST)
- Triggers personalized summary generation via n8n webhook
- Receives PDF response from n8n
- **Uploads PDF to Supabase Storage** bucket (`summaries`) with path: `user_id/summary_id.pdf`
- Creates database record in `summaries` table with metadata
- Returns PDF to user for immediate download
- Extracts optional metrics from headers: `x-tokens-spent`, `x-generation-time`
- Implements proper error handling and cleanup (deletes uploaded file if DB insert fails)

### ✅ `/api/v1/summaries` (GET)
- Fetches all summaries for the current user
- Joins with `books` table for book details
- Returns array of summaries with book metadata
- Ordered by creation date (newest first)

### ✅ `/api/v1/summaries/[id]/download` (GET)
- Downloads a previously generated summary PDF by ID
- Verifies user ownership before serving file
- **Downloads PDF from Supabase Storage** using stored file_path
- Returns 404 if file or record not found

### ✅ `/api/v1/summaries/[id]` (DELETE)
- Deletes a summary and its associated PDF file
- Verifies user ownership before deletion
- **Removes PDF from Supabase Storage** before deleting DB record
- Continues with DB deletion even if storage deletion fails

### ✅ `/api/v1/credits` (GET)
- Returns user's current credit balance and recent transactions
- Used by CreditBalance component in header

### ✅ `/api/v1/credits/check` (POST)
- Checks if user can afford a specific action (summary or chat)
- Returns affordability status with current balance

### ✅ `/api/v1/referrals` (GET)
- Returns user's referral code and stats
- Used by ReferralShareSection on profile page
- Response includes: referral_code, referral_link, pending count, successful count, total_earned

### ✅ `/api/v1/referrals/validate` (GET)
- Validates a referral code (public endpoint)
- Query param: `?code=ABCD1234`
- Used by signup page to show "Referral Applied" badge
- Returns: valid (boolean), code, error (if invalid)

### 📋 `/api/v1/books` (GET)
- Fetch book summaries with embeddings
- TODO: Implement database queries

### 📋 `/api/v1/profile` (GET/PUT)
- Get/update user preferences
- TODO: Implement proper authentication
- TODO: Implement profile CRUD operations

## Current Status

### ✅ Completed
- Next.js app initialized with TypeScript and App Router
- Tailwind CSS configured
- Mantine UI integrated with theming system
  - AppShell-based dashboard layout with responsive sidebar
  - Color scheme toggle (light/dark mode)
  - Modals and notifications providers configured
  - Hydration issues resolved with proper SSR setup
  - Mobile scrolling fixes with `dvh` units and `-webkit-overflow-scrolling`
- Supabase client utilities created
- Auth middleware configured
- **Email Verification with Resend** ✅ Production-Ready
  - Self-hosted Supabase GoTrue SMTP integration with Resend.com
  - Email confirmation flow for new signups (end-to-end tested)
  - Confirmation callback handler at `/app/auth/confirm/route.ts`
  - Error handling for unverified users with Suspense boundaries
  - Domain verified: megyk.com
  - Comprehensive troubleshooting documentation for common issues:
    - SMTP port blocking resolution
    - API key case sensitivity
    - Domain ordering in GoTrue configuration
    - Reverse proxy redirect handling
    - Token parameter compatibility
  - Debug logging active for production monitoring
- Basic folder structure following PRD monorepo design
- Basic layout with nav and footer
- Landing page with hero and features sections
- Dashboard page with navigation structure (Library, My Summaries, Preferences, Profile)
- **Summary Generation Flow**
  - GenerateSummaryModal component with style/length sliders
  - Integration with n8n webhook for AI generation
  - PDF download functionality
  - **Supabase Storage integration** - PDFs stored in cloud bucket with user-specific folders
  - Database persistence in `summaries` table
  - No timeout on browser requests (handles long generation times)
  - Proper error handling with automatic cleanup on failures
- **My Summaries Page**
  - Grid layout displaying all user summaries
  - Book metadata (title, author) via database join
  - Style and length badges
  - Creation timestamp and generation time display
  - Download button for saved PDFs (from Supabase Storage)
  - Delete button with loading indicator and confirmation
  - Improved error messages for missing files
  - Loading, empty, and error states
- **User Preferences System**
  - Style options: Narrative, Bullet Points, Workbook
  - Length options: Short (1 sentence/chapter), Medium (1 paragraph/chapter), Long (1 page/chapter)
  - Stored in `user_profiles` table as JSONB
  - Cached in sessionStorage for performance
- **Database Migrations**
  - `user_profiles` table with RLS policies
  - `summaries` table with metadata tracking
- **File Management**
  - **✅ Supabase Storage bucket for centralized PDF storage**
  - User-specific folder structure: `user_id/summary_id.pdf`
  - Row Level Security ensures users can only access their own files
  - Works seamlessly across local dev and production environments
  - Automatic cleanup on failed uploads
  - Delete summaries removes both DB record and storage file
- **Credit System (MC - Megyk Credits)**
  - Token-based economy for summary generation and chat
  - 500 MC signup bonus for new users
  - Credit costs vary by summary style/length and chat messages
  - Balance displayed in header with tooltip showing lifetime stats
  - Insufficient credits modal with upgrade prompts
- **Referral System**
  - Users earn credits by inviting friends
  - Referrer gets 1,500 MC when invitee activates
  - Referred user gets 1,000 MC bonus on activation
  - Activation = first chat message OR first summary generated
  - 8-character referral codes auto-generated on signup
  - Profile page shows share link, stats, and "how it works"
  - Signup page captures `?ref=CODE` and shows "Referral Applied" badge
  - Cross-device support via URL params and cookies

### 🚧 Next Steps
1. **Run migration**: Execute `004_create_storage_bucket.sql` on your Supabase instance
2. **Optional**: Migrate existing local PDFs to Supabase Storage (see migration script in `/scripts`)
3. Build books table and populate with book data
4. Implement book library browsing UI
5. Set up n8n workflows for AI orchestration (if not already done)
6. Add book chapters table and embeddings for personalization
7. Implement search and filtering on Library page

## Development Commands

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Mantine components are imported directly from @mantine packages
# See: https://mantine.dev/
```

## Deployment

### Automated Deployment Pipeline
- GitHub Actions workflow triggers on push to `master` branch
- Executes `.scripts/deploy.sh` on production server

### Deploy Script (`.scripts/deploy.sh`)
```bash
#!/bin/bash
set -e
git pull origin master
yarn build
sudo systemctl restart megyk-books.service
```

### Important Notes
- **Service restart is required** after each build
- Next.js production server loads build artifacts into memory at startup
- Without restart, new chunk files return 404 errors, causing client-side exceptions

## Running Database Migrations

Unlike Laravel's `php artisan migrate`, Next.js doesn't have built-in migration tools. Use one of these methods:

### Option 1: Supabase Dashboard (Easiest for MVP)
1. Go to https://app.supabase.com
2. Navigate to **SQL Editor**
3. Copy/paste migration file contents from `supabase/migrations/`
4. Click **Run**

### Option 2: Supabase CLI (Recommended for Production)
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Current Migrations
- `001_create_user_profiles.sql` - User preferences table
- `002_create_summaries.sql` - Summaries with metadata tracking
- `003_update_summaries_rls.sql` - Updated RLS policies for summaries
- `004_create_storage_bucket.sql` - Supabase Storage bucket for PDFs
- `005_create_books_table.sql` - Core books table
- `006_create_book_covers_bucket.sql` - Storage for book cover images
- `011_create_book_genres_table.sql` - Book genre categorization
- `013_create_credit_system.sql` - Credit balances, transactions, costs, chat sessions
- `014_create_credit_triggers.sql` - Automatic balance updates on transactions
- `015_seed_credit_costs.sql` - Default credit costs for actions
- `016_create_referral_system.sql` - Referral codes, referrals tracking, activation rewards

## Future Roadmap

### Phase 2: PWA
- Add service workers with `next-pwa`
- Implement offline caching
- Add push notifications
- Install banners for mobile-like UX

### Phase 3: Mobile App
- Build with Expo + React Native
- Share components from `/packages/ui`
- Reuse Supabase + n8n backend
- Add native features (downloads, voice summaries)

## Key Design Principles

1. **Iterate fast** - Use hosted services (Supabase, Vercel)
2. **Portability** - Keep UI/logic React-based for web + mobile reuse
3. **Separation of concerns** - Clean API boundaries
4. **Scalability** - Postgres + pgvector for personalization at scale

## Reference Documents

- `PRD.md` - Full architecture and system design
- `.env.local.example` - Environment variable template

## UI Library Architecture

### Mantine UI
We chose **Mantine UI** as our component library for several reasons:

1. **Complete Dashboard Components** - AppShell, Navbar, Header with responsive design out of the box
2. **Rich Component Ecosystem** - Forms, modals, notifications, overlays, data tables
3. **Built-in Theme System** - Color schemes, dark mode, customizable design tokens
4. **TypeScript Native** - Excellent type safety and developer experience
5. **Active Development** - Well-maintained with regular updates

### Key Mantine Features Used
- **AppShell** - Dashboard layout structure (components/dashboard/DashboardLayout.tsx)
- **Color Scheme** - Light/dark mode toggle with proper SSR hydration
- **ModalsProvider** - Global modal management
- **Notifications** - Toast notifications system
- **Navigation Components** - NavLink, Burger menu for mobile
- **Form Components** - Built-in validation and form state management
- **Data Display** - Tables, cards, grids for displaying book summaries

### Tailwind CSS Integration
- Mantine works seamlessly with Tailwind CSS
- Use `cn()` utility from `lib/utils.ts` for conditional Tailwind classes
- Mantine components use CSS-in-JS, avoiding style conflicts

### Hydration Considerations
- Mantine's color scheme requires careful SSR setup
- `defaultColorScheme="light"` set on both `ColorSchemeScript` and `MantineProvider`
- Client-side theme toggle uses `mounted` state check to prevent hydration mismatches

## Notes

- API routes have TODO comments indicating implementation points
- Middleware handles Supabase auth session management automatically
- TypeScript paths configured with `@/*` alias for clean imports
- All API routes check authentication before processing requests
- Mantine UI is the sole component library for a streamlined, consistent design system
