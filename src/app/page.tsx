/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      <main className="flex h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-white relative">
        <div className="absolute top-6 right-6 flex gap-4 text-xs uppercase font-bold tracking-widest">
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
          <Link href="/vault/test" className="text-gray-400 hover:text-white transition-colors">Vault & Upload</Link>
          <Link href="/admin" className="text-neon hover:underline">Admin</Link>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.3em] text-neon">Softbare Arena</p>
        <h1 className="text-3xl font-black tracking-tight max-w-md">
          {loadError || "The Arena is waiting for content."}
        </h1>
        <p className="text-sm text-gray-400 max-w-sm">
          Upload looks in the Vault or use the Admin panel to seed the Arena with actors.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-2">
          <Link
            href="/vault/test"
            className="rounded-full bg-white px-6 py-3 font-bold text-black transition-transform hover:scale-105 uppercase tracking-widest text-xs shadow-glow"
          >
            Upload a Look
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-neon text-neon px-6 py-3 font-bold transition-all hover:bg-neon hover:text-black uppercase tracking-widest text-xs"
          >
            Open Admin Panel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex h-screen w-full items-center justify-center bg-background overflow-hidden">
      <Ticker />

      {/* Navigation Overlay */}
      <div className="absolute top-16 right-6 z-50 flex gap-4 text-xs uppercase font-bold tracking-widest bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-800">
        <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
        <Link href="/vault/test" className="text-gray-400 hover:text-white transition-colors">Vault & Upload</Link>
        <Link href="/admin" className="text-neon hover:underline">Admin</Link>
      </div>
      
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
