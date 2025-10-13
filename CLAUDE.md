# Book Summaries Platform - Claude Context

## Project Overview
A personalized book summarizer platform that delivers AI-generated, reader-personalized book summaries. Built with Next.js for web with future mobile app support via React Native.

## Technology Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Lucide React** for icons

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
    /summary       # POST - Trigger summary generation via n8n
  globals.css
  layout.tsx       # Root layout with nav and footer
  page.tsx         # Home page

/lib
  /supabase
    client.ts      # Browser Supabase client
    server.ts      # Server-side Supabase client
    middleware.ts  # Auth session management
  utils.ts         # Utility functions (cn for className merging)

/components        # React components (to be populated)

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

## Database Schema (To Be Implemented)

Based on PRD requirements:

- `books` - Core book content
- `chapters` - Chapter-level content
- `embeddings` - Vector embeddings for personalization
- `user_profiles` - User demographics & preferences (JSON)
- `summary_requests` - Generation logs & feedback

## API Routes

All API routes follow versioned pattern (`/api/v1/...`) for future SDK/public API support.

### `/api/v1/books` (GET)
- Fetch book summaries with embeddings
- TODO: Implement database queries

### `/api/v1/profile` (GET/PUT)
- Get/update user preferences
- Requires authentication
- TODO: Implement profile CRUD

### `/api/v1/summary` (POST)
- Trigger personalized summary generation
- Calls n8n webhook with user context
- TODO: Implement n8n integration and logging

## Current Status

### ✅ Completed
- Next.js app initialized with TypeScript and App Router
- Tailwind CSS configured
- shadcn/ui utilities set up
- Supabase client utilities created
- Auth middleware configured
- Basic folder structure following PRD monorepo design
- API route stubs with TODOs
- Basic layout with nav and footer
- Landing page with hero and features sections

### 🚧 Next Steps
1. Set up Supabase project and configure environment variables
2. Design and implement database schema with pgvector
3. Set up n8n workflows for AI orchestration
4. Implement authentication flow (sign up, login, profile)
5. Build book library UI
6. Implement summary generation flow
7. Add user preference collection
8. Build personalized summary display

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

# Add shadcn/ui components
npx shadcn@latest add [component-name]
```

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
- `components.json` - shadcn/ui configuration

## Notes

- API routes have TODO comments indicating implementation points
- Middleware handles Supabase auth session management automatically
- TypeScript paths configured with `@/*` alias for clean imports
- All API routes check authentication before processing requests
