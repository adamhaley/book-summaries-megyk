import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Client] Missing environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
    })
    throw new Error('Missing Supabase environment variables')
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  
  // Expose to window for debugging (as suggested by ChatGPT)
  if (typeof window !== 'undefined') {
    (window as any).supabase = client
    console.log('[Supabase Client] Client created and exposed to window.supabase')
    console.log('[Supabase Client] URL:', supabaseUrl)
  }

  return client
}
