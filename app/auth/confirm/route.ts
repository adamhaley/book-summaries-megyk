import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  // Use the correct public URL, not the internal origin
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://megyk.com'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Redirect to the specified URL or dashboard on success
      return NextResponse.redirect(new URL(next, publicUrl))
    }

    // If there's an error, redirect to an error page
    return NextResponse.redirect(
      new URL('/auth/error?message=Email verification failed', publicUrl)
    )
  }

  // Missing token_hash or type
  return NextResponse.redirect(
    new URL('/auth/error?message=Invalid verification link', publicUrl)
  )
}
