import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Get total books count
    const { count: totalBooks, error: booksError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('live', true)

    if (booksError) {
      console.error('Error fetching books count:', booksError)
    }

    // Get books added in the last 30 days
    const thirtyDaysAgoForBooks = new Date()
    thirtyDaysAgoForBooks.setDate(thirtyDaysAgoForBooks.getDate() - 30)

    const { count: monthBooksCount, error: monthBooksError } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('live', true)
      .gte('created_at', thirtyDaysAgoForBooks.toISOString())

    if (monthBooksError) {
      console.error('Error fetching month books count:', monthBooksError)
    }

    // Get summaries count for this user
    const { count: summariesCount, error: summariesError } = await supabase
      .from('summaries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (summariesError) {
      console.error('Error fetching summaries count:', summariesError)
    }

    // Get summaries from the last 7 days for streak calculation
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { count: weekSummariesCount, error: weekError } = await supabase
      .from('summaries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())

    if (weekError) {
      console.error('Error fetching week summaries:', weekError)
    }

    // Get summaries from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: monthSummariesCount, error: monthError } = await supabase
      .from('summaries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (monthError) {
      console.error('Error fetching month summaries:', monthError)
    }

    // Get all summaries to calculate reading time estimate
    const { data: allSummaries, error: allSummariesError } = await supabase
      .from('summaries')
      .select('length, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (allSummariesError) {
      console.error('Error fetching all summaries:', allSummariesError)
    }

    // Calculate estimated reading time based on summary length
    const readingTimeMinutes = (allSummaries || []).reduce((total, summary) => {
      // Rough estimates: 1pg = 3 min, 5pg = 15 min, 15pg = 45 min
      const timeMap: Record<string, number> = {
        '1pg': 3,
        '5pg': 15,
        '15pg': 45
      }
      return total + (timeMap[summary.length] || 15)
    }, 0)

    // Format reading time
    let readingTime = '0m'
    if (readingTimeMinutes >= 60) {
      readingTime = `${Math.floor(readingTimeMinutes / 60)}h`
      if (readingTimeMinutes % 60 > 0) {
        readingTime += ` ${readingTimeMinutes % 60}m`
      }
    } else if (readingTimeMinutes > 0) {
      readingTime = `${readingTimeMinutes}m`
    }

    // Calculate streak (consecutive days with summaries)
    // For now, we'll use a simple calculation: days with summaries in last 7 days
    const { data: recentSummaries, error: recentError } = await supabase
      .from('summaries')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    let streak = 0
    if (!recentError && recentSummaries && recentSummaries.length > 0) {
      // Calculate consecutive days
      const summaryDates = recentSummaries.map(s => 
        new Date(s.created_at).toDateString()
      )
      const uniqueDates = [...new Set(summaryDates)]
      
      // Check from today backwards
      const today = new Date()
      let currentDate = new Date(today)
      
      for (let i = 0; i < 30; i++) { // Check up to 30 days
        const dateStr = currentDate.toDateString()
        if (uniqueDates.includes(dateStr)) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }
    }

    return NextResponse.json({
      stats: {
        totalBooks: totalBooks || 0,
        monthBooks: monthBooksCount || 0,
        summariesRead: summariesCount || 0,
        readingTime,
        readingTimeMinutes,
        streak,
        weekSummaries: weekSummariesCount || 0,
        monthSummaries: monthSummariesCount || 0
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

