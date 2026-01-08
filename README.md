# book-summaries-megyk

Next.js app (Book Summaries) + optional local Supabase (Docker Compose).

### Run via Docker (production build)

The `Dockerfile` builds the Next.js app and serves it on **port 3200**.

```bash
docker build -t megyk-books .
docker run --rm -p 3200:3200 megyk-books
```

## Environment variables

- **App (Next.js)**: create `.env.local` with at least:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`
  - (optional) `SUPABASE_SERVICE_ROLE_KEY`, `N8N_WEBHOOK_URL`, `RESEND_API_KEY`

- **Docker Compose (Supabase)**: `docker compose` will read variables from a `.env` file in the repo root (e.g. `POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`, port variables, etc.).


