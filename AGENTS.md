# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds the Next.js App Router pages and API routes (e.g., `app/api/v1/*`).
- `components/` contains reusable React UI pieces (dashboard, summary, preferences).
- `lib/` provides shared helpers (Supabase clients, types, theme, utilities).
- `tests/e2e/` hosts end-to-end specs (`features/` for Cucumber, `playwright/` for Playwright).
- `supabase/migrations/` stores SQL migrations for tables, RLS, and storage buckets.
- `public/` and `book-covers/` store static assets; `scripts/` contains one-off tooling.

## Build, Test, and Development Commands
- `yarn dev` runs the Next.js dev server on port 3000.
- `yarn build` creates a production build; `yarn start` serves it.
- `yarn lint` runs Next.js linting.
- `yarn test:e2e` runs all Cucumber features in `tests/e2e/features/*.feature`.
- `yarn test:playwright` runs Playwright specs in `tests/e2e/playwright/*.spec.ts`.
- `yarn upload-covers` executes `scripts/upload-book-covers.ts` to push cover assets.

## Coding Style & Naming Conventions
- TypeScript + React with Next.js App Router; follow existing formatting in nearby files.
- Component files use `PascalCase` (e.g., `GenerateSummaryModal.tsx`); hooks use `useX`.
- Route segments and folders in `app/` are lowercase; API routes are versioned under `app/api/v1`.
- Tailwind CSS + Mantine are used together; prefer `cn()` from `lib/utils.ts` for class merges.

## Testing Guidelines
- Cucumber features live in `tests/e2e/features/` with step defs in `tests/e2e/step-definitions/`.
- Playwright specs live in `tests/e2e/playwright/` and end with `.spec.ts`.
- There is no stated coverage target; focus on critical flows (auth, library, summaries).

## Commit & Pull Request Guidelines
- Recent commit messages are short, lowercase, and descriptive (no prefixes); follow that style.
- PRs should include a concise summary, test evidence (commands/output), and screenshots for UI changes.
- Link related issues or docs (e.g., `PRD.md`, `DEPLOYMENT_CHECKLIST.md`) when relevant.

## Configuration & Environment Notes
- Copy `.env.local.example` to `.env.local` and fill Supabase, n8n, and Resend values.
- For database changes, add a new file in `supabase/migrations/` with a numeric prefix.
