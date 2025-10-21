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
- **Supabase** - Postgres database, Auth, Storage, pgvector for embeddings
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
  theme.ts         # Mantine theme configuration
  utils.ts         # Utility functions (cn for Tailwind className merging)

/components        # React components
  /dashboard       # Dashboard layout with Mantine AppShell
  /summary         # GenerateSummaryModal component
  /preferences     # PreferencesForm component
  /onboarding      # OnboardingWizard component

/supabase
  /migrations
    001_create_user_profiles.sql  # User profiles & preferences
    002_create_summaries.sql      # Summaries table with metadata

/files             # Local PDF storage directory

/packages          # Future monorepo structure for mobile app
  /ui             # Shared React components
  /api            # Supabase + n8n API client utilities
  /lib            # Shared hooks, utils, schemas

middleware.ts      # Next.js middleware for Supabase auth
```

## Environment Variables

Create `.env.local` from `.env.local.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
N8N_WEBHOOK_URL=your-n8n-webhook-url
```

## Database Schema

### ✅ Implemented Tables

- **`user_profiles`** - User demographics & preferences (JSONB)
  - Stores style (narrative/bullet_points/workbook) and length (1pg/5pg/15pg) preferences
  - One profile per user with automatic creation on signup
  - Migration: `001_create_user_profiles.sql`

- **`summaries`** - Generated book summaries with metadata
  - Links user_id and book_id (no unique constraint - multiple summaries allowed)
  - Stores style, length, file_path, tokens_spent, generation_time
  - Timestamps: created_at, updated_at
  - Row Level Security enabled for user isolation
  - Migration: `002_create_summaries.sql`

### 📋 To Be Implemented

- `books` - Core book content
- `chapters` - Chapter-level content
- `embeddings` - Vector embeddings for personalization

## API Routes

All API routes follow versioned pattern (`/api/v1/...`) for future SDK/public API support.

### ✅ `/api/v1/summary` (POST)
- Triggers personalized summary generation via n8n webhook
- Receives PDF response from n8n
- Saves PDF to local `/files` directory
- Creates database record in `summaries` table with metadata
- Returns PDF to user for immediate download
- Extracts optional metrics from headers: `x-tokens-spent`, `x-generation-time`
- Uses hardcoded user_id for MVP (to be replaced with auth)

### ✅ `/api/v1/summaries` (GET)
- Fetches all summaries for the current user
- Joins with `books` table for book details
- Returns array of summaries with book metadata
- Ordered by creation date (newest first)

### ✅ `/api/v1/summaries/[id]/download` (GET)
- Downloads a previously generated summary PDF by ID
- Verifies user ownership before serving file
- Streams PDF from local `/files` directory
- Returns 404 if file or record not found

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
- Basic folder structure following PRD monorepo design
- Basic layout with nav and footer
- Landing page with hero and features sections
- Dashboard page with navigation structure (Library, My Summaries, Preferences, Profile)
- **Summary Generation Flow**
  - GenerateSummaryModal component with style/length sliders
  - Integration with n8n webhook for AI generation
  - PDF download functionality
  - Local file storage in `/files` directory
  - Database persistence in `summaries` table
  - No timeout on browser requests (handles long generation times)
- **My Summaries Page**
  - Grid layout displaying all user summaries
  - Book metadata (title, author) via database join
  - Style and length badges
  - Creation timestamp and generation time display
  - Download button for saved PDFs
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
  - Local PDF storage in `/files` directory
  - Unique filenames with timestamp
  - Download API endpoint with user verification

### 🚧 Next Steps
1. Implement authentication flow (sign up, login, profile) and replace hardcoded user_id
2. Build books table and populate with book data
3. Implement book library browsing UI
4. Set up n8n workflows for AI orchestration (if not already done)
5. Add book chapters table and embeddings for personalization
6. Implement search and filtering on Library page
7. Add ability to delete summaries
8. Consider remote file storage (S3, Supabase Storage) for production scalability

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
