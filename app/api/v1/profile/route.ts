import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UserProfile, DEFAULT_PREFERENCES } from '@/lib/types/preferences'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user profile with preferences
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // If profile doesn't exist, return default preferences
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          user_id: user.id,
          preferences: DEFAULT_PREFERENCES
        })
      }

      console.error('Error fetching profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
    const validLengths = ['1pg', '5pg', '15pg']
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
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      // If profile doesn't exist, create it
      if (updateError.code === 'PGRST116') {
        const { data: insertData, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
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
