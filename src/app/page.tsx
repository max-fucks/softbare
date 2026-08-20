import ArenaClient from "@/components/ArenaClient";
import SiteHeader from "@/components/SiteHeader";
import { fetchMatchup, fetchTrending } from "@/app/actions/arena";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [matchup, trending] = await Promise.all([
    fetchMatchup().catch(() => []),
    fetchTrending().catch(() => []),
  ]);

  return (
    <div className="relative min-h-screen">
      <SiteHeader active="arena" />
      <ArenaClient
        initialMatchup={matchup}
        trending={trending}
        user={user ? { id: user.id, email: user.email ?? null } : null}
      />
    </div>
  );
}
