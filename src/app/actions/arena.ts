'use server';

import { createClient } from '@/lib/supabase/server';
import { normalizeLook } from '@/lib/utils';
import type { Look, TrendingLook } from '@/lib/types';

const LOOK_SELECT =
  'id, image_url, actor_id, elo_rating, total_wins, total_battles, actors(name)';

export async function fetchMatchup(): Promise<Look[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_tension_contenders');

  if (!error && Array.isArray(data) && data.length >= 2) {
    return data.map((row) => normalizeLook(row as Record<string, unknown>));
  }

  const { data: pool, error: fallbackError } = await supabase
    .from('looks')
    .select(LOOK_SELECT)
    .limit(40);

  if (fallbackError) {
    throw new Error(`Failed to load contenders: ${fallbackError.message}`);
  }

  const looks = (pool ?? []).map((row) => normalizeLook(row as Record<string, unknown>));
  if (looks.length < 2) return [];

  const seed = looks[Math.floor(Math.random() * looks.length)];
  const partner = looks
    .filter((look) => look.id !== seed.id)
    .sort(
      (a, b) =>
        Math.abs(a.elo_rating - seed.elo_rating) - Math.abs(b.elo_rating - seed.elo_rating)
    )[0];

  return partner ? [seed, partner] : [];
}

export async function fetchTrending(): Promise<TrendingLook[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('looks')
    .select('elo_rating, actors(name)')
    .order('elo_rating', { ascending: false })
    .limit(12);

  return (data ?? []).map((row) => {
    const look = normalizeLook({ ...row, id: 'trending', image_url: '' });
    return { elo_rating: look.elo_rating, actors: look.actors };
  });
}

export async function submitVote(winnerId: string, loserId: string) {
  if (!winnerId || !loserId || winnerId === loserId) {
    throw new Error('Invalid matchup');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('AUTH_REQUIRED');
  }

  const { error } = await supabase.from('votes').insert([
    { user_id: user.id, winner_look_id: winnerId, loser_look_id: loserId },
  ]);

  if (error) {
    throw new Error(error.message || 'Vote failed');
  }

  const { data: winnerData } = await supabase
    .from('looks')
    .select('total_wins, total_battles')
    .eq('id', winnerId)
    .single();

  if (winnerData && winnerData.total_battles > 0) {
    return Math.round((winnerData.total_wins / winnerData.total_battles) * 100);
  }

  return 100;
}

export async function saveToVault(lookId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('AUTH_REQUIRED');

  const { error } = await supabase.from('vaults').insert([{ user_id: user.id, look_id: lookId }]);
  if (error) {
    if (error.message.includes('Vault limit reached') || error.code === 'P0001') {
      throw new Error('VAULT_FULL');
    }
    if (error.code === '23505') {
      throw new Error('ALREADY_SAVED');
    }
    throw new Error(error.message || 'Could not save to vault');
  }
}

export async function removeFromVault(lookId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('AUTH_REQUIRED');

  const { error } = await supabase
    .from('vaults')
    .delete()
    .eq('user_id', user.id)
    .eq('look_id', lookId);

  if (error) throw new Error(error.message || 'Could not remove look');
}
