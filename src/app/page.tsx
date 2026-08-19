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
  const [isLoading, setIsLoading] = useState(true);

  // Load the first matchup
  const loadNextMatch = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchMatchup();
      if (!Array.isArray(data) || data.length < 2) {
        setContenders([]);
        setLoadError("The Arena is ready for its first looks.");
        return;
      }
      setContenders(data || []);
      setConsensus(null); // Reset the consensus overlay
    } catch (e) {
      console.error(e);
      setContenders([]);
      setLoadError("The Arena is temporarily unavailable. Try again in a moment.");
    } finally {
      setIsLoading(false);
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
      <main className="relative min-h-screen overflow-hidden px-5 py-6 text-white md:px-10 md:py-8">
        <div className="softbare-grid pointer-events-none absolute inset-0" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-lg font-black text-black">S</span><span className="text-lg font-black tracking-[.22em]">SOFTBARE</span></Link>
          <nav className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.18em] text-gray-400 md:gap-7"><Link href="/" className="text-white">Arena</Link><Link href="/vault" className="hover:text-white">Vault</Link><Link href="/login" className="rounded-full border border-white/15 px-4 py-2 hover:border-white/40 hover:text-white">Sign in</Link></nav>
        </header>

        <section className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl items-center gap-14 py-14 lg:grid-cols-[1fr_440px] lg:gap-24">
          <div>
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[.3em] text-neon"><span className="h-2 w-2 animate-pulse rounded-full bg-accent" />Live aesthetic market</p>
            <h1 className="max-w-3xl text-6xl font-black leading-[.92] tracking-[-.07em] sm:text-8xl">Vote for the<br /><span className="text-transparent [background:linear-gradient(110deg,#fff,#b38cff_45%,#ff4d6d)] bg-clip-text">best look.</span></h1>
            <p className="mt-8 max-w-lg text-base leading-7 text-gray-400">A visual arena where style gets ranked in real time. Swipe between two looks, cast your vote, and watch the aesthetic index move.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link href="/vault" className="rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-[.18em] text-black transition hover:scale-105">Enter the vault</Link><Link href="/login" className="rounded-full border border-white/20 px-6 py-3 text-xs font-black uppercase tracking-[.18em] text-white transition hover:border-neon hover:text-neon">Join the market</Link></div>
            <div className="mt-16 flex gap-10 border-t border-white/10 pt-6 text-xs uppercase tracking-[.18em] text-gray-500"><div><strong className="block text-2xl text-white">01</strong>Community ranked</div><div><strong className="block text-2xl text-white">24/7</strong>Live movement</div><div><strong className="block text-2xl text-white">∞</strong>Possibilities</div></div>
          </div>

          <div className="relative mx-auto h-[500px] w-full max-w-[390px]">
            <div className="absolute -right-3 top-5 h-full w-full rotate-[8deg] rounded-[2rem] border border-accent/20 bg-accent/10" />
            <div className="absolute -left-3 top-2 h-full w-full rotate-[-7deg] rounded-[2rem] border border-neon/20 bg-neon/10" />
            <div className="softbare-glass relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] p-7">
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-neon/20 blur-3xl" /><div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative flex items-center justify-between text-[10px] font-bold uppercase tracking-[.22em] text-gray-400"><span>Market preview</span><span className="text-accent">● offline seed</span></div>
              <div className="relative text-center"><div className="mx-auto mb-7 grid h-44 w-44 place-items-center rounded-full border border-white/10 bg-black/30 shadow-[0_0_80px_rgba(179,140,255,.15)]"><span className="text-8xl font-black tracking-[-.1em] text-white/90">S</span></div><p className="text-2xl font-black tracking-tight">The floor is yours.</p><p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-gray-400">{isLoading ? "Opening the arena…" : loadError || "Add the first looks to start the live competition."}</p></div>
              <div className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 text-[10px] font-bold uppercase tracking-[.16em] text-gray-500"><span>Current index</span><span className="text-lg text-white">— — —</span></div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative flex h-screen w-full items-center justify-center bg-background overflow-hidden">
      <Ticker />

      {/* Navigation Overlay */}
      <div className="absolute top-16 right-6 z-50 flex gap-4 text-xs uppercase font-bold tracking-widest bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-800">
        <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
        <Link href="/vault" className="text-gray-400 hover:text-white transition-colors">Vault & Upload</Link>
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
