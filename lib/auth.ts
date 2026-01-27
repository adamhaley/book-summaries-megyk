import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export async function getAuthUserId(): Promise<string | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const supabase = createClient();
  const { data } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('clerk_id', clerkId)
    .single();

  return data?.user_id || null;
}
