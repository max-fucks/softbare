/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import SwipeCard from "@/components/SwipeCard";
import Ticker from "@/components/Ticker";
import { fetchMatchup, submitVote } from "@/app/actions/arena";

export default function Arena() {
  const [contenders, setContenders] = useState<any[]>([]);
  const [consensus, setConsensus] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load the first matchup
  const loadNextMatch = async () => {
    try {
      const data = await fetchMatchup();
      if (!Array.isArray(data) || data.length < 2) {
        setContenders([]);
        setLoadError("The Arena is waiting for its first looks. An admin can ingest content to begin.");
        return;
      }
      setContenders(data || []);
      setConsensus(null); // Reset the consensus overlay
    } catch (e) {
      console.error(e);
      setContenders([]);
      setLoadError("The Arena is temporarily unavailable. Try again in a moment.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNextMatch();
  }, []);

  const handleVote = async (direction: "left" | "right") => {
    if (contenders.length < 2) return;

    // In a swipe right, the top card (index 1) wins. In a swipe left, the bottom card (index 0) wins.
    const winner = direction === "right" ? contenders[1] : contenders[0];
    const loser = direction === "right" ? contenders[0] : contenders[1];

    try {
      // Submit vote and get the psychological shock percentage
      const shockPercentage = await submitVote(winner.id, loser.id);
      setConsensus(shockPercentage);

      // Pause for 1.5 seconds so the user absorbs the dopamine hit, then load next
      setTimeout(() => {
        loadNextMatch();
      }, 1500);
    } catch (e) {
      console.error(e);
      // Even if vote fails, keep the flow going
      loadNextMatch();
    }
  };

  if (contenders.length === 0) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-neon">Softbare Arena</p>
        <h1 className="text-3xl font-black tracking-tight">{loadError || "Loading Arena..."}</h1>
        {loadError && (
          <button
            type="button"
            onClick={loadNextMatch}
            className="rounded-full bg-white px-6 py-3 font-bold text-black transition-transform hover:scale-105"
          >
            Try again
          </button>
        )}
      </main>
    );
  }

  return (
    <main className="relative flex h-screen w-full items-center justify-center bg-background overflow-hidden">
      <Ticker />
      
      {/* The Aesthetic Cards */}
      <div className="relative w-full max-w-sm h-[70vh]">
        {/* Render the bottom card (Loser if swiped right) */}
        <div className="absolute inset-0 pointer-events-none scale-95 opacity-80 z-0">
           <SwipeCard look={contenders[0]} onVote={() => {}} />
        </div>
        
        {/* Render the top interactive card */}
        <div className="absolute inset-0 z-10">
           <SwipeCard look={contenders[1]} onVote={handleVote} />
        </div>
      </div>

      {/* The Consensus Shock Overlay */}
      {consensus !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="text-center">
            <h2 className="text-6xl font-black text-white mb-2 animate-pulse">{consensus}%</h2>
            <p className="text-xl text-neon tracking-widest uppercase">of people agree with you</p>
          </div>
        </div>
      )}
      
    </main>
  );
}
