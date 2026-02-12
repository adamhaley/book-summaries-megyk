# Codebase Audit & Learning Session

*A guided tour of the Megyk Books codebase for a Laravel developer learning Next.js and TypeScript.*

---

## Session Overview

**Goal:** Audit the codebase to understand how it works while learning Next.js and TypeScript fundamentals.

**Approach:** Guided tour structure, mapping Laravel concepts to Next.js equivalents.

**Background:** The codebase was "vibe coded" — built with AI assistance. This session provides firsthand understanding of how the pieces connect.

---

## Part 1: Architecture Overview

### What This App Does

Megyk Books is a **book summaries platform** where users can:
- Browse a library of books
- Generate AI-powered summaries (via n8n webhook)
- Chat with books (AI-powered Q&A)
- Customize summary preferences (style, length)
- Download summaries as PDFs

### Tech Stack

| Layer | Technology | Laravel Equivalent |
|-------|------------|-------------------|
| Framework | Next.js 14+ (App Router) | Laravel |
| Language | TypeScript | PHP 8+ with strict types |
| UI Library | Mantine | Blade + UI kit |
| Styling | Tailwind CSS | Tailwind CSS |
| Database | Supabase (PostgreSQL) | MySQL/PostgreSQL |
| ORM | Supabase Client | Eloquent |
| Auth | Supabase Auth | Laravel Sanctum/Breeze |
| AI Integration | n8n webhooks | Queue jobs / external API |
| Email | Resend | Laravel Mail |
| PWA | Serwist | N/A |

### Project Structure

```
book-summaries-megyk/
├── app/                    # Routes & pages (Next.js App Router)
│   ├── api/               # API endpoints (controllers)
│   ├── dashboard/         # Protected pages
│   ├── auth/              # Auth pages
│   └── page.tsx           # Homepage
├── components/             # Reusable React components
├── lib/                    # Shared utilities, types, services
│   ├── supabase/          # Database client setup
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── hooks/                  # Custom React hooks
├── public/                 # Static files
├── middleware.ts           # Request interceptor
└── [config files]
```

---

## Part 2: Middleware & Auth Flow

### Key Insight

The middleware looks like a lot of ceremony, but it's really just:
- **~25 lines:** Cookie handling boilerplate (glue between Supabase and Next.js)
- **~15 lines:** Actual business logic (3 redirect rules)

### The Three Rules

```typescript
// Rule 1: Protect dashboard
if (!user && pathname.startsWith('/dashboard')) → redirect to /auth/signin

// Rule 2: Logged-in users skip homepage
if (user && pathname === '/') → redirect to /dashboard

// Rule 3: Logged-in users can't access auth pages
if (user && pathname.startsWith('/auth/signin')) → redirect to /dashboard
```

### Why Two Supabase Clients?

| File | Context | Why |
|------|---------|-----|
| `lib/supabase/server.ts` | Server (API routes, middleware) | Uses Next.js `cookies()` API |
| `lib/supabase/client.ts` | Browser (React components) | Uses browser cookie handling |

Same database, different environments need different cookie access.

### Laravel Comparison

| Laravel | Next.js + Supabase |
|---------|-------------------|
| `config/auth.php` | Cookie config objects |
| `Authenticate.php` middleware | `updateSession()` function |
| `routes/web.php` middleware groups | `config.matcher` regex |
| `Auth::check()` | `supabase.auth.getUser()` |

---

## Part 3: Page Components

### The Most Important Line

```typescript
'use client';  // Makes this a client component
```

**Without it:** Server-rendered, no interactivity, no hooks
**With it:** Browser-rendered, full React interactivity

### State Management Pattern

```typescript
// Declare state with types
const [books, setBooks] = useState<Book[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Fetch data on mount
useEffect(() => {
  fetchData();
}, []);

// Render based on state
if (loading) return <Loader />;
if (error) return <Alert>{error}</Alert>;
return <BookList books={books} />;
```

### Key TypeScript Concepts Discovered

**Generics with useState:**
```typescript
useState<Book[]>([])  // "This state holds an array of Book objects"
```

**Union types for nullable values:**
```typescript
useState<string | null>(null)  // "Either a string or null"
```

**Optional properties:**
```typescript
interface Book {
  title: string      // required
  isbn?: string      // optional (the ? makes it optional)
}
```

### Parallel Data Fetching

```typescript
// Fires both requests simultaneously, waits for both
const [summaries, books] = await Promise.all([
  fetch('/api/v1/summaries'),
  fetch('/api/v1/books'),
]);
```

Laravel equivalent: `Http::pool()`

---

## Part 4: API Routes

### Structure

Function name = HTTP method:

```typescript
// app/api/v1/books/route.ts
export async function GET(request: NextRequest) { }  // handles GET
export async function POST(request: NextRequest) { } // handles POST
```

