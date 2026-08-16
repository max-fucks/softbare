'use server'

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getDashboardStats() {
  const supabase = await createClient();

  // 1. SECURITY: Check if you are the admin
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== 'amster842@gmail.com') { // Admin email configured
    redirect('/'); // Kick out regular users
  }

  // 2. Fetch the absolute highest-rated looks
  const { data: topLooks } = await supabase
    .from('looks')
    .select('*, actors(name)')
    .order('elo_rating', { ascending: false })
    .limit(10);

  // 3. Fetch total votes cast (Engagement)
  const { count: totalVotes } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true });

  return { topLooks, totalVotes };
}
