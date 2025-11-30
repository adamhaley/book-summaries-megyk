# NativeWind Pivot - Implementation Plan

## Overview
This document outlines the detailed implementation plan for migrating the Megyk Books platform from Next.js + Mantine UI (web-only) to a unified Expo + NativeWind + GlueStack UI codebase that supports web, iOS, and Android.

**Status:** Planning Complete - Ready for Implementation
**Branch:** `nativewind-pivot`
**Date:** 2025-11-30

## Architectural Decisions

### 1. Monorepo with Yarn Workspaces
**Decision:** Use monorepo structure instead of separate repositories

**Rationale:**
- Share TypeScript types seamlessly between API and Expo app
- Single source of truth for database schemas, API contracts
- Share validation schemas, constants, utility functions
- Coordinated changes across frontend/backend in single PR
- Better developer experience with type safety across packages

**Structure:**
```
book-summaries-megyk/
├── package.json                 # Root workspace config
├── apps/
│   ├── api/                     # Next.js API backend
│   │   ├── app/api/v1/          # API routes only (no pages)
│   │   ├── lib/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── expo/                    # Expo app (web + iOS + Android)
│       ├── app/                 # Expo Router screens
│       ├── components/
│       │   ├── ui/              # Branded components (Button, Card, etc.)
│       │   └── layout/          # Layout primitives (HStack, VStack, etc.)
│       ├── themes/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── types/                   # @megyk/types - Shared TypeScript types
│   │   ├── summaries.ts
│   │   ├── books.ts
│   │   ├── preferences.ts
│   │   ├── database.ts
│   │   └── package.json
│   ├── api-client/              # @megyk/api-client - API utilities
│   │   ├── supabase.ts          # Supabase client (cross-platform)
│   │   ├── api.ts               # API client for Next.js backend
│   │   └── package.json
│   ├── lib/                     # @megyk/lib - Shared utilities
│   │   ├── utils.ts
│   │   ├── validators.ts
│   │   └── package.json
│   └── config/                  # @megyk/config - Shared configs
│       ├── eslint-config.js
│       └── tsconfig.base.json
└── tsconfig.json                # Root TypeScript config
```

### 2. Backend Architecture
**Decision:** Keep Next.js as API-only backend

**Rationale:**
- Existing API routes are well-tested and working
- Supabase operations, file uploads, n8n webhooks all configured
- Expo app will call Next.js API routes via HTTP
- Avoid rewriting backend logic during UI migration
- Can migrate to Edge Functions later if needed

**API Communication:**
```typescript
// In @megyk/api-client
export const api = {
  summaries: {
    list: () => fetch(`${API_URL}/api/v1/summaries`),
    generate: (data) => fetch(`${API_URL}/api/v1/summary`, { method: 'POST', body: data }),
    delete: (id) => fetch(`${API_URL}/api/v1/summaries/${id}`, { method: 'DELETE' })
  }
}
```

### 3. Technology Stack

**Replacing:**
- ❌ Next.js App Router (pages) → Expo Router
- ❌ Mantine UI → GlueStack UI + NativeWind
- ❌ DOM elements (div, span) → React Native primitives (View, Text)
- ❌ Tailwind on web → NativeWind (Tailwind for React Native)

**Keeping:**
- ✅ Next.js API routes (in /apps/api)
- ✅ Supabase (client adapted for cross-platform)
- ✅ TypeScript
- ✅ Tailwind CSS principles (via NativeWind)

**Adding:**
- ➕ Expo (SDK 50+)
- ➕ React Native Web
- ➕ NativeWind (Tailwind-compatible styling for RN)
- ➕ GlueStack UI (cross-platform component library)
- ➕ Expo Router (file-based routing)

### 4. Design System - Megyk Theme

**Brand Colors:**
```typescript
const MegykColors = {
  primary: '#264653',      // Deep teal
  secondary: '#2A9D8F',    // Teal
  accent: '#E76F51',       // Coral
  background: '#F8F9FA',   // Light gray
  text: '#1D1D1D',         // Near black
}
```

**Implementation:**
- GlueStack design tokens for colors, spacing, typography
- NativeWind config extended with Megyk colors
- Dark mode support via GlueStack theme switching

## Implementation Phases

### Phase 1: Monorepo Setup (Tasks 1-8)
**Goal:** Restructure existing project as monorepo with workspace packages

**Steps:**
1. Audit current codebase - document all Mantine components used
2. Create root `package.json` with workspace configuration
3. Create `/apps` and `/packages` directories
4. Move current Next.js app to `/apps/api`
5. Strip out all frontend pages from `/apps/api` (keep only `/app/api/v1/*`)
6. Create package scaffolds: `@megyk/types`, `@megyk/api-client`, `@megyk/lib`, `@megyk/config`
7. Extract shared types from current codebase to `@megyk/types`
8. Set up TypeScript project references for monorepo

**Deliverables:**
- Monorepo structure established
- Shared packages created
- Next.js backend isolated (API routes only)
- Types extracted and shared

