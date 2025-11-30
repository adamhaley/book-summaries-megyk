# @megyk/api - Next.js API Backend

**Pure API-only backend** for the Megyk Books platform (no frontend pages).

## Overview

This is the API backend that handles:
- Book summaries generation via n8n webhooks
- Supabase integration (auth, database, storage)
- User preferences and profiles
- File uploads and PDF storage

## Structure

```
apps/api/
├── app/
│   └── api/v1/              # API routes (versioned)
│       ├── books/           # GET - Fetch books list
│       ├── profile/         # GET/PUT - User profiles & preferences
│       ├── summary/         # POST - Generate summary (triggers n8n)
│       ├── summaries/       # GET - List user summaries
│       │   └── [id]/
│       │       ├── download # GET - Download summary PDF
│       │       └── route.ts # DELETE - Delete summary
│       ├── send-email/      # POST - Send emails via Resend
│       └── dashboard/
│           └── stats/       # GET - Dashboard statistics
├── lib/
│   ├── supabase/            # Supabase clients
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── middleware.ts    # Auth middleware
│   ├── types/               # TypeScript types (will move to @megyk/types)
│   │   ├── books.ts
│   │   ├── summaries.ts
│   │   └── preferences.ts
│   └── utils.ts             # Utility functions
├── public/                  # Static assets (logo, etc.)
├── supabase/
│   └── migrations/          # Database migration SQL files
├── scripts/                 # Utility scripts
│   └── upload-book-covers.ts
├── .scripts/                # Deployment scripts
│   └── deploy.sh
├── middleware.ts            # Next.js middleware (auth)
├── next.config.ts           # Next.js configuration
└── package.json             # Workspace package
```

## API Routes

All routes are versioned under `/api/v1/`:

### Books
- `GET /api/v1/books` - Fetch all books (with optional filtering)

### Summaries
- `POST /api/v1/summary` - Generate new summary (triggers n8n webhook)
- `GET /api/v1/summaries` - List user's summaries
- `GET /api/v1/summaries/[id]/download` - Download PDF
- `DELETE /api/v1/summaries/[id]` - Delete summary

### Profile
- `GET /api/v1/profile` - Get user profile & preferences
- `PUT /api/v1/profile` - Update user preferences

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

### Email
- `POST /api/v1/send-email` - Send transactional emails via Resend

## Development

```bash
# From root
yarn dev:api

# Or from apps/api
cd apps/api
yarn dev
```

Server runs on http://localhost:3200

## Environment Variables

Create `.env.local` in project root (not in apps/api):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://supabase.megyk.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n Webhook
N8N_WEBHOOK_URL=https://n8n.megyk.com/webhook/get_book_summary
N8N_WEBHOOK_URL_TEST=https://n8n.megyk.com/webhook-test/get_book_summary

# Resend API
RESEND_API_KEY=your-resend-api-key

# Public Site URL
NEXT_PUBLIC_SITE_URL=https://megyk.com
```

## Database Migrations

Migrations are in `supabase/migrations/`:
- `001_create_user_profiles.sql` - User profiles & preferences
- `002_create_summaries.sql` - Summaries table
- `003_update_summaries_rls.sql` - RLS policies
- `004_create_storage_bucket.sql` - Supabase Storage bucket

Run via Supabase Dashboard SQL Editor or Supabase CLI.

## Deployment

Deployment scripts in `.scripts/deploy.sh`:

```bash
#!/bin/bash
set -e
git pull origin master
yarn build
sudo systemctl restart megyk-books.service
```

Triggered by GitHub Actions on push to `master`.

## Frontend

**Note:** All frontend UI has been moved to `@megyk/expo` (Expo app with web/iOS/Android support).

This package contains **only** API routes.

## Next Steps

1. Extract types to `@megyk/types`
2. Extract Supabase client to `@megyk/api-client`
3. Build Expo frontend at `apps/expo`

---

**Status:** ✅ API-only (frontend removed)
**Last Updated:** 2025-11-30
