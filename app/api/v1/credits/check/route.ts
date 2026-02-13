import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCreditService } from '@/lib/services/credits'
import { SummaryStyle, SummaryLength } from '@/lib/types/preferences'
import { getSummaryCreditCost, getChatMessageCreditCost } from '@/lib/types/credits'

interface CreditCheckRequest {
  action_type: 'summary' | 'chat_message'
  style?: SummaryStyle
  length?: SummaryLength
}

/**
 * POST /api/v1/credits/check
 * Check if user can afford a specific action
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CreditCheckRequest = await request.json()
    const { action_type, style, length } = body

    if (!action_type) {
      return NextResponse.json(
        { error: 'action_type is required' },
        { status: 400 }
      )
    }

    // Calculate required credits
    let requiredCredits: number

    if (action_type === 'summary') {
      if (!style || !length) {
        return NextResponse.json(
          { error: 'style and length are required for summary actions' },
          { status: 400 }
        )
      }
      requiredCredits = getSummaryCreditCost(style, length)
    } else if (action_type === 'chat_message') {
      requiredCredits = getChatMessageCreditCost()
    } else {
      return NextResponse.json(
        { error: 'Invalid action_type' },
        { status: 400 }
      )
    }

    const creditService = createCreditService(supabase)
    const result = await creditService.checkBalance(user.id, requiredCredits)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking credits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
