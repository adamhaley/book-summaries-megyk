import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { createReferralService } from '@/lib/services/referrals'
import { REFERRAL_REWARDS, generateReferralLink } from '@/lib/types/referral'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Prevent self-invite
    if (email.toLowerCase() === user.email?.toLowerCase()) {
      return NextResponse.json({ error: "You can't invite yourself!" }, { status: 400 })
    }

    // Get user's referral code
    const referralService = createReferralService(supabase)
    const referralCode = await referralService.getReferralCode(user.id)

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 500 })
    }

    // Generate referral link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.megyk.com'
    const referralLink = generateReferralLink(referralCode.code, baseUrl)

    // Get inviter's name/email for personalization
    const inviterName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'A friend'

    // Send the invite email
    const resend = new Resend(process.env.RESEND_API_KEY)

    const friendName = name || 'there'
    const subject = `${inviterName} invited you to Megyk Books!`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${baseUrl}/logo.png" alt="Megyk Books" style="height: 60px; width: auto;" />
  </div>

  <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 20px;">Hey ${friendName}!</h1>

  <p style="font-size: 16px; margin-bottom: 20px;">
    <strong>${inviterName}</strong> thinks you'd love Megyk Books - AI-powered personalized book summaries that match your reading style.
  </p>

  <div style="background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
    <p style="font-size: 18px; font-weight: 600; color: #5b21b6; margin: 0 0 8px 0;">
      🎁 Sign up and get ${REFERRAL_REWARDS.referred_bonus.toLocaleString()} bonus credits!
    </p>
    <p style="font-size: 14px; color: #6b7280; margin: 0;">
      Plus ${inviterName} gets ${REFERRAL_REWARDS.referrer_bonus.toLocaleString()} credits too - everybody wins!
    </p>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${referralLink}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Join Megyk Books
    </a>
  </div>

  <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
    Or copy this link: <a href="${referralLink}" style="color: #2563eb;">${referralLink}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    Megyk Books - Personalized AI Book Summaries<br />
    <a href="${baseUrl}" style="color: #6b7280;">megyk.com</a>
  </p>
</body>
</html>
`

    const text = `
Hey ${friendName}!

${inviterName} thinks you'd love Megyk Books - AI-powered personalized book summaries that match your reading style.

Sign up and get ${REFERRAL_REWARDS.referred_bonus.toLocaleString()} bonus credits! Plus ${inviterName} gets ${REFERRAL_REWARDS.referrer_bonus.toLocaleString()} credits too.

Join here: ${referralLink}

- Megyk Books Team
`

    const { data, error } = await resend.emails.send({
      from: 'Megyk Books <noreply@megyk.com>',
      to: email,
      subject,
      html,
      text,
    })

    if (error) {
      console.error('Resend API error:', error)
      return NextResponse.json({ error: 'Failed to send invite email' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Invite sent to ${email}`,
      messageId: data?.id,
    })
  } catch (error) {
    console.error('Error sending invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
