/**
 * Credit system types and constants for the Megyk Credits (MC) token economy
 */

import { SummaryStyle, SummaryLength } from './preferences'

// =============================================
// Credit Cost Constants
// =============================================

export const CREDIT_COSTS = {
  summary: {
    narrative: { short: 200, medium: 300, long: 500 },
    bullet_points: { short: 200, medium: 400, long: 600 },
    workbook: { short: 300, medium: 500, long: 800 },
  },
  chat_message: 10,
} as const

// =============================================
// Subscription Tiers (for future use)
// =============================================

export const SUBSCRIPTION_TIERS = {
  executive: {
    name: 'Executive',
    price: 3900, // in cents ($39.00)
    credits: 1500,
    rollover_max: 1000,
    billing_months: 1,
  },
  strategic: {
    name: 'Strategic',
    price: 7900, // in cents ($79.00)
    credits: 4000,
    rollover_max: 2500,
    billing_months: 3,
  },
  chairman: {
    name: 'Chairman',
    price: 14900, // in cents ($149.00)
    credits: 10000,
    rollover_max: 7500,
    billing_months: 3,
  },
} as const

export type SubscriptionTierKey = keyof typeof SUBSCRIPTION_TIERS

// =============================================
// Top-up Packages (for future use)
// =============================================

export const TOP_UP_PACKAGES = {
  small: { credits: 2500, price: 2900 }, // $29.00
  medium: { credits: 5000, price: 4900 }, // $49.00
  large: { credits: 10000, price: 7900 }, // $79.00
} as const

export type TopUpPackageKey = keyof typeof TOP_UP_PACKAGES

// =============================================
// Referral Rewards (for future use)
// =============================================

export const REFERRAL_REWARDS = {
  referrer_bonus: 1500,
  referred_bonus: 1000,
  milestones: {
    3: { type: 'credits', amount: 2500 },
    10: { type: 'subscription', tier: 'strategic', months: 1 },
    25: { type: 'subscription', tier: 'chairman', months: 3 },
  },
} as const

// =============================================
// Database Types
// =============================================

export type CreditTransactionType =
  | 'signup_bonus'
  | 'summary_generation'
  | 'chat_message'
  | 'subscription_credit'
  | 'subscription_rollover'
  | 'top_up_purchase'
  | 'referral_bonus'
  | 'referral_milestone'
  | 'admin_adjustment'
  | 'refund'

export interface CreditBalance {
  id: string
  user_id: string
  current_balance: number
  lifetime_earned: number
  lifetime_spent: number
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  transaction_type: CreditTransactionType
  reference_id: string | null
  reference_type: string | null
  description: string | null
  balance_before: number
  balance_after: number
  metadata: Record<string, unknown>
  created_at: string
}

export interface CreditCost {
  id: string
  action_type: 'summary' | 'chat_message'
  style: SummaryStyle | null
  length: SummaryLength | null
  cost: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  book_id: string
  message_count: number
  total_credits_spent: number
  last_message_at: string | null
  created_at: string
  updated_at: string
}

// =============================================
// API Types
// =============================================

export interface CreditCheckResult {
  has_sufficient_credits: boolean
  current_balance: number
  required_credits: number
  remaining_after: number
}

export interface CreditBalanceResponse {
  balance: CreditBalance
  recent_transactions: CreditTransaction[]
}

export interface CreditCheckRequest {
  action_type: 'summary' | 'chat_message'
  style?: SummaryStyle
  length?: SummaryLength
}

// =============================================
// Helper Functions
// =============================================

/**
 * Get the credit cost for a summary based on style and length
 */
export function getSummaryCreditCost(style: SummaryStyle, length: SummaryLength): number {
  return CREDIT_COSTS.summary[style][length]
}

/**
 * Get the credit cost for a chat message
 */
export function getChatMessageCreditCost(): number {
  return CREDIT_COSTS.chat_message
}

/**
 * Format credit amount for display (e.g., "300 MC")
 */
export function formatCredits(amount: number): string {
  return `${amount.toLocaleString()} MC`
}

/**
 * Calculate how many chat messages a user can send with their balance
 */
export function calculateRemainingChatMessages(balance: number): number {
  return Math.floor(balance / CREDIT_COSTS.chat_message)
}

/**
 * Check if user can afford an action
 */
export function canAfford(balance: number, cost: number): boolean {
  return balance >= cost
}
