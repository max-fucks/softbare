import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ActorRef, Look } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function actorName(actors: ActorRef | ActorRef[] | null | undefined) {
  if (!actors) return "Unknown";
  const actor = Array.isArray(actors) ? actors[0] : actors;
  return actor?.name?.trim() || "Unknown";
}

export function normalizeLook(row: Record<string, unknown>): Look {
  const actors = row.actors as ActorRef | ActorRef[] | null | undefined;
  return {
    id: String(row.id),
    image_url: String(row.image_url),
    actor_id: row.actor_id ? String(row.actor_id) : undefined,
    elo_rating: Number(row.elo_rating ?? 1200),
    total_wins: Number(row.total_wins ?? 0),
    total_battles: Number(row.total_battles ?? 0),
    actors: Array.isArray(actors) ? actors[0] ?? null : actors ?? null,
  };
}

export function slugifyUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "voter";
}

export function haptic(pattern: number | number[] = 50) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(pattern);
  }
}
