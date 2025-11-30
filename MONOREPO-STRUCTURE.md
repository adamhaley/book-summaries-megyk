# Monorepo Structure

This project uses **Yarn Workspaces** to manage a monorepo with shared packages.

## Directory Structure

```
book-summaries-megyk/
├── apps/
│   ├── api/          # Next.js API backend (to be created)
│   └── expo/         # Expo app (web + mobile) (to be created)
├── packages/
│   ├── types/        # @megyk/types - Shared TypeScript types
│   ├── api-client/   # @megyk/api-client - API utilities & Supabase client
│   ├── lib/          # @megyk/lib - Shared utility functions
│   └── config/       # @megyk/config - Shared configuration (ESLint, TS)
├── package.json      # Root workspace configuration
└── tsconfig.base.json # Base TypeScript configuration
```

## Workspaces

### Apps

- **`@megyk/api`** - Next.js API-only backend
  - API routes for summaries, books, profiles
  - Supabase integration (auth, database, storage)
  - n8n webhook integration
  - No frontend pages (API only)

- **`@megyk/expo`** - Expo app (cross-platform)
  - React Native UI with NativeWind + GlueStack
  - Works on web (React Native Web), iOS, Android
  - Calls @megyk/api for backend operations

### Packages

- **`@megyk/types`** - Shared TypeScript types
  - Book, Summary, UserPreferences
  - API response types
  - Database schema types

- **`@megyk/api-client`** - API & Supabase utilities
  - Supabase client (cross-platform)
  - API client for calling Next.js backend
  - Helper functions for data fetching

- **`@megyk/lib`** - Shared utilities
  - Common helper functions
  - Validation functions
  - Constants and configuration

- **`@megyk/config`** - Shared configuration
  - ESLint configurations
  - TypeScript base config
  - Prettier settings

## Installation

From the root directory:

```bash
# Install all workspaces
yarn install

# Install dependencies for a specific workspace
yarn workspace @megyk/api add some-package
yarn workspace @megyk/expo add some-package
```

## Development

```bash
# Run API backend
yarn dev:api

# Run Expo app (web)
yarn dev:expo

# Type-check all packages
yarn type-check

# Build all packages
yarn build
```

## How Workspaces Work

### Dependencies Between Packages

Packages can reference each other using workspace protocol:

```json
{
  "dependencies": {
    "@megyk/types": "*"
  }
}
```

Yarn automatically symlinks packages so changes are immediately available.

### Importing from Shared Packages

```typescript
// In apps/api or apps/expo
import { Book, Summary } from '@megyk/types'
import { createClient } from '@megyk/api-client'
import { formatDate } from '@megyk/lib'
```

### Adding Dependencies

```bash
# Add to a specific workspace
yarn workspace @megyk/api add express

# Add to root (dev dependencies only)
yarn add -W -D typescript
```

## TypeScript Project References

The monorepo uses TypeScript project references for faster builds:

- `tsconfig.base.json` - Base configuration
- Each package has its own `tsconfig.json` extending the base
- Packages reference their dependencies in `tsconfig.json`

## Current Status

**Phase 1: Monorepo Setup** ✅
- [x] Root workspace configuration
- [x] Package structure created
- [x] TypeScript configuration
- [ ] Move Next.js app to apps/api
- [ ] Initialize Expo app at apps/expo
- [ ] Extract shared types to @megyk/types

**Next Steps:**
1. Move current Next.js app to `apps/api`
2. Strip out frontend pages (keep only API routes)
3. Extract shared types to `@megyk/types`
4. Initialize Expo app at `apps/expo`

---

**Last Updated:** 2025-11-30
