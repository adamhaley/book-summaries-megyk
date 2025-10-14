# Architecture Overview: Personalized Book Summarizer (Web + Mobile Roadmap)

## 1. High-Level Vision
The platform delivers AI-generated, reader-personalized book summaries.  
Phase 1 launches as a web app. Later phases extend to Progressive Web App (PWA) and fully native mobile (React Native / Expo) without re-architecting.

## 2. Core Design Principles
- **Iterate fast:** use hosted services for storage, auth, and automation.
- **Portability:** keep all UI and logic React-based for reuse on web + mobile.
- **Separation of concerns:** clean API boundary between presentation, automation, and data layers.
- **Scalability:** Postgres + vector embeddings (Supabase pgvector) support personalization queries at scale.

## 3. System Diagram (Conceptual)

User → Next.js (Web/PWA)
↓
Supabase Auth ←→ Supabase Postgres (book data, user profiles, embeddings)
↓
n8n (automation + LLM workflows)
↓
Ollama / OpenAI APIs (embeddings, summary generation)

## 4. Technology Stack

| Layer | Technology | Rationale |
|-------|-------------|-----------|
| **Frontend (Web)** | **Next.js 15 + React 19 (App Router) + Tailwind CSS + Mantine UI** | Modern React SSR/ISR framework with excellent SEO and smooth migration to React Native Web. Mantine provides comprehensive dashboard components with TypeScript-first design. |
| **Frontend (Mobile, later)** | **React Native / Expo** | Shares component logic and hooks from the web app; supports offline + native distribution. |
| **Backend / Database** | **Supabase (Postgres, Auth, Storage, pgvector)** | Managed backend with instant REST + GraphQL APIs, native vector search, and RLS for multi-user security. |
| **Automation & AI Orchestration** | **n8n (self-hosted)** | Handles LLM calls, embedding pipelines, and background jobs; accessible through HTTP webhooks. |
| **AI Models** | **Ollama (local) / OpenAI API (cloud)** | Flexible embedding + generation engines; interchangeable per environment. |
| **Deployment** | **Vercel (Next.js), Supabase Cloud, DO Droplet for n8n/Ollama** | Simple CI/CD, global edge network, existing infra reuse. |

## 5. Monorepo Structure (Future-Ready)

/apps
/web → Next.js (PWA)
/mobile → Expo / React Native
/packages
/ui → shared React components
/api → Supabase + n8n API client
/lib → hooks, utils, schemas

- Use **Turborepo** or **Nx** for workspace builds.
- Shared TypeScript types across all apps.

## 6. API Design
- Expose a minimal REST/GraphQL domain layer:
  - `/api/books` – fetch summaries & embeddings
  - `/api/profile` – update user preferences
  - `/api/summary` – trigger summary generation via n8n webhook
- Version endpoints (`/v1/...`) to allow future SDK/public API.

## 7. Progressive Web App (Phase 2)
- Enable service workers and offline cache via `next-pwa`.
- Add push notifications and install banners for mobile-like UX.
- Provides immediate cross-device functionality before native app.

## 8. Mobile App (Phase 3)
- Build with **Expo + React Native Web** using shared component library.
- Continue using the same Supabase + n8n backend and auth.
- Add native features (notifications, downloads, voice summaries).

## 9. Data Schema Summary (Supabase)
- `books`, `chapters`, `embeddings` – core content
- `user_profiles` – demographic + preference JSON
- `summary_requests` – generation logs & feedback

## 10. Future Extensions
- User feedback loop → improve model fine-tuning
- Offline reading / caching for premium tier
- Analytics dashboard (reading time, engagement)
- Integration with eBook sources via RSS / API

## 11. Stack Justification
| Criterion | Laravel / PHP | Next.js / React |
|------------|---------------|----------------|
| Web speed & SSR | ✅ | ✅ |
| Mobile code reuse | ❌ | ✅ (React Native Web) |
| API integration w/ n8n + Supabase | ⚙️ extra adapters | ✅ native TS ecosystem |
| Developer velocity | High | High |
| Long-term maintainability | Medium | High |
→ **Decision:** Adopt **Next.js + Supabase + n8n** for MVP to ensure direct portability to React Native.

## 12. UI Component Strategy

### Primary: Mantine UI
**Decision:** Adopted **Mantine UI** as the primary component library for the web application.

**Rationale:**
- **Dashboard-First Design** - AppShell, responsive navigation, and layout components optimized for admin/dashboard interfaces
- **Complete Form System** - Rich form components with validation, built-in accessibility
- **TypeScript Native** - First-class TypeScript support improves developer experience
- **Theme System** - Built-in dark mode, color schemes, and design token system
- **Rich Component Library** - Modals, notifications, overlays, tables, and data visualization components
- **Active Ecosystem** - Well-maintained with regular updates and strong community

### Implementation Notes
- Dashboard uses Mantine's **AppShell** for layout (see `components/dashboard/DashboardLayout.tsx`)
- Proper SSR hydration handling with `defaultColorScheme="light"`
- Tabler Icons integrated for consistent iconography
- Theme customization via `lib/theme.ts`

## 13. Summary
> **Architecture Goal:** One React-centric codebase powering web, PWA, and mobile apps, connected to a single Supabase + n8n backend and AI layer.
> This minimizes tech debt, accelerates MVP launch, and guarantees seamless transition to native mobile deployment.
>
> **UI Strategy:** Mantine UI as the sole component library provides a production-ready, TypeScript-native system with minimal custom styling, allowing rapid development of dashboard interfaces while maintaining design consistency. This streamlined approach reduces complexity and potential style conflicts.


