import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/server";
import { actorName, normalizeLook } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase.from("users").select("id").eq("username", username).maybeSingle();
  if (!user) return { title: "Vault not found · Softbare" };

  const { data: topRow } = await supabase
    .from("vaults")
    .select("looks(image_url, elo_rating)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const look = topRow?.looks
    ? normalizeLook(topRow.looks as unknown as Record<string, unknown>)
    : null;
  const og = `/api/og?username=${encodeURIComponent(username)}&topLook=${encodeURIComponent(look?.image_url ?? "")}&elo=${Math.round(look?.elo_rating ?? 1200)}`;

  return {
    title: `@${username}'s Vault · Softbare`,
    description: "S-Tier aesthetic collection on the live visual market.",
    openGraph: {
      title: `@${username}'s Top Aesthetic`,
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [og],
    },
  };
}

export default async function PublicVault({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase.from("users").select("id").eq("username", username).maybeSingle();
  if (!user) return notFound();

  const { data: vaultItems } = await supabase
    .from("vaults")
    .select("look_id, looks(id, image_url, elo_rating, actors(name))")
    .eq("user_id", user.id);

  const items = (vaultItems ?? []).map((item) => ({
    look_id: item.look_id as string,
    look: item.looks ? normalizeLook(item.looks as unknown as Record<string, unknown>) : null,
  }));

  return (
    <main className="relative min-h-screen bg-background px-5 pb-20 text-white md:px-10">
      <SiteHeader />
      <header className="mx-auto mb-16 max-w-6xl text-center">
        <p className="text-[10px] font-bold uppercase tracking-[.3em] text-neon">Public vault</p>
        <h1 className="font-display mt-4 text-5xl font-black uppercase tracking-tighter">
          @{username}&apos;s Vault
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[.2em] text-gray-400">S-Tier aesthetic collection</p>
      </header>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) =>
          item.look ? (
            <div
              key={item.look_id}
              className={`group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <div className={`relative w-full ${index === 0 ? "aspect-square" : "aspect-[3/4]"}`}>
                <Image
                  src={item.look.image_url}
                  alt={actorName(item.look.actors)}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                <h3 className="font-display text-2xl font-bold">{actorName(item.look.actors)}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Global rank</span>
                  <span className="font-mono font-black text-neon">{Math.round(item.look.elo_rating)}</span>
                </div>
              </div>
            </div>
          ) : null
        )}
      </div>

      {items.length === 0 && (
        <p className="text-center text-sm text-gray-500">This vault is still being curated.</p>
      )}

      <div className="mt-16 flex justify-center">
        <Link
          href="/"
          className="rounded-full bg-white px-8 py-4 font-bold uppercase tracking-widest text-black shadow-glow transition-transform hover:scale-105"
        >
          Build your own vault
        </Link>
      </div>
    </main>
  );
}
