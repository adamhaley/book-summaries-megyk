# Environment Variables Setup for Production

## Issue
The middleware is failing because `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not available at runtime.

## Solution: Set Environment Variables in systemd Service

You need to configure environment variables in your systemd service file. Here's how:

### 1. Find your systemd service file
```bash
sudo systemctl cat megyk-books.service
```

### 2. Edit the service file
```bash
sudo systemctl edit --full megyk-books.service
```

### 3. Add Environment Variables
Add an `Environment` or `EnvironmentFile` section to your service file:

**Option A: Direct Environment Variables (Recommended)**
```ini
[Service]
Environment="NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
Environment="NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here"
Environment="NEXT_PUBLIC_SITE_URL=https://megyk.com"
# Add any other environment variables you need
```

**Option B: Use Environment File**
```ini
[Service]
EnvironmentFile=/path/to/your/.env.production
```

Then create `/path/to/your/.env.production`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=https://megyk.com
```

### 4. Reload and Restart
```bash
sudo systemctl daemon-reload
sudo systemctl restart megyk-books.service
```

### 5. Verify Environment Variables
```bash
sudo systemctl show megyk-books.service | grep Environment
```

## Alternative: Set in .env.local (if using PM2 or direct node)

If you're not using systemd, create `.env.local` in your project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=https://megyk.com
```

**Note**: Next.js automatically loads `.env.local` files, but systemd services need explicit configuration.

## Required Environment Variables

Based on your codebase, you need:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL` - Your public site URL (for auth redirects)
- `SUPABASE_SERVICE_ROLE_KEY` - (Optional, for server-side operations)
- `N8N_WEBHOOK_URL` - (If using n8n)
- `RESEND_API_KEY` - (If using email)

## Testing

After setting environment variables, check the logs:
```bash
sudo journalctl -u megyk-books.service -f
```

You should no longer see the "Your project's URL and Key are required" error.

