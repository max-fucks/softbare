export type ActorRef = {
  name: string | null;
};

export type Look = {
  id: string;
  image_url: string;
  actor_id?: string;
  elo_rating: number;
  total_wins?: number;
  total_battles?: number;
  actors: ActorRef | null;
};

export type TrendingLook = {
  elo_rating: number;
  actors: ActorRef | null;
};

export type VaultItem = {
  look_id: string;
  looks: Look | null;
};

export type Profile = {
  id: string;
  username: string;
  total_votes: number;
  vault_limit: number;
  is_black_card: boolean;
};

export type SessionUser = {
  id: string;
  email: string | null;
};
