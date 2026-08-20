import { actorName } from "@/lib/utils";
import type { TrendingLook } from "@/lib/types";

export default function Ticker({ trending }: { trending: TrendingLook[] }) {
  if (trending.length === 0) return null;

  const items = [...trending, ...trending];

  return (
    <div className="w-full overflow-hidden border-y border-white/10 bg-black/80 py-3 backdrop-blur-md">
      <div className="flex w-max whitespace-nowrap animate-marquee">
        {items.map((item, i) => (
          <div key={`${item.actors?.name ?? "look"}-${i}`} className="mx-8 inline-flex items-center">
            <span className="mr-2 font-display text-xs font-bold uppercase tracking-[.2em] text-white">
              {actorName(item.actors)}
            </span>
            <span className="mr-2 text-xs font-black text-emerald-400">▲</span>
            <span className="font-mono text-xs text-gray-400">{Math.round(item.elo_rating)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
