"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import SwipeCard from "@/components/SwipeCard";
import LookCard from "@/components/LookCard";
import Ticker from "@/components/Ticker";
import { fetchMatchup, saveToVault, submitVote } from "@/app/actions/arena";
import { haptic } from "@/lib/utils";
import type { Look, SessionUser, TrendingLook } from "@/lib/types";

export default function ArenaClient({
  initialMatchup,
  trending,
  user,
}: {
  initialMatchup: Look[];
  trending: TrendingLook[];
  user: SessionUser | null;
}) {
  const [contenders, setContenders] = useState<Look[]>(initialMatchup);
  const [consensus, setConsensus] = useState<number | null>(null);
  const [winner, setWinner] = useState<Look | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [vaultStatus, setVaultStatus] = useState<string | null>(null);
  const [authPrompt, setAuthPrompt] = useState(false);

  const loadNextMatch = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setVaultStatus(null);
    try {
      const data = await fetchMatchup();
      setContenders(data);
      setConsensus(null);
      setWinner(null);
    } catch {
      setLoadError("The market feed is offline. Check your Supabase keys and run the SQL migration.");
      setContenders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleVote = useCallback(
    async (direction: "left" | "right") => {
      if (contenders.length < 2 || isVoting || consensus !== null) return;
      const left = contenders[0];
      const right = contenders[1];
      const chosen = direction === "left" ? left : right;
      const other = direction === "left" ? right : left;

      if (!user) {
        setAuthPrompt(true);
        haptic(80);
        return;
      }

      setIsVoting(true);
      haptic([18, 40, 55]);
      try {
        const shockPercentage = await submitVote(chosen.id, other.id);
        setWinner(chosen);
        setConsensus(shockPercentage);
        window.setTimeout(() => {
          void loadNextMatch();
          setIsVoting(false);
        }, 1500);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message === "AUTH_REQUIRED") setAuthPrompt(true);
        else setLoadError("Vote did not land. Try again.");
        setIsVoting(false);
      }
    },
    [consensus, contenders, isVoting, loadNextMatch, user]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") void handleVote("left");
      if (event.key === "ArrowRight") void handleVote("right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleVote]);

  const handleSave = async () => {
    if (!winner) return;
    try {
      await saveToVault(winner.id);
      setVaultStatus("Locked into your S-Tier vault.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "VAULT_FULL") setVaultStatus("Vault is full. Unlock Black Card to expand.");
      else if (message === "ALREADY_SAVED") setVaultStatus("Already in your vault.");
      else if (message === "AUTH_REQUIRED") setAuthPrompt(true);
      else setVaultStatus("Could not save that look.");
    }
  };

  if (contenders.length < 2) {
    return (
      <main className="relative min-h-screen overflow-hidden text-white">
        <div className="softbare-grid pointer-events-none absolute inset-0" />
        <section className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-14 px-5 py-12 lg:grid-cols-[1fr_470px] lg:gap-24 md:px-8">
          <div>
            <p className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.32em] text-neon">
              <span className="h-2 w-2 rounded-full bg-neon shadow-[0_0_18px_#b38cff]" />
              The aesthetic index · 2026
            </p>
            <h1 className="font-display max-w-3xl text-6xl font-black leading-[.86] tracking-[-.08em] sm:text-8xl">
              Taste is a
              <br />
              <span className="bg-clip-text text-transparent [background:linear-gradient(110deg,#fff_15%,#b38cff_55%,#ff4d6d)]">
                moving market.
              </span>
            </h1>
            <p className="mt-8 max-w-lg text-[15px] leading-7 text-gray-400">
              Softbare turns visual culture into a living index. The first collection is being curated now — then every
              vote will move the floor.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/vault"
                className="rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-[.18em] text-black transition hover:scale-105"
              >
                Explore the vault
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/20 px-6 py-3 text-xs font-black uppercase tracking-[.18em] text-white transition hover:border-neon hover:text-neon"
              >
                Get early access
              </Link>
            </div>
            <div className="mt-16 grid max-w-lg grid-cols-3 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[.16em] text-gray-500">
              <div>
                <strong className="mb-1 block font-display text-2xl text-white">LIVE</strong>Community ranked
              </div>
              <div>
                <strong className="mb-1 block font-display text-2xl text-white">24/7</strong>Live ELO
              </div>
              <div>
                <strong className="mb-1 block font-display text-2xl text-white">S/5</strong>Vault your five
              </div>
            </div>
          </div>
          <div className="relative mx-auto h-[520px] w-full max-w-[410px]">
            <div className="absolute -right-4 top-9 h-[88%] w-[88%] rotate-[9deg] rounded-[2.4rem] border border-accent/20 bg-accent/10" />
            <div className="absolute -left-4 top-1 h-[92%] w-[92%] rotate-[-7deg] rounded-[2.4rem] border border-neon/20 bg-neon/10" />
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2.4rem] border border-white/15 bg-[#111116] p-7 shadow-2xl shadow-black/40">
              <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-neon/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
              <div className="relative flex items-center justify-between text-[10px] font-bold uppercase tracking-[.22em] text-gray-400">
                <span>Softbare / 001</span>
                <span className="flex items-center gap-2 text-neon"><i className="h-1.5 w-1.5 rounded-full bg-neon" />curating</span>
              </div>
              <div className="relative">
                <div className="relative mx-auto mb-8 h-56 w-56 overflow-hidden rounded-full border border-white/15 bg-[#1b1b25] shadow-[0_0_90px_rgba(179,140,255,.2)]">
                  <div className="absolute inset-7 rounded-full border border-white/10" />
                  <div className="absolute left-1/2 top-1/2 h-40 w-24 -translate-x-1/2 -translate-y-1/2 rotate-[28deg] rounded-[50%] bg-gradient-to-b from-white/80 via-neon/80 to-accent/70 blur-[1px]" />
                  <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 blur-2xl" />
                </div>
                <p className="font-display text-3xl font-black tracking-[-.04em]">The floor is forming.</p>
                <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-gray-400">
                  {isLoading ? "Opening the index…" : loadError || "The first looks are being selected for the public arena."}
                </p>
                {!isLoading && (
                  <button
                    type="button"
                    onClick={() => void loadNextMatch()}
                    className="mt-6 rounded-full border border-white/20 bg-white/[.04] px-5 py-2.5 text-[10px] font-black uppercase tracking-[.2em] text-gray-300 transition hover:border-neon hover:bg-neon/10 hover:text-neon"
                  >
                    Refresh index
                  </button>
                )}
              </div>
              <div className="relative grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-[.16em] text-gray-500">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><span className="block">Looks live</span><strong className="mt-1 block font-mono text-lg text-white">0 / 100</strong></div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><span className="block">Market state</span><strong className="mt-1 block font-mono text-lg text-neon">OPENING</strong></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const [left, right] = contenders;

  return (
    <main className="relative flex min-h-[calc(100vh-5.5rem)] w-full flex-col items-center overflow-hidden bg-background">
      <Ticker trending={trending} />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 md:px-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="hidden lg:block">
          <LookCard look={left} side="left" onPick={() => handleVote("left")} disabled={isVoting} />
        </div>

        <div className="flex flex-col items-center">
          <p className="mb-5 text-center text-[10px] font-bold uppercase tracking-[.32em] text-gray-500">
            Swipe toward the superior look · ← →
          </p>
          <div className="relative h-[70vh] w-full max-w-sm">
            <div className="pointer-events-none absolute inset-0 z-0 scale-95 opacity-70">
              <SwipeCard look={left} onVote={() => {}} disabled />
            </div>
            <div className="absolute inset-0 z-10">
              <SwipeCard look={right} onVote={handleVote} disabled={isVoting} />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => handleVote("left")}
              disabled={isVoting}
              className="rounded-full border border-accent/40 px-5 py-2 text-[10px] font-black uppercase tracking-[.2em] text-accent disabled:opacity-40"
            >
              Pick A
            </button>
            <button
              type="button"
              onClick={() => handleVote("right")}
              disabled={isVoting}
              className="rounded-full border border-neon/40 px-5 py-2 text-[10px] font-black uppercase tracking-[.2em] text-neon disabled:opacity-40"
            >
              Pick B
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <LookCard look={right} side="right" onPick={() => handleVote("right")} disabled={isVoting} />
        </div>
      </div>

      <AnimatePresence>
        {consensus !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.86, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[.4em] text-neon">Consensus shock</p>
              <h2 className="font-display text-7xl font-black text-white sm:text-8xl">{consensus}%</h2>
              <p className="mt-3 text-sm uppercase tracking-[.28em] text-gray-300">of the floor agrees with you</p>
              {winner && user && (
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  className="mt-8 rounded-full bg-white px-6 py-3 text-[10px] font-black uppercase tracking-[.2em] text-black"
                >
                  Save winner to vault
                </button>
              )}
              {vaultStatus && <p className="mt-3 text-xs text-neon">{vaultStatus}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {authPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-6 backdrop-blur-md"
          >
            <div className="softbare-glass max-w-md rounded-[2rem] p-8 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[.3em] text-neon">Identity required</p>
              <h3 className="mt-4 font-display text-4xl font-black">Sign in to move the market.</h3>
              <p className="mt-3 text-sm text-gray-400">Votes write to the live ELO ledger. Anonymous ticks are not allowed.</p>
              <Link
                href="/login"
                className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-[.18em] text-black"
              >
                Enter with Google
              </Link>
              <button
                type="button"
                onClick={() => setAuthPrompt(false)}
                className="mt-4 block w-full text-[10px] uppercase tracking-[.2em] text-gray-500"
              >
                Keep browsing
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