### Key Configuration

```typescript
export const dynamic = 'force-dynamic'  // Don't cache, always fresh
```

### Query Parameters

```typescript
const url = new URL(request.url)
const limit = url.searchParams.get('limit')
const page = url.searchParams.get('page') || '1'
```

Laravel: `$request->get('limit')`

### Supabase Queries (Eloquent-like)

```typescript
// Supabase
const { data, error } = await supabase
  .from('books')
  .select('*')
  .eq('live', true)
  .order('title', { ascending: true })
  .range(0, 9)

// Eloquent equivalent
Book::where('live', true)
    ->orderBy('title')
    ->offset(0)->limit(10)
    ->get();
```

### Response Format

```typescript
return NextResponse.json({
  books: data,
  pagination: { page, limit, total }
})
```

---

## Part 5: TypeScript Types

### Location

All types live in `lib/types/`:
- `books.ts` — Book interface
- `summaries.ts` — Summary interfaces
- `preferences.ts` — User preference types

### Key Patterns

**Interface (object shape):**
```typescript
interface Book {
  id: string
  title: string
  author: string
}
```

**Type alias (union of values):**
```typescript
type SummaryStyle = 'narrative' | 'bullet_points' | 'workbook'
```

**Interface extension:**
```typescript
interface SummaryWithBook extends Summary {
  book?: { title: string; author: string }
}
```

**Const assertions:**
```typescript
const OPTIONS = [...] as const  // Immutable, exact types
```

---

## Complete Request Flow Example

**User visits /dashboard:**

```
1. Browser requests /dashboard
         │
         ▼
2. middleware.ts intercepts
   - Checks cookies for session
   - Validates with Supabase
   - User logged in? Continue. Not logged in? Redirect to /auth/signin
         │
         ▼
3. app/dashboard/page.tsx renders
   - 'use client' directive = runs in browser
   - useState initializes loading=true
         │
         ▼
4. useEffect fires on mount
   - Calls fetch('/api/v1/books')
   - Calls fetch('/api/v1/summaries')
   - (parallel requests)
         │
         ▼
5. app/api/v1/books/route.ts handles request
   - Creates Supabase server client
   - Queries database
   - Returns JSON
         │
         ▼
6. Response arrives in browser
   - setBooks(data) updates state
   - setLoading(false)
   - Component re-renders with data
```

---

## Laravel to Next.js Mental Model

| Concept | Laravel | Next.js |
|---------|---------|---------|
| Routing | `routes/web.php` | Folder structure |
| Controllers | `app/Http/Controllers/` | `app/api/**/route.ts` |
| Middleware | `app/Http/Middleware/` | `middleware.ts` |
| Views | Blade templates | React components |
| Livewire state | `public $property` | `useState()` |
| Livewire mount | `mount()` | `useEffect(..., [])` |
| DTOs/Resources | PHP classes | TypeScript interfaces |
| Eloquent | `Model::where()` | `supabase.from().select()` |

---

## Files Examined

| File | What We Learned |
|------|-----------------|
| `middleware.ts` | Entry point, delegates to helper |
| `lib/supabase/middleware.ts` | Auth logic, route protection rules |
| `lib/supabase/server.ts` | Server-side DB client |
| `lib/supabase/client.ts` | Browser-side DB client |
| `app/dashboard/page.tsx` | Client component patterns, state, data fetching |
| `app/api/v1/books/route.ts` | API route handler, query params, Supabase queries |
| `lib/types/books.ts` | Book interface definition |
| `lib/types/summaries.ts` | Summary interfaces, extension pattern |
| `lib/types/preferences.ts` | Type aliases, const assertions |

---

## Key Takeaways

1. **App Router uses folder structure for routing** — no route files to maintain

2. **`'use client'` is the key directive** — determines where component runs

3. **Middleware is simpler than it looks** — most is cookie boilerplate, actual logic is ~15 lines

4. **Supabase queries feel like Eloquent** — similar chaining syntax

5. **TypeScript interfaces = PHP type hints** — but more powerful with unions and generics

6. **Two Supabase clients exist for a reason** — server vs browser cookie handling

7. **The ceremony ratio is real** — ~60% boilerplate, ~40% logic in auth code (normal for auth)

---

## Next Steps / Topics to Explore

- [ ] Walk through "generate summary" feature end-to-end
- [ ] Explore PWA / service worker setup
- [ ] Look at testing configuration
- [ ] Understand the n8n webhook integration
- [ ] Deep dive into specific components (ChatWithBook, BookCarousel)

---

## Related Documentation

- `docs/NEXTJS_TYPESCRIPT_GUIDE.md` — Reference guide with cheatsheets
- `docs/CLAUDE.md` — AI assistant context for the project
- `docs/PRD.md` — Product requirements document

---

*Session conducted: February 2026*
