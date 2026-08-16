'use server'

import { supabase } from '@/lib/supabase';

// 1. Fetch the contenders
export async function fetchMatchup() {
  const { data, error } = await supabase.rpc('get_tension_contenders');
  if (error) throw new Error('Failed to load contenders');
  return data;
}

// 2. Submit the vote and calculate the Consensus Shock
export async function submitVote(winnerId: string, loserId: string, userId: string = 'anonymous_for_now') {
  // Record the vote (this automatically triggers our ELO SQL function)
  const { error } = await supabase
    .from('votes')
    .insert([{ user_id: userId, winner_look_id: winnerId, loser_look_id: loserId }]);

  if (error) throw new Error('Vote failed');

  // Calculate the Consensus: How many times has the winner actually won its battles?
  const { data: winnerData } = await supabase
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