### Phase 2: Expo Foundation (Tasks 9-15)
**Goal:** Initialize Expo app with styling and API infrastructure

**Steps:**
9. Initialize Expo app at `/apps/expo` with web support
10. Install and configure NativeWind + Tailwind CSS
11. Install and configure GlueStack UI
12. Create Megyk brand theme (colors, spacing, typography)
13. Set up Expo Router for file-based routing
14. Create `@megyk/api-client` with Supabase client (cross-platform)
15. Create API client utilities for calling Next.js backend

**Deliverables:**
- Working Expo app that runs on web
- NativeWind and GlueStack configured
- Megyk theme implemented
- API client ready to use

### Phase 3: Component Library (Tasks 16-23)
**Goal:** Build branded UI components and port existing components

**Steps:**
16. Create branded UI primitives: Button, Card, Input, Modal, Badge
17. Create layout components: HStack, VStack, Container
18. Port DashboardLayout (Mantine AppShell → RN/GlueStack)
19. Port MainNavigation (Mantine → RN primitives)
20. Port GenerateSummaryModal (Mantine Modal → GlueStack Modal)
21. Port PreferencesForm (Mantine → GlueStack form components)
22. Port OnboardingWizard (Mantine → GlueStack)
23. Port BookCarousel (Embla → react-native-reanimated-carousel)

**Deliverables:**
- Complete UI component library
- All interactive components ported
- Components work on web + native

### Phase 4: Screen Migration (Tasks 24-26)
**Goal:** Migrate all screens from Next.js pages to Expo Router

**Steps:**
24. Migrate auth screens (signin, signup, error, confirm)
25. Migrate dashboard screens (home, library, summaries, preferences, profile)
26. Migrate homepage (hero, features, etc.)

**Deliverables:**
- All screens migrated
- Routing working with Expo Router
- Authentication flow functional

### Phase 5: Integration & Testing (Tasks 27-32)
**Goal:** Ensure all functionality works across platforms

**Steps:**
27. Configure Expo app to call Next.js API backend
28. Implement dark mode with GlueStack theme switching
29. Test all functionality on web (React Native Web)
30. Test all functionality on iOS simulator
31. Test all functionality on Android emulator
32. Verify Supabase operations (auth, database, storage) work cross-platform

**Deliverables:**
- Full feature parity with current app
- All platforms tested and working
- Supabase integration verified

### Phase 6: Cleanup & Deployment (Tasks 33-35)
**Goal:** Remove old dependencies and update deployment

**Steps:**
33. Remove all Mantine dependencies from package.json
34. Update deployment scripts (Expo web build + API deploy)
35. Update CLAUDE.md with new architecture

**Deliverables:**
- Clean dependency tree
- Updated deployment pipeline
- Documentation updated

## Component Migration Map

### Mantine → GlueStack/RN Equivalents

| Mantine Component | Replacement | Notes |
|-------------------|-------------|-------|
| `<Button>` | GlueStack `<Button>` | Wrap with Megyk theme |
| `<Card>` | GlueStack `<Box>` + styling | Custom Card component |
| `<Group>` | `<HStack>` / `<View>` | NativeWind flex classes |
| `<Stack>` | `<VStack>` / `<View>` | NativeWind flex classes |
| `<Container>` | `<View>` | Custom Container component |
| `<Text>` | GlueStack `<Text>` | Typography variants |
| `<Title>` | GlueStack `<Heading>` | Size variants |
| `<Tabs>` | GlueStack `<Tabs>` | May need custom styling |
| `<Modal>` | GlueStack `<Modal>` | Custom wrapper |
| `<Drawer>` | GlueStack `<Actionsheet>` | Mobile pattern |
| `<TextInput>` | GlueStack `<Input>` | Branded component |
| `<Select>` | GlueStack `<Select>` | Platform-specific picker |
| `<Checkbox>` | GlueStack `<Checkbox>` | Custom styling |
| `<Radio>` | GlueStack `<Radio>` | Custom styling |
| `<Switch>` | GlueStack `<Switch>` | Theme integration |
| `<Badge>` | GlueStack `<Badge>` | Branded component |
| `<AppShell>` | Custom RN layout | SafeAreaView + flex layout |
| `<Navbar>` | Custom RN component | Navigation primitives |
| `<Burger>` | Custom icon button | Expo icons |
| `<Carousel>` | `react-native-reanimated-carousel` | Different library |
| `<Slider>` | GlueStack `<Slider>` | For preferences |
| `<Notification>` | `react-native-toast-message` | Toast notifications |

### Custom Components to Build

**Core UI Components (`/apps/expo/components/ui/`):**
```typescript
- Button.tsx          // Primary, secondary, outline variants
- Card.tsx            // Branded card with shadow
- Input.tsx           // Text input with validation styles
- Modal.tsx           // Modal wrapper with backdrop
- Badge.tsx           // Status/category badges
- Header.tsx          // App header with navigation
- Avatar.tsx          // User avatar
- LoadingSpinner.tsx  // Loading indicator
```

