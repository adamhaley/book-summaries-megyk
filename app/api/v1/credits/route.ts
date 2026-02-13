import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCreditService } from '@/lib/services/credits'

/**
 * GET /api/v1/credits
 * Get current user's credit balance and recent transactions
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const creditService = createCreditService(supabase)

    // Get balance and recent transactions in parallel
    const [balance, transactions] = await Promise.all([
      creditService.getBalance(user.id),
      creditService.getRecentTransactions(user.id, 10),
    ])

    if (!balance) {
      return NextResponse.json(
        { error: 'Credit balance not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      balance,
      recent_transactions: transactions,
    })
  } catch (error) {
    console.error('Error fetching credits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
