# @megyk/api-client

Cross-platform API client for Megyk Books platform.

## Features

- **Cross-platform Supabase client** - Works on web (React Native Web), iOS, and Android
- **Automatic session management** - Uses AsyncStorage on React Native, localStorage on web
- **Type-safe** - Full TypeScript support with generated types from @megyk/types

## Installation

This package is part of the monorepo workspace and is automatically linked.

### Dependencies for React Native

For React Native apps, install AsyncStorage:

```bash
yarn add @react-native-async-storage/async-storage
```

## Usage

### Create Supabase Client

```typescript
import { createSupabaseClient } from '@megyk/api-client';

// Option 1: With explicit credentials
const supabase = createSupabaseClient(
  'https://supabase.megyk.com',
  'your-anon-key'
);

// Option 2: From environment variables
import { createClientFromEnv } from '@megyk/api-client';
const supabase = createClientFromEnv();
```

### Environment Variables

#### Expo App
Set in `.env` or `app.config.js`:
```
EXPO_PUBLIC_SUPABASE_URL=https://supabase.megyk.com
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Next.js App
Set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://supabase.megyk.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Database Queries

```typescript
import type { Summary } from '@megyk/types';

// Fetch summaries
const { data, error } = await supabase
  .from('summaries')
  .select('*')
  .eq('user_id', userId);

// Insert summary
const { data, error } = await supabase
  .from('summaries')
  .insert({
    user_id: userId,
    book_id: bookId,
    style: 'narrative',
    length: '5pg',
    file_path: 'user_123/summary_456.pdf',
  });
```

## Platform Detection

The client automatically detects the platform and uses the appropriate storage:

- **React Native (iOS/Android)**: Uses `@react-native-async-storage/async-storage`
- **Web (React Native Web)**: Uses browser `localStorage`

## Architecture

```
@megyk/api-client/
├── src/
│   ├── index.ts          # Public exports
│   ├── supabase.ts       # Supabase client factory
│   └── api.ts            # API utilities (future)
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Type check
cd packages/api-client
yarn type-check
```

## Dependencies

- `@supabase/supabase-js` - Supabase JavaScript client
- `@megyk/types` - Shared TypeScript types
- `@react-native-async-storage/async-storage` (peer dependency for React Native)

## API Client for Next.js Backend

The package includes a type-safe API client for calling your Next.js backend routes.

### Basic Usage

```typescript
import { createApiClient, createRoutes } from '@megyk/api-client';

// Create API client
const apiClient = createApiClient({
  baseUrl: 'https://megyk.com',
  timeout: 30000, // optional, defaults to 30s
});

// Create type-safe route helpers
const api = createRoutes(apiClient);

// Use the API
const summaries = await api.summaries.list();
const profile = await api.profile.get();
```

### Generate Summary

```typescript
const result = await api.summaries.generate({
  bookId: 'book_123',
  style: 'narrative',
  length: '5pg',
});

console.log('Summary generated:', result.summaryId);
```

### Error Handling

```typescript
import type { ApiError } from '@megyk/api-client';

try {
  await api.summaries.generate({ ... });
} catch (error) {
  const apiError = error as ApiError;
  console.error(`Error ${apiError.status}: ${apiError.message}`);
  
  if (apiError.code === 'TIMEOUT') {
    console.log('Request timed out');
  }
}
```

### Environment Variables

```typescript
import { createApiClientFromEnv } from '@megyk/api-client';

// Automatically uses EXPO_PUBLIC_API_URL or NEXT_PUBLIC_API_URL
const apiClient = createApiClientFromEnv();
const api = createRoutes(apiClient);
```

Set in `.env`:
```bash
EXPO_PUBLIC_API_URL=https://megyk.com
# or for Next.js
NEXT_PUBLIC_API_URL=https://megyk.com
```

## Combined Example

Use both Supabase and API clients together:

```typescript
import { 
  createClientFromEnv, 
  createApiClientFromEnv, 
  createRoutes 
} from '@megyk/api-client';

// Supabase for auth and database
const supabase = createClientFromEnv();

// API client for backend routes
const apiClient = createApiClientFromEnv();
const api = createRoutes(apiClient);

// Sign in
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Get user's summaries
const summaries = await api.summaries.list();

// Generate new summary
const result = await api.summaries.generate({
  bookId: 'book_123',
  style: 'narrative',
  length: '5pg',
});
```