**Layout Components (`/apps/expo/components/layout/`):**
```typescript
- HStack.tsx          // Horizontal stack with gap
- VStack.tsx          // Vertical stack with gap
- Container.tsx       // Content container with max-width
- SafeView.tsx        // SafeAreaView wrapper
- Screen.tsx          // Base screen component
```

## Critical Implementation Notes

### 1. Supabase Client Adaptation
Current Supabase client uses `@supabase/ssr` which is Next.js specific. Need to:
- Create cross-platform client in `@megyk/api-client`
- Use `@supabase/supabase-js` directly
- Handle auth differently on native (deep linking for OAuth)
- Use AsyncStorage for native, localStorage for web

### 2. File Uploads (Supabase Storage)
Current implementation uses native File API. On native:
- Use `expo-document-picker` for file selection
- Use `expo-file-system` for file operations
- Adapt upload logic for React Native

### 3. PDF Downloads
Current implementation streams PDFs. On native:
- Use `expo-file-system` to download
- Use `expo-sharing` to open PDFs
- Different UX than web download

### 4. Authentication Flow
Current flow uses Next.js redirects. On native:
- Configure deep linking (`megyk://`)
- Update Supabase redirect URLs
- Handle auth state differently (AsyncStorage)

### 5. Expo Router vs Next.js App Router
Different conventions:
```
Next.js:              Expo Router:
/app/page.tsx    →    /app/index.tsx
/app/auth/          →    /app/auth/
  signin/page.tsx       signin.tsx
/app/dashboard/     →    /app/(dashboard)/
  layout.tsx              _layout.tsx
  page.tsx                index.tsx
```

### 6. Environment Variables
Expo uses different prefix:
```bash
# Next.js
NEXT_PUBLIC_SUPABASE_URL

# Expo
EXPO_PUBLIC_SUPABASE_URL
```

## Testing Strategy

### Web (React Native Web)
- Run `npx expo start --web`
- Test in Chrome, Firefox, Safari
- Verify responsive design
- Test all features work identical to current app

### iOS
- Run `npx expo start --ios`
- Test in iOS Simulator
- Test auth flow, deep linking
- Test file uploads/downloads
- Verify native navigation patterns

### Android
- Run `npx expo start --android`
- Test in Android Emulator
- Test auth flow, deep linking
- Test file uploads/downloads
- Verify Material Design adaptations

### Cross-Platform Verification
- Sign in on web, verify session on native
- Generate summary on native, verify on web
- Test dark mode across platforms
- Verify Supabase operations (CRUD, auth, storage)

## Deployment Strategy

### Development
```bash
# Root (installs all workspaces)
yarn install

# Run API backend
cd apps/api && yarn dev

# Run Expo web
cd apps/expo && npx expo start --web

# Run iOS
cd apps/expo && npx expo start --ios

# Run Android
cd apps/expo && npx expo start --android
```

### Production

**API Backend (Next.js):**
- Existing deployment to production server
- GitHub Actions triggers `.scripts/deploy.sh`
- Restart `megyk-books.service`

**Expo Web:**
- Build: `cd apps/expo && npx expo export --platform web`
- Deploy static output to separate domain or subdirectory
- Or use Expo's web hosting

**Native Apps:**
- Build with EAS (Expo Application Services)
- Submit to App Store and Google Play
- OTA updates via Expo Updates

## Risk Mitigation

### Risk 1: Feature Parity
**Mitigation:** Audit current app thoroughly before starting migration. Create checklist of all features.

### Risk 2: Supabase Compatibility
**Mitigation:** Test Supabase client early on all platforms. Verify auth, database, storage work.

### Risk 3: Performance on Native
**Mitigation:** Profile early. Use React Native Performance Monitor. Optimize re-renders.

### Risk 4: Platform-Specific Bugs
**Mitigation:** Test frequently on all platforms during development. Don't wait until end.

### Risk 5: Breaking Production
**Mitigation:** Work on separate branch. Keep API backend functional. Deploy Expo app separately. Can rollback easily.

## Success Criteria

✅ **Complete when:**
1. Expo app renders on web, iOS, Android with identical UI
2. All current features work (auth, library, summaries, preferences, profile)
3. No Mantine dependencies remain
4. Supabase operations work across all platforms
5. API backend still functional and callable from Expo app
6. Dark mode works consistently
7. Performance is acceptable on all platforms
8. Tests pass on web, iOS simulator, Android emulator
9. Code is properly organized in monorepo structure
10. Documentation updated (CLAUDE.md)

## Next Steps

1. Begin Phase 1: Monorepo Setup
2. Start with Task 1: Audit current Mantine usage
3. Document all components that need migration
4. Proceed systematically through each phase

---

**Document Status:** Complete and ready for implementation
**Last Updated:** 2025-11-30
**Owner:** Development Team
