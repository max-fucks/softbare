"use client";

import Image from "next/image";
import { actorName } from "@/lib/utils";
import type { Look } from "@/lib/types";

export default function LookCard({
  look,
  side,
  onPick,
  disabled,
}: {
  look: Look;
  side: "left" | "right";
  onPick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface text-left shadow-glow transition hover:border-white/30 disabled:opacity-60"
    >
      <Image
        src={look.image_url}
        alt={actorName(look.actors)}
        fill
        sizes="(max-width: 768px) 50vw, 420px"
        className="object-cover transition duration-500 group-hover:scale-[1.03]"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
      <span
        className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[.2em] ${
          side === "left" ? "bg-accent text-black" : "bg-neon text-black"
        }`}
      >
        {side === "left" ? "A" : "B"}
      </span>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="font-display text-2xl font-black leading-none">{actorName(look.actors)}</p>
        <p className="mt-2 font-mono text-xs text-gray-300">ELO {Math.round(look.elo_rating)}</p>
      </div>
    </button>
  );
}
