"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Ticker() {
  const [trending, setTrending] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    // Fetch the top 10 highest-rated looks to populate the ticker
    const fetchTrending = async () => {
      const { data } = await supabase
        .from('looks')
        .select('elo_rating, actors(name)')
        .order('elo_rating', { ascending: false })
        .limit(10);
      
      if (data) setTrending(data);
    };

    fetchTrending();
  }, []);

  if (trending.length === 0) return null;

  return (
    <div className="w-full bg-black border-y border-gray-900 overflow-hidden py-3 absolute top-0 z-50">
      <div className="whitespace-nowrap flex animate-marquee">
        {/* We map twice to create an infinite loop effect */}
        {[...trending, ...trending].map((item, i) => (
          <div key={i} className="inline-flex items-center mx-8">
            <span className="text-white font-bold uppercase tracking-widest mr-2">{item.actors?.name || "Unknown"}</span>
            {/* Simulate a "Stock Up" green arrow */}
            <span className="text-green-500 font-black mr-2">▲</span>
            <span className="text-gray-400 font-mono">{Math.round(item.elo_rating)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
