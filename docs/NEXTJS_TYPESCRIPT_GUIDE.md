# Next.js & TypeScript Guide for Laravel Developers

A reference guide for understanding this codebase, written for developers with Laravel/PHP background.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Routing: App Router](#routing-app-router)
3. [Middleware & Auth Flow](#middleware--auth-flow)
4. [Page Components](#page-components)
5. [API Routes](#api-routes)
6. [TypeScript Fundamentals](#typescript-fundamentals)
7. [Type Definitions](#type-definitions)
8. [Common Patterns](#common-patterns)
9. [Laravel to Next.js Cheatsheet](#laravel-to-nextjs-cheatsheet)

---

## Project Structure

```
book-summaries-megyk/
├── app/                    # Routes & pages (Next.js App Router)
│   ├── api/               # API endpoints (like Laravel controllers)
│   ├── dashboard/         # Protected pages
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Homepage (/)
├── components/             # Reusable React components
├── lib/                    # Shared utilities, types, services
│   ├── supabase/          # Database client setup
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── hooks/                  # Custom React hooks
├── public/                 # Static files (images, icons)
├── middleware.ts           # Request interceptor (route protection)
└── [config files]          # next.config.ts, tailwind.config.ts, etc.
```

### Tech Stack

| Layer | Technology | Laravel Equivalent |
|-------|------------|-------------------|
| Framework | Next.js 14+ | Laravel |
| Language | TypeScript | PHP 8+ with strict types |
| UI Library | Mantine | Blade + UI kit |
| Styling | Tailwind CSS | Tailwind CSS |
| Database | Supabase (PostgreSQL) | MySQL/PostgreSQL |
| ORM | Supabase Client | Eloquent |
| Auth | Supabase Auth | Laravel Sanctum/Breeze |

---

## Routing: App Router

In Next.js App Router, **folders = URL paths** and `page.tsx` files = what renders.

```
app/
├── page.tsx                    → yoursite.com/
├── dashboard/
│   ├── page.tsx                → yoursite.com/dashboard
│   ├── library/page.tsx        → yoursite.com/dashboard/library
│   ├── summaries/page.tsx      → yoursite.com/dashboard/summaries
│   └── profile/page.tsx        → yoursite.com/dashboard/profile
├── auth/
│   ├── signin/page.tsx         → yoursite.com/auth/signin
│   └── signup/page.tsx         → yoursite.com/auth/signup
└── api/
    └── v1/
        ├── books/route.ts      → GET/POST yoursite.com/api/v1/books
        └── summaries/route.ts  → GET/POST yoursite.com/api/v1/summaries
```

### File Extensions

- `.tsx` = TypeScript + JSX (React components with HTML-like syntax)
- `.ts` = TypeScript only (utilities, types, API routes)

---

## Middleware & Auth Flow

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER MAKES A REQUEST                         │
│                   (e.g., visits /dashboard)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     middleware.ts                               │
│         "Should this request be allowed through?"               │
│                                                                 │
│   1. Check if user is logged in (via cookies)                   │
│   2. Redirect if needed (protect routes, etc.)                  │
│   3. Refresh the auth token if it's about to expire             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Your Page Renders                           │
└─────────────────────────────────────────────────────────────────┘
```

### middleware.ts (Entry Point)

```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)  // Delegates to helper
}

export const config = {
  matcher: [/* regex for which routes to check */]
}
```

### lib/supabase/middleware.ts (The Logic)

The actual route protection logic:

```typescript
// Rule 1: Not logged in + trying to access dashboard? → Go to signin
if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  return NextResponse.redirect('/auth/signin')
}

// Rule 2: Logged in + on homepage? → Go to dashboard
if (user && request.nextUrl.pathname === '/') {
  return NextResponse.redirect('/dashboard')
}

// Rule 3: Logged in + on signin/signup page? → Go to dashboard
if (user && pathname.startsWith('/auth/signin')) {
  return NextResponse.redirect('/dashboard')
}
```

### Two Supabase Clients

| File | Use Case | Runs Where |
|------|----------|------------|
| `lib/supabase/server.ts` | API routes, server components | Server only |
| `lib/supabase/client.ts` | React components with `'use client'` | Browser |

---

## Page Components

### 'use client' Directive

```typescript
'use client';  // Line 1 of any interactive component
```

| Without `'use client'` | With `'use client'` |
|------------------------|---------------------|
| Renders on the **server** | Renders in the **browser** |
| No `useState`, `useEffect` | Can use all React hooks |
| No event handlers (`onClick`) | Full interactivity |
| Faster initial load | More JavaScript shipped |

**Laravel analogy:** Server component = Blade template, Client component = Vue/Livewire component.

### State with useState

```typescript
// Declaring state with TypeScript
const [recentSummaries, setRecentSummaries] = useState<RecentSummary[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

**Laravel/PHP equivalent:**
```php
private array $recentSummaries = [];
private bool $loading = true;
private ?string $error = null;
```

### Side Effects with useEffect

```typescript
useEffect(() => {
  fetchDashboardData();
}, []);  // Empty array = run once on component mount
```

**Laravel equivalent:** Like `boot()` method or constructor — runs when component initializes.

### Data Fetching Pattern

```typescript
const [summariesResponse, booksResponse] = await Promise.all([
  fetch('/api/v1/summaries?limit=3'),
  fetch('/api/v1/books?limit=12'),
]);
```

Fires two API requests **in parallel** (not sequentially).

**Laravel equivalent:**
```php
[$summaries, $books] = Http::pool(fn ($pool) => [
    $pool->get('/api/summaries'),
    $pool->get('/api/books'),
]);
```

### Conditional Rendering

```typescript
if (loading) {
  return <Loader />;
}

if (error) {
  return <Alert>{error}</Alert>;
}

// Render actual content...
```

Early return pattern — handle edge cases first, then render happy path.

---

## API Routes

API routes live in `app/api/` and export functions named after HTTP methods.

### Laravel Controller vs Next.js Route Handler

```php
// Laravel
class BookController extends Controller
{
    public function index(Request $request) { /* GET */ }
    public function store(Request $request) { /* POST */ }
}
```

```typescript
// Next.js: app/api/v1/books/route.ts
export async function GET(request: NextRequest) { /* handle GET */ }
export async function POST(request: NextRequest) { /* handle POST */ }
```

### Route Configuration

```typescript
export const dynamic = 'force-dynamic'  // Don't cache, always run fresh
```

### Reading Query Parameters

```typescript
// Next.js
const url = new URL(request.url)
const all = url.searchParams.get('all') === 'true'
const limit = url.searchParams.get('limit')

// Laravel equivalent
$all = $request->boolean('all');
$limit = $request->get('limit');
```

### Supabase Queries (vs Eloquent)

```typescript
// Supabase
const { data: books, error } = await supabase
  .from('books')
  .select('*')
  .eq('live', true)
  .order('created_at', { ascending: false })
  .limit(limit)
```

```php
// Laravel/Eloquent equivalent
$books = Book::where('live', true)
    ->orderBy('created_at', 'desc')
    ->limit($limit)
    ->get();
```

### JSON Responses

```typescript
// Next.js
return NextResponse.json({
  books: transformedBooks,
  pagination: { page, limit, total }
})

// Laravel equivalent
return response()->json([
    'books' => $transformedBooks,
    'pagination' => ['page' => $page, ...]
]);
```

---

## TypeScript Fundamentals

### Interfaces (Type Definitions)

```typescript
interface Book {
  id: string
  title: string
  author: string
  isbn?: string           // ? = optional property
  publication_year?: number
}
```

**PHP equivalent:**
```php
class Book {
    public string $id;
    public string $title;
    public string $author;
    public ?string $isbn = null;
    public ?int $publicationYear = null;
}
```

### Type Aliases

```typescript
type SummaryStyle = 'narrative' | 'bullet_points' | 'workbook'
type SummaryLength = 'short' | 'medium' | 'long'
```

Union types = "this value must be ONE of these options." Like PHP enums.

### Generics

```typescript
useState<RecentSummary[]>([])
//      ^^^^^^^^^^^^^^^^^
// Generic: telling TypeScript what TYPE this state holds
```

**PHP equivalent:**
```php
/** @var RecentSummary[] */
private array $summaries = [];
```

### Non-null Assertion (`!`)

```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL!
//                                  ^
// "Trust me, this value exists" — suppresses "might be undefined" error
```

### Type Assertions (`as`)

```typescript
books: transformedBooks as Book[]
// Tells TypeScript: "treat this as Book[]"
// Doesn't change runtime behavior, just satisfies type checker
```

### Destructuring with Rename

```typescript
const { data: books, error } = await supabase.from('books').select('*')
//           ^^^^^^
// Rename `data` to `books` for clarity
```

### Interface Extension

```typescript
interface Summary {
  id: string
  book_id: string
  // ...
}

interface SummaryWithBook extends Summary {
  book?: {
    title: string
    author: string
  }
}
```

Like class inheritance, but for types.

---

## Type Definitions

### Book (`lib/types/books.ts`)

```typescript
export interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  publication_year?: number
  genre?: string
  description?: string
  summary?: string
  cover_image_url?: string
  page_count?: number
  default_summary_pdf_url?: string
  created_at: string
  updated_at: string
}

export interface BooksResponse {
  books: Book[]
  count: number
}
```

### Summary (`lib/types/summaries.ts`)

```typescript
export interface Summary {
  id: string
  user_id: string
  book_id: string
  style: string
  length: string
  file_path: string
  tokens_spent: number | null    // AI tokens used
  generation_time: number | null // Time to generate
  created_at: string
  updated_at: string
}

export interface SummaryWithBook extends Summary {
  book?: {
    id: string
    title: string
    author: string
  }
}
```

### Preferences (`lib/types/preferences.ts`)

```typescript
export type SummaryStyle = 'narrative' | 'bullet_points' | 'workbook'
export type SummaryLength = 'short' | 'medium' | 'long'

export interface UserPreferences {
  style: SummaryStyle
  length: SummaryLength
}

export const SUMMARY_STYLE_OPTIONS = [
  { value: 'narrative', label: 'Narrative', description: 'Story-like flow' },
  { value: 'bullet_points', label: 'Bullet Points', description: 'Scannable' },
  { value: 'workbook', label: 'Workbook', description: 'Interactive exercises' }
] as const

export const SUMMARY_LENGTH_OPTIONS = [
  { value: 'short', label: 'Short', description: 'One sentence per chapter' },
  { value: 'medium', label: 'Medium', description: 'One paragraph per chapter' },
  { value: 'long', label: 'Long', description: 'One page per chapter' }
] as const
```

The `as const` makes these arrays immutable and gives TypeScript exact type information.

---

## Common Patterns

### Complete Request Flow

```
Browser: "GET /dashboard"
         │
         ▼
    middleware.ts ──→ User logged in? Yes ──→ Continue
         │
         ▼
    dashboard/page.tsx renders (client component)
         │
         ▼
    useEffect runs ──→ fetch('/api/v1/books?limit=12')
                              │
                              ▼
                      api/v1/books/route.ts
                              │
                              ▼
                      Supabase query
                              │
                              ▼
                      JSON response
                              │
                              ▼
    setRecommendedBooks(data) ──→ Component re-renders with books
```

### Error Handling

```typescript
try {
  const response = await fetch('/api/v1/books')
  if (!response.ok) {
    throw new Error('Failed to fetch books')
  }
  const data = await response.json()
  setBooks(data.books)
} catch (err: any) {
  setError(err.message)
} finally {
  setLoading(false)
}
```

### Loading States

```typescript
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [data, setData] = useState<Book[]>([])

// In render:
if (loading) return <Loader />
if (error) return <Alert>{error}</Alert>
return <BookList books={data} />
```

---

## Laravel to Next.js Cheatsheet

| Concept | Laravel | Next.js/React |
|---------|---------|---------------|
| **Routing** | `routes/web.php` | Folder structure in `app/` |
| **Controller** | `BookController` | `route.ts` with `GET`/`POST` functions |
| **Middleware** | `app/Http/Middleware/` | `middleware.ts` |
| **Request data** | `$request->get()` | `url.searchParams.get()` |
| **ORM queries** | Eloquent | Supabase client |
| **Views** | Blade templates | React components |
| **View state** | Livewire properties | `useState` hooks |
| **Lifecycle** | `mount()` | `useEffect(() => {}, [])` |
| **Type hints** | PHP 8 types | TypeScript interfaces |
| **Validation** | Form Requests | Zod/Yup (or manual) |
| **Auth check** | `Auth::check()` | `supabase.auth.getUser()` |
| **Auth user** | `Auth::user()` | `supabase.auth.getUser()` |
| **JSON response** | `response()->json()` | `NextResponse.json()` |
| **Env vars** | `env('KEY')` | `process.env.KEY` |
| **Public assets** | `public/` | `public/` |

---

## File Reference

| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection, auth redirects |
| `app/dashboard/page.tsx` | Main dashboard (client component example) |
| `app/api/v1/books/route.ts` | Books API endpoint (route handler example) |
| `lib/supabase/server.ts` | Server-side Supabase client |
| `lib/supabase/client.ts` | Browser-side Supabase client |
| `lib/supabase/middleware.ts` | Auth logic for middleware |
| `lib/types/books.ts` | Book type definitions |
| `lib/types/summaries.ts` | Summary type definitions |
| `lib/types/preferences.ts` | User preference types |

---

*Generated during codebase audit session. Last updated: February 2026.*
