/**
 * Referral service layer for managing referral codes and rewards
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  ReferralCode,
  Referral,
  ReferralStats,
  ReferralCodeValidation,
  ActivationType,
  REFERRAL_REWARDS,
  generateReferralLink,
} from '@/lib/types/referral'

export class ReferralService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Get user's referral code
   */
  async getReferralCode(userId: string): Promise<ReferralCode | null> {
    const { data, error } = await this.supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching referral code:', error)
      return null
    }

    return data as ReferralCode
  }

  /**
   * Validate a referral code and get its owner
   */
  async getCodeByValue(code: string): Promise<ReferralCodeValidation> {
    const normalizedCode = code.toUpperCase().trim()

    const { data, error } = await this.supabase
      .from('referral_codes')
      .select('id, user_id, code')
      .eq('code', normalizedCode)
      .single()

    if (error || !data) {
      return {
        valid: false,
        code: normalizedCode,
        error: 'Invalid referral code',
      }
    }

    return {
      valid: true,
      code: data.code,
      owner_id: data.user_id,
    }
  }

  /**
   * Get referral stats for a user (for profile display)
   */
  async getReferralStats(userId: string, baseUrl?: string): Promise<ReferralStats | null> {
    // Get user's referral code
    const referralCode = await this.getReferralCode(userId)
    if (!referralCode) {
      return null
    }

    // Get pending referrals count
    const { count: pendingCount } = await this.supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .eq('status', 'pending')

    // Get successful referrals count
    const { count: successfulCount } = await this.supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .eq('status', 'completed')

    const successful = successfulCount || 0
    const totalEarned = successful * REFERRAL_REWARDS.referrer_bonus

    return {
      referral_code: referralCode.code,
      referral_link: generateReferralLink(referralCode.code, baseUrl),
      pending: pendingCount || 0,
      successful,
      total_earned: totalEarned,
    }
  }

  /**
   * Create a pending referral when a new user signs up with a referral code
   */
  async createPendingReferral(
    referredUserId: string,
    referralCode: string
  ): Promise<{ success: boolean; error?: string }> {
    // Validate the referral code
    const codeValidation = await this.getCodeByValue(referralCode)
    if (!codeValidation.valid || !codeValidation.owner_id) {
      return { success: false, error: 'Invalid referral code' }
    }

    // Check if user is trying to refer themselves
    if (codeValidation.owner_id === referredUserId) {
      return { success: false, error: 'Cannot use your own referral code' }
    }

    // Check if user has already been referred
    const { data: existingReferral } = await this.supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', referredUserId)
      .single()

    if (existingReferral) {
      return { success: false, error: 'User has already been referred' }
    }

    // Get the referral code record
    const { data: codeRecord } = await this.supabase
      .from('referral_codes')
      .select('id')
      .eq('code', codeValidation.code)
      .single()

    if (!codeRecord) {
      return { success: false, error: 'Referral code not found' }
    }

    // Create the pending referral
    const { error } = await this.supabase.from('referrals').insert({
      referrer_id: codeValidation.owner_id,
      referred_id: referredUserId,
      referral_code_id: codeRecord.id,
      status: 'pending',
    })

    if (error) {
      console.error('Error creating pending referral:', error)
      return { success: false, error: 'Failed to create referral record' }
    }

    // Increment total_referrals count using raw SQL update
    try {
      const { data: currentCode } = await this.supabase
        .from('referral_codes')
        .select('total_referrals')
        .eq('id', codeRecord.id)
        .single()

      if (currentCode) {
        await this.supabase
          .from('referral_codes')
          .update({
            total_referrals: (currentCode.total_referrals || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', codeRecord.id)
      }
    } catch (updateError) {
      console.error('Failed to increment total_referrals:', updateError)
      // Non-critical - the referral is still created
    }

    return { success: true }
  }

  /**
   * Check if a user has a pending referral
   */
  async getPendingReferral(userId: string): Promise<Referral | null> {
    const { data, error } = await this.supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', userId)
      .eq('status', 'pending')
      .single()

    if (error || !data) {
      return null
    }

    return data as Referral
  }

  /**
   * Activate a referral and award credits to both parties
   * This is called after the referred user's first chat or summary
   */
  async activateReferral(
    userId: string,
    activationType: ActivationType
  ): Promise<{ success: boolean; credited?: boolean }> {
    // Check if user has a pending referral
    const pendingReferral = await this.getPendingReferral(userId)
    if (!pendingReferral) {
      // No pending referral - this is normal for users who didn't use a referral code
      return { success: true, credited: false }
    }

    // Use the database function to atomically activate and award credits
    const { data, error } = await this.supabase.rpc('activate_referral', {
      p_referred_user_id: userId,
      p_activation_type: activationType,
    })

    if (error) {
      console.error('Error activating referral:', error)
      return { success: false }
    }

    return { success: true, credited: data === true }
  }
}

/**
 * Create a referral service instance
 */
export function createReferralService(supabase: SupabaseClient): ReferralService {
  return new ReferralService(supabase)
}
