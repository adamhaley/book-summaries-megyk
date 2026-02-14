import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUTMFromCookies } from '@/lib/utils/utm.server'
import { hasUTMParams, parseUTMFromSearchParams, UTM_COOKIE_EXPIRY, UTM_COOKIE_NAME } from '@/lib/utils/utm'
import { createReferralService } from '@/lib/services/referrals'
import { REFERRAL_CODE_PARAM, REFERRAL_CODE_COOKIE } from '@/lib/types/referral'

export async function GET(request: NextRequest) {
  console.log('🔵 [CONFIRM ROUTE] Request received')

  const requestUrl = new URL(request.url)
  const utmFromQuery = parseUTMFromSearchParams(requestUrl.searchParams)
  // Support both 'token_hash' (new) and 'token' (legacy) parameter names
  const token_hash = requestUrl.searchParams.get('token_hash') || requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const redirectTo = requestUrl.searchParams.get('redirect_to')

  console.log('🔵 [CONFIRM ROUTE] Full URL:', request.url)
  console.log('🔵 [CONFIRM ROUTE] token_hash param:', requestUrl.searchParams.get('token_hash') ? 'present' : 'missing')
  console.log('🔵 [CONFIRM ROUTE] token param:', requestUrl.searchParams.get('token') ? 'present' : 'missing')
  console.log('🔵 [CONFIRM ROUTE] Using token:', token_hash ? `${token_hash.substring(0, 20)}...` : 'MISSING')
  console.log('🔵 [CONFIRM ROUTE] type:', type)

  // Use the correct public URL, not the internal origin
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.megyk.com'

  if (token_hash && type) {
    console.log('🔵 [CONFIRM ROUTE] Token and type present, verifying with Supabase...')
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      console.log('✅ [CONFIRM ROUTE] Verification SUCCESS - redirecting to dashboard')
      
      // Get user data after successful verification
      const { data: userData } = await supabase.auth.getUser()

      // Prefer UTM parameters from the confirmation redirect URL (works across devices),
      // otherwise fall back to cookies (works within the same browser).
      console.log('🔍 [CONFIRM ROUTE] Checking for UTM params...')

      const parseUTMFromUrlValue = (value: string | null) => {
        if (!value) return null
        try {
          const url = new URL(value, publicUrl)
          return parseUTMFromSearchParams(url.searchParams)
        } catch {
          return null
        }
      }

      const utmFromRedirectParam = parseUTMFromUrlValue(redirectTo)
      const utmFromNextParam = parseUTMFromUrlValue(next)
      const utmFromCookie = await getUTMFromCookies()
      const utmParams =
        (hasUTMParams(utmFromQuery) && utmFromQuery) ||
        (utmFromRedirectParam && hasUTMParams(utmFromRedirectParam) && utmFromRedirectParam) ||
        (utmFromNextParam && hasUTMParams(utmFromNextParam) && utmFromNextParam) ||
        utmFromCookie

      console.log(
        '🔍 [CONFIRM ROUTE] UTM params (query/redirect preferred):',
        utmParams ? JSON.stringify(utmParams) : 'null/empty'
      )
      
      // Call n8n webhook after successful email verification
      try {
        const webhookUrl = process.env.N8N_SIGNUP_WEBHOOK_URL
        console.log('🔔 [CONFIRM ROUTE] Webhook URL:', webhookUrl ? 'configured' : 'NOT SET')
        if (webhookUrl) {
          console.log('🔔 [CONFIRM ROUTE] Calling verification webhook...', {
            event: 'user_verified',
            email: userData.user?.email,
            user_id: userData.user?.id,
          })
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-idempotency-key': userData.user?.id || '',
            },
            body: JSON.stringify({
              event: 'user_verified',
              email: userData.user?.email,
              user_id: userData.user?.id,
              utm: utmParams,
            }),
          })
          console.log('✅ [CONFIRM ROUTE] Webhook called successfully, status:', response.status)
        } else {
          console.error('❌ [CONFIRM ROUTE] N8N_SIGNUP_WEBHOOK_URL not configured!')
        }
      } catch (webhookError) {
        console.error('❌ [CONFIRM ROUTE] Verification webhook failed:', webhookError)
        // Don't fail the verification if webhook fails
      }
      
      // Handle referral code if present
      // Check URL params first (works across devices), then fall back to cookie (same browser)
      const referralCodeFromUrl = requestUrl.searchParams.get(REFERRAL_CODE_PARAM)
      const referralCodeFromCookie = request.cookies.get(REFERRAL_CODE_COOKIE)?.value
      const referralCode = referralCodeFromUrl || referralCodeFromCookie

      if (referralCode && userData.user) {
        console.log('🎁 [CONFIRM ROUTE] Referral code found:', referralCode)
        try {
          const referralService = createReferralService(supabase)
          const result = await referralService.createPendingReferral(userData.user.id, referralCode)
          if (result.success) {
            console.log('✅ [CONFIRM ROUTE] Pending referral created successfully')
          } else {
            console.log('⚠️ [CONFIRM ROUTE] Referral not created:', result.error)
          }
        } catch (referralError) {
          console.error('❌ [CONFIRM ROUTE] Error creating referral:', referralError)
          // Don't fail the verification if referral creation fails
        }
      }

      // Redirect to the specified URL or dashboard on success
      const redirectResponse = NextResponse.redirect(new URL(next, publicUrl))

      // Clear referral code cookie if it was used
      if (referralCodeFromCookie) {
        redirectResponse.cookies.set(REFERRAL_CODE_COOKIE, '', {
          path: '/',
          maxAge: 0,
        })
      }

      // Persist UTM params from the confirmation flow (so they survive the redirect to /dashboard)
      if (utmParams && hasUTMParams(utmParams)) {
        redirectResponse.cookies.set(UTM_COOKIE_NAME, JSON.stringify(utmParams), {
          path: '/',
          maxAge: Math.floor(UTM_COOKIE_EXPIRY / 1000),
          sameSite: 'lax',
        })
      }

      return redirectResponse
    }

    console.error('❌ [CONFIRM ROUTE] Verification FAILED:', error)
    // If there's an error, redirect to an error page
    return NextResponse.redirect(
      new URL('/auth/error?message=Email verification failed', publicUrl)
    )
  }

  console.error('❌ [CONFIRM ROUTE] Missing token_hash or type')
  // Missing token_hash or type
  return NextResponse.redirect(
    new URL('/auth/error?message=Invalid verification link', publicUrl)
  )
}
