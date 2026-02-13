/**
 * Credit service layer for managing user credits
 * Handles balance checks, deductions, and additions
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  CreditBalance,
  CreditTransaction,
  CreditTransactionType,
  CreditCheckResult,
  CREDIT_COSTS,
  getSummaryCreditCost,
  getChatMessageCreditCost,
} from '@/lib/types/credits'
import { SummaryStyle, SummaryLength } from '@/lib/types/preferences'

export class CreditService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Get the current credit balance for a user
   */
  async getBalance(userId: string): Promise<CreditBalance | null> {
    const { data, error } = await this.supabase
      .from('credit_balances')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching credit balance:', error)
      return null
    }

    return data as CreditBalance
  }

  /**
   * Check if user has sufficient credits for an action
   */
  async checkBalance(
    userId: string,
    requiredCredits: number
  ): Promise<CreditCheckResult> {
    const balance = await this.getBalance(userId)

    if (!balance) {
      return {
        has_sufficient_credits: false,
        current_balance: 0,
        required_credits: requiredCredits,
        remaining_after: -requiredCredits,
      }
    }

    const remaining = balance.current_balance - requiredCredits

    return {
      has_sufficient_credits: remaining >= 0,
      current_balance: balance.current_balance,
      required_credits: requiredCredits,
      remaining_after: remaining,
    }
  }

  /**
   * Check if user can afford a summary generation
   */
  async checkSummaryAffordability(
    userId: string,
    style: SummaryStyle,
    length: SummaryLength
  ): Promise<CreditCheckResult> {
    const cost = getSummaryCreditCost(style, length)
    return this.checkBalance(userId, cost)
  }

  /**
   * Check if user can afford a chat message
   */
  async checkChatAffordability(userId: string): Promise<CreditCheckResult> {
    const cost = getChatMessageCreditCost()
    return this.checkBalance(userId, cost)
  }

  /**
   * Deduct credits from user balance
   * Returns the transaction record or null if insufficient funds
   */
  async deductCredits(
    userId: string,
    amount: number,
    transactionType: CreditTransactionType,
    referenceId?: string,
    referenceType?: string,
    description?: string,
    metadata?: Record<string, unknown>
  ): Promise<CreditTransaction | null> {
    // First check current balance
    const balance = await this.getBalance(userId)

    if (!balance) {
      console.error('No credit balance found for user:', userId)
      return null
    }

    if (balance.current_balance < amount) {
      console.error('Insufficient credits:', {
        userId,
        required: amount,
        available: balance.current_balance,
      })
      return null
    }

    const balanceBefore = balance.current_balance
    const balanceAfter = balanceBefore - amount

    // Create the transaction record (triggers will update balance)
    const { data, error } = await this.supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -amount, // Negative for deductions
        transaction_type: transactionType,
        reference_id: referenceId || null,
        reference_type: referenceType || null,
        description: description || `${transactionType} deduction`,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating credit transaction:', error)
      return null
    }

    return data as CreditTransaction
  }

  /**
   * Add credits to user balance
   * Returns the transaction record
   */
  async addCredits(
    userId: string,
    amount: number,
    transactionType: CreditTransactionType,
    referenceId?: string,
    referenceType?: string,
    description?: string,
    metadata?: Record<string, unknown>
  ): Promise<CreditTransaction | null> {
    // First get current balance
    const balance = await this.getBalance(userId)

    if (!balance) {
      console.error('No credit balance found for user:', userId)
      return null
    }

    const balanceBefore = balance.current_balance
    const balanceAfter = balanceBefore + amount

    // Create the transaction record (triggers will update balance)
    const { data, error } = await this.supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: amount, // Positive for additions
        transaction_type: transactionType,
        reference_id: referenceId || null,
        reference_type: referenceType || null,
        description: description || `${transactionType} credit`,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating credit transaction:', error)
      return null
    }

    return data as CreditTransaction
  }

  /**
   * Deduct credits for summary generation
   */
  async deductForSummary(
    userId: string,
    style: SummaryStyle,
    length: SummaryLength,
    summaryId: string,
    bookTitle?: string
  ): Promise<CreditTransaction | null> {
    const cost = getSummaryCreditCost(style, length)

    return this.deductCredits(
      userId,
      cost,
      'summary_generation',
      summaryId,
      'summary',
      `Summary generation: ${style} / ${length}`,
      {
        style,
        length,
        book_title: bookTitle,
      }
    )
  }

  /**
   * Deduct credits for chat message
   */
  async deductForChat(
    userId: string,
    bookId: string,
    chatSessionId?: string
  ): Promise<CreditTransaction | null> {
    const cost = getChatMessageCreditCost()

    return this.deductCredits(
      userId,
      cost,
      'chat_message',
      chatSessionId,
      'chat_session',
      'Chat message',
      {
        book_id: bookId,
      }
    )
  }

  /**
   * Get recent transactions for a user
   */
  async getRecentTransactions(
    userId: string,
    limit: number = 10
  ): Promise<CreditTransaction[]> {
    const { data, error } = await this.supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }

    return data as CreditTransaction[]
  }

  /**
   * Get or create a chat session for tracking chat usage
   */
  async getOrCreateChatSession(
    userId: string,
    bookId: string
  ): Promise<{ id: string; message_count: number; total_credits_spent: number } | null> {
    // Try to get existing session
    const { data: existing, error: fetchError } = await this.supabase
      .from('chat_sessions')
      .select('id, message_count, total_credits_spent')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single()

    if (existing) {
      return existing
    }

    // Create new session if doesn't exist
    if (fetchError?.code === 'PGRST116') { // No rows returned
      const { data: newSession, error: insertError } = await this.supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          book_id: bookId,
          message_count: 0,
          total_credits_spent: 0,
        })
        .select('id, message_count, total_credits_spent')
        .single()

      if (insertError) {
        console.error('Error creating chat session:', insertError)
        return null
      }

      return newSession
    }

    console.error('Error fetching chat session:', fetchError)
    return null
  }

  /**
   * Update chat session after message
   */
  async updateChatSession(
    sessionId: string,
    creditsSpent: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from('chat_sessions')
      .update({
        message_count: this.supabase.rpc('increment', { row_id: sessionId, field: 'message_count' }),
        total_credits_spent: this.supabase.rpc('increment_spent', { row_id: sessionId, amount: creditsSpent }),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (error) {
      // Use raw SQL update as fallback
      await this.supabase.rpc('update_chat_session_stats', {
        p_session_id: sessionId,
        p_credits_spent: creditsSpent,
      })
    }
  }

  /**
   * Get credit cost for an action from database
   * Falls back to constants if database lookup fails
   */
  async getCreditCost(
    actionType: 'summary' | 'chat_message',
    style?: SummaryStyle,
    length?: SummaryLength
  ): Promise<number> {
    // Try database lookup first
    let query = this.supabase
      .from('credit_costs')
      .select('cost')
      .eq('action_type', actionType)
      .eq('is_active', true)

    if (actionType === 'summary' && style && length) {
      query = query.eq('style', style).eq('length', length)
    } else if (actionType === 'chat_message') {
      query = query.is('style', null).is('length', null)
    }

    const { data, error } = await query.single()

    if (!error && data) {
      return data.cost
    }

    // Fallback to constants
    if (actionType === 'summary' && style && length) {
      return getSummaryCreditCost(style, length)
    }

    return getChatMessageCreditCost()
  }
}

/**
 * Create a credit service instance
 * Use this in API routes after creating the Supabase client
 */
export function createCreditService(supabase: SupabaseClient): CreditService {
  return new CreditService(supabase)
}
