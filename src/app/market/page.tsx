import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/server";
import { actorName, normalizeLook } from "@/lib/utils";

export default async function MarketPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("looks")
    .select("id, image_url, elo_rating, total_wins, total_battles, actors(name)")
    .order("elo_rating", { ascending: false })
    .limit(24);

  const looks = (data ?? []).map((row) => normalizeLook(row as Record<string, unknown>));

  return (
    <main className="relative min-h-screen overflow-hidden px-5 pb-20 text-white md:px-10">
      <div className="softbare-grid pointer-events-none absolute inset-0" />
      <SiteHeader active="market" />
      <section className="relative z-10 mx-auto max-w-6xl pt-10">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-neon">Live index</p>
        <h1 className="font-display mt-3 text-5xl font-black tracking-tight md:text-7xl">The market.</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-gray-400">
          Highest ELO looks on the floor right now. Volume is battles fought. Price is consensus.
        </p>

        <div className="mt-12 overflow-hidden rounded-[1.5rem] border border-white/10">
          <div className="grid grid-cols-[3rem_1fr_6rem_6rem_6rem] border-b border-white/10 bg-black/40 px-4 py-3 text-[10px] font-bold uppercase tracking-[.18em] text-gray-500">
            <span>#</span>
            <span>Look</span>
            <span className="text-right">ELO</span>
            <span className="text-right">Wins</span>
            <span className="text-right">Vol</span>
          </div>
          {looks.map((look, index) => (
            <div
              key={look.id}
              className="grid grid-cols-[3rem_1fr_6rem_6rem_6rem] items-center border-b border-white/5 px-4 py-3 last:border-0"
            >
              <span className="font-mono text-sm text-gray-500">{String(index + 1).padStart(2, "0")}</span>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-9 overflow-hidden rounded-md bg-surface">
                  <Image src={look.image_url} alt={actorName(look.actors)} fill className="object-cover" sizes="36px" />
                </div>
                <span className="font-display text-lg font-bold">{actorName(look.actors)}</span>
              </div>
              <span className="text-right font-mono text-neon">{Math.round(look.elo_rating)}</span>
              <span className="text-right font-mono text-sm text-gray-300">{look.total_wins ?? 0}</span>
              <span className="text-right font-mono text-sm text-gray-500">{look.total_battles ?? 0}</span>
            </div>
          ))}
          {looks.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-gray-500">No listings yet. Ingest looks to open the book.</p>
          )}
        </div>
      </section>
    </main>
  );
}
