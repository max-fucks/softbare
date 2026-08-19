'use server'

import { supabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

// 1. Fetch the contenders
export async function fetchMatchup() {
  const { data, error } = await supabase.rpc('get_tension_contenders');
  if (!error && Array.isArray(data) && data.length >= 2) return data;

  // Keep the arena usable when the legacy RPC has a stale PostgreSQL return type.
  // This read-only fallback preserves the existing table shape and data.
  const { data: fallback, error: fallbackError } = await supabase
    .from('looks')
    .select('id, image_url, actor_id, actors(name)')
    .limit(2);

  if (fallbackError || !fallback || fallback.length < 2) {
    throw new Error(`Failed to load contenders: ${error?.message || fallbackError?.message || 'not enough looks'}`);
  }

  return fallback;
}

// 2. Submit the vote and calculate the Consensus Shock
export async function submitVote(winnerId: string, loserId: string) {
  const serverSupabase = await createClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  const userId = user?.id ?? 'anonymous_for_now';

  // Record the vote (this automatically triggers our ELO SQL function)
  const { error } = await serverSupabase
    .from('votes')
    .insert([{ user_id: userId, winner_look_id: winnerId, loser_look_id: loserId }]);

  if (error) throw new Error('Vote failed');

  // Calculate the Consensus: How many times has the winner actually won its battles?
  const { data: winnerData } = await serverSupabase
    .from('looks')
    .select('total_wins, total_battles')
    .eq('id', winnerId)
    .single();

  if (winnerData && winnerData.total_battles > 0) {
    // Return the percentage of people who also think this look is a winner
    const consensusPercentage = Math.round((winnerData.total_wins / winnerData.total_battles) * 100);
    return consensusPercentage;
  }
  
  return 100; // First vote ever scenario
}
