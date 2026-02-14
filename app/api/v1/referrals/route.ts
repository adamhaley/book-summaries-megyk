import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createReferralService } from '@/lib/services/referrals'

/**
 * GET /api/v1/referrals
 * Get user's referral code and stats
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const referralService = createReferralService(supabase)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.megyk.com'
    const stats = await referralService.getReferralStats(user.id, baseUrl)

    if (!stats) {
      return NextResponse.json({ error: 'Failed to fetch referral stats' }, { status: 500 })
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching referral stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
