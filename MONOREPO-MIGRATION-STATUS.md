# Monorepo Migration Status

**Date:** 2025-11-30
**Branch:** `nativewind-pivot`
**Phase:** Monorepo Setup Complete ✅

## Progress Summary

### ✅ Phase 1: Monorepo Foundation (COMPLETE)

**Tasks Completed:**
1. ✅ Audit current Mantine UI usage → **MANTINE-AUDIT.md**
2. ✅ Create monorepo structure with Yarn workspaces
3. ✅ Create `/apps` and `/packages` directories
4. ✅ Move Next.js app to `/apps/api`
5. ✅ Create shared packages structure
6. ✅ Set up TypeScript project references

## Current Structure

```
book-summaries-megyk/
├── apps/
│   └── api/                  # @megyk/api - Next.js backend
│       ├── app/
│       │   ├── api/v1/       # API routes (books, summaries, profile)
│       │   ├── auth/         # Auth pages (to be removed)
│       │   ├── dashboard/    # Dashboard pages (to be removed)
│       │   └── onboarding/   # Onboarding (to be removed)
│       ├── components/       # React components (to be removed)
│       ├── lib/
│       │   ├── supabase/     # Supabase clients
│       │   └── types/        # TypeScript types (to be extracted)
│       ├── public/           # Static assets
│       ├── supabase/         # Database migrations
│       ├── scripts/          # Utility scripts
│       ├── .scripts/         # Deployment scripts
│       ├── package.json      # Workspace package
│       ├── tsconfig.json     # TypeScript config
│       ├── next.config.ts    # Next.js config
│       └── README.md         # Documentation
├── packages/
│   ├── types/                # @megyk/types (placeholder)
│   ├── api-client/           # @megyk/api-client (placeholder)
│   ├── lib/                  # @megyk/lib (placeholder)
│   └── config/               # @megyk/config (placeholder)
├── package.json              # Root workspace config
├── tsconfig.base.json        # Base TypeScript config
└── MONOREPO-STRUCTURE.md     # Documentation
```

## What Moved to apps/api

**Directories:**
- `/app` → Main Next.js app directory
- `/components` → React components (will be removed)
- `/lib` → Utilities and types
- `/public` → Static assets (logo, etc.)
- `/supabase` → Database migrations
- `/scripts` → Utility scripts
- `/.scripts` → Deployment scripts

**Configuration Files:**
- `middleware.ts` → Next.js middleware
- `next.config.ts` → Next.js configuration
- `next-env.d.ts` → Next.js types
- `postcss.config.mjs` → PostCSS config
- `tailwind.config.ts` → Tailwind config
- `tsconfig.json` → TypeScript config
- `.env.local.example` → Environment variable template

**What Stayed in Root:**
- `package.json` → Root workspace config (new)
- `tsconfig.base.json` → Base TypeScript config (new)
- `.git`, `.github` → Git repository
- Documentation files (PRD, CLAUDE.md, etc.)
- `.env.local` → Environment variables (not committed)

## Workspace Packages Created

### @megyk/api
**Location:** `apps/api`
**Purpose:** Next.js API backend
**Status:** ✅ Functional (needs frontend pages removed)

### @megyk/types
**Location:** `packages/types`
**Purpose:** Shared TypeScript types
**Status:** 📋 Placeholder (needs types extracted from apps/api/lib/types)

### @megyk/api-client
**Location:** `packages/api-client`
**Purpose:** API utilities & Supabase client
**Status:** 📋 Placeholder (needs Supabase client extracted)

### @megyk/lib
**Location:** `packages/lib`
**Purpose:** Shared utility functions
**Status:** 📋 Placeholder (needs utils extracted)

### @megyk/config
**Location:** `packages/config`
**Purpose:** Shared configs (ESLint, TypeScript)
**Status:** 📋 Placeholder

## Next Steps (Phase 2)

### Task 5: Strip Frontend Pages from apps/api ⏭️
**Goal:** Remove all frontend pages, keep only API routes
**Actions:**
- Delete `/apps/api/app/auth/*` pages
- Delete `/apps/api/app/dashboard/*` pages
- Delete `/apps/api/app/onboarding/*` pages
- Delete `/apps/api/app/page.tsx` (homepage)
- Delete `/apps/api/app/layout.tsx` (root layout)
- Keep `/apps/api/app/api/*` (API routes)
- Delete `/apps/api/components/*` (React components)
- Clean up Mantine dependencies

### Task 7: Extract Shared Types
**Goal:** Move types from apps/api to packages/types
**Actions:**
- Move `lib/types/books.ts` → `packages/types/books.ts`
- Move `lib/types/summaries.ts` → `packages/types/summaries.ts`
- Move `lib/types/preferences.ts` → `packages/types/preferences.ts`
- Update imports in apps/api
- Export from `packages/types/index.ts`

### Task 9: Initialize Expo App
**Goal:** Create new Expo app at apps/expo
**Actions:**
- Run `npx create-expo-app@latest` in apps/
- Install NativeWind
- Install GlueStack UI
- Set up Expo Router
- Configure package.json

## Commands

```bash
# Install all workspaces
yarn install

# Run API backend
yarn dev:api
# or
cd apps/api && yarn dev

# Future: Run Expo app
yarn dev:expo
```

## Important Notes

### Environment Variables
- `.env.local` is still in root directory
- Apps can access it via relative path
- May need to copy or symlink for workspace isolation

### Deployment
- Deployment scripts are in `apps/api/.scripts/`
- Need to update paths in deployment workflow
- GitHub Actions may need updating for monorepo

### Git
- All changes on `nativewind-pivot` branch
- Original structure backed up in `package.json.backup`

## Documentation Files

- **NATIVEWIND-PIVOT-PRD.md** - Original requirements
- **NATIVEWIND-IMPLEMENTATION-PLAN.md** - Detailed migration plan
- **MANTINE-AUDIT.md** - Complete Mantine UI component inventory
- **MONOREPO-STRUCTURE.md** - Workspace documentation
- **MONOREPO-MIGRATION-STATUS.md** - This file (current progress)

## Testing Checklist

Before proceeding to next phase, verify:
- [ ] Root `yarn install` works
- [ ] `cd apps/api && yarn dev` starts Next.js
- [ ] API routes still functional at `/api/v1/*`
- [ ] Database migrations still accessible
- [ ] Deployment scripts still work (update paths if needed)

---

**Phase 1 Status:** ✅ COMPLETE
**Next Phase:** Strip frontend pages and extract shared types
**Last Updated:** 2025-11-30
