import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // TODO: Fetch user profile with preferences
    // const { data: profile, error } = await supabase
    //   .from('user_profiles')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .single()

    return NextResponse.json({
      message: 'Profile API endpoint - to be implemented',
      userId: user.id
    })
  } catch (error) {
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

    // TODO: Update user profile
    // const { data, error } = await supabase
    //   .from('user_profiles')
    //   .update(body)
    //   .eq('user_id', user.id)

    return NextResponse.json({
      message: 'Profile update - to be implemented'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
