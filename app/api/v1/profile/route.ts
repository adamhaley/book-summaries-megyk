import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId } from '@/lib/auth'
import { UserProfile, DEFAULT_PREFERENCES } from '@/lib/types/preferences'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const authStart = Date.now()
    const userId = await getAuthUserId()
    console.log(`[Profile API] Auth check completed in ${Date.now() - authStart}ms`)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()
    console.log(`[Profile API] Supabase client created in ${Date.now() - startTime}ms`)

    // Fetch user profile with preferences (only select what we need)
    const queryStart = Date.now()
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('user_id, preferences')
      .eq('user_id', userId)
      .single()
    console.log(`[Profile API] Database query completed in ${Date.now() - queryStart}ms`)

    if (error) {
      // If profile doesn't exist, return default preferences
      if (error.code === 'PGRST116') {
        console.log(`[Profile API] No profile found, returning defaults. Total time: ${Date.now() - startTime}ms`)
        return NextResponse.json({
          user_id: userId,
          preferences: DEFAULT_PREFERENCES
        })
      }

      console.error('Error fetching profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    console.log(`[Profile API] Success. Total time: ${Date.now() - startTime}ms`)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Unexpected error:', error)
    console.log(`[Profile API] Error occurred. Total time: ${Date.now() - startTime}ms`)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()
    const body = await request.json()

    // Validate preferences structure
    if (!body.preferences || typeof body.preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      )
    }

    const { style, length } = body.preferences

    // Validate style
    const validStyles = ['narrative', 'bullet_points', 'workbook']
    if (style && !validStyles.includes(style)) {
      return NextResponse.json(
        { error: `Invalid style. Must be one of: ${validStyles.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate length
    const validLengths = ['short', 'medium', 'long']
    if (length && !validLengths.includes(length)) {
      return NextResponse.json(
        { error: `Invalid length. Must be one of: ${validLengths.join(', ')}` },
        { status: 400 }
      )
    }

    // Try to update existing profile
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ preferences: body.preferences })
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      // If profile doesn't exist, create it
      if (updateError.code === 'PGRST116') {
        const { data: insertData, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            preferences: body.preferences
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating profile:', insertError)
          return NextResponse.json(
            { error: 'Failed to create profile' },
            { status: 500 }
          )
        }

        return NextResponse.json(insertData)
      }

      console.error('Error updating profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(updateData)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
