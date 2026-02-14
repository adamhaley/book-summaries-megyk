import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createReferralService } from '@/lib/services/referrals'
import { isValidReferralCodeFormat } from '@/lib/types/referral'

/**
 * GET /api/v1/referrals/validate?code=XXXXXXXX
 * Validate a referral code (for signup page)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { valid: false, code: '', error: 'Referral code is required' },
        { status: 400 }
      )
    }

    // Quick format validation
    if (!isValidReferralCodeFormat(code)) {
      return NextResponse.json({
        valid: false,
        code: code.toUpperCase(),
        error: 'Invalid referral code format',
      })
    }

    const supabase = await createClient()
    const referralService = createReferralService(supabase)
    const validation = await referralService.getCodeByValue(code)

    return NextResponse.json({
      valid: validation.valid,
      code: validation.code,
      error: validation.error,
    })
  } catch (error) {
    console.error('Error validating referral code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
