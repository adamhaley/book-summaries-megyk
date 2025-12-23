# Fix: Client-Side Supabase Error

## The Problem

You're seeing this error in the browser console:
```
@supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

This happens because `NEXT_PUBLIC_*` environment variables are **embedded into the JavaScript bundle at BUILD time**, not runtime.

## The Solution

Even though you added `.env.local`, you need to **rebuild the application** for the environment variables to be included in the client-side bundle.

### Steps to Fix:

1. **Verify `.env.local` exists in your project root** with:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_SITE_URL=https://megyk.com
   ```

2. **Rebuild the application** (on your server):
   ```bash
   cd ~/book-summaries-megyk
   yarn build
   ```

3. **Restart the service**:
   ```bash
   sudo systemctl restart megyk-books.service
   ```

4. **Clear your browser cache** or do a hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

## Why This Happens

- Next.js embeds `NEXT_PUBLIC_*` variables into the client JavaScript bundle during `yarn build`
- If you add `.env.local` after building, those variables won't be in the existing bundle
- You must rebuild to get the new environment variables into the client code

## Quick Check

After rebuilding, you can verify the variables are embedded by:
1. Opening browser DevTools
2. Going to the Network tab
3. Finding a JavaScript bundle file (like `_app-*.js`)
4. Searching for your Supabase URL - it should be in the file

## Alternative: Runtime Environment Variables

If you need environment variables to change without rebuilding, you'd need to:
1. Use a different approach (like a config API endpoint)
2. Or use server-side rendering instead of client-side

But for most cases, rebuilding after adding `.env.local` is the standard approach.


