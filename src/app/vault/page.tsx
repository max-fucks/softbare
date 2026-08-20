import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import UpgradeButton from "@/components/UpgradeButton";
import UploadModal from "@/components/UploadModal";
import { createClient } from "@/lib/supabase/server";
import { actorName, normalizeLook } from "@/lib/utils";
import { removeFromVault } from "@/app/actions/arena";
import type { Look } from "@/lib/types";

function ShareButton({ username, top }: { username: string; top: Look | null }) {
  const params = new URLSearchParams({
    username,
    topLook: top?.image_url ?? "",
    elo: String(Math.round(top?.elo_rating ?? 1200)),
  });
  const url = `/api/og?${params.toString()}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-white/15 px-5 py-3 text-[10px] font-black uppercase tracking-[.18em] text-gray-300 hover:text-white"
    >
      Export OG card
    </a>
  );
}

async function RemoveButton({ lookId }: { lookId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await removeFromVault(lookId);
      }}
    >
      <button className="text-[10px] font-bold uppercase tracking-[.18em] text-gray-500 hover:text-accent">
        Remove
      </button>
    </form>
  );
}

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const query = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="relative min-h-screen overflow-hidden px-6 py-2 text-white md:px-12">
        <div className="softbare-grid pointer-events-none absolute inset-0" />
        <SiteHeader active="vault" />
        <section className="relative z-10 mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-12 py-16 lg:grid-cols-[1fr_430px]">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[.3em] text-neon">Your private collection</p>
            <h1 className="font-display max-w-xl text-6xl font-black leading-[.92] tracking-[-.07em] md:text-8xl">
              Build a vault
              <br />
              <span className="text-accent">worth ranking.</span>
            </h1>
            <p className="mt-8 max-w-lg text-base leading-7 text-gray-400">
              Five S-Tier looks. One public card. Upgrade to Black Card when the floor is no longer enough.
            </p>
            <Link
              href="/login"
              className="mt-9 inline-flex rounded-full bg-white px-7 py-4 text-xs font-black uppercase tracking-[.18em] text-black transition hover:scale-105"
            >
              Sign in to open your vault
            </Link>
          </div>
          <div className="softbare-glass rounded-[2rem] p-7">
            <div className="mb-12 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.2em] text-gray-500">
              <span>Vault access</span>
              <span className="text-accent">Private</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-[#3b2a4a] via-[#171521] to-[#e66d88]" />
              <div className="mt-12 aspect-[3/4] rounded-2xl bg-gradient-to-br from-[#b7a68b] via-[#383049] to-[#111018]" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, username, total_votes, vault_limit, is_black_card")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) notFound();

  const { data: vaultRows } = await supabase
    .from("vaults")
    .select("look_id, created_at, looks(id, image_url, elo_rating, actors(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const items = (vaultRows ?? []).map((row) => ({
    look_id: row.look_id as string,
    look: row.looks ? normalizeLook(row.looks as unknown as Record<string, unknown>) : null,
  }));
  const used = items.length;
  const top = items[0]?.look ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden px-5 pb-20 text-white md:px-10">
      <div className="softbare-grid pointer-events-none absolute inset-0" />
      <SiteHeader active="vault" />
      <section className="relative z-10 mx-auto max-w-6xl pt-8">
        {query.success && (
          <p className="mb-6 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-center text-xs text-emerald-300">
            Black Card is live. Your vault cap is now 50.
          </p>
        )}
        {query.canceled && (
          <p className="mb-6 rounded-full border border-white/10 px-4 py-2 text-center text-xs text-gray-400">
            Checkout canceled. The floor is still open.
          </p>
        )}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-neon">S-Tier vault</p>
            <h1 className="font-display mt-3 text-5xl font-black tracking-tight md:text-7xl">@{profile.username}</h1>
            <p className="mt-3 text-sm text-gray-400">
              {used}/{profile.vault_limit} slots · {profile.total_votes} votes cast
              {profile.is_black_card ? " · Black Card" : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ShareButton username={profile.username} top={top} />
            <Link
              href={`/vault/${profile.username}`}
              className="rounded-full bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[.18em] text-black"
            >
              Public page
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="softbare-glass mt-12 rounded-[2rem] p-10 text-center">
            <p className="font-display text-3xl font-black">Empty floor.</p>
            <p className="mt-3 text-sm text-gray-400">Win a bout in the arena, then lock the look into your five.</p>
            <Link href="/" className="mt-6 inline-flex text-xs font-bold uppercase tracking-[.2em] text-neon">
              Return to arena
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) =>
              item.look ? (
                <article
                  key={item.look_id}
                  className={`relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black ${
                    index === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                >
                  <div className={`relative w-full ${index === 0 ? "aspect-square" : "aspect-[3/4]"}`}>
                    <Image
                      src={item.look.image_url}
                      alt={actorName(item.look.actors)}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black via-black/70 to-transparent p-5">
                    <div>
                      <p className="font-display text-2xl font-black">{actorName(item.look.actors)}</p>
                      <p className="font-mono text-xs text-neon">ELO {Math.round(item.look.elo_rating)}</p>
                    </div>
                    <RemoveButton lookId={item.look_id} />
                  </div>
                </article>
              ) : null
            )}
          </div>
        )}

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {!profile.is_black_card && (
            <div className="softbare-glass rounded-[2rem] p-8">
              <p className="text-[10px] font-bold uppercase tracking-[.28em] text-neon">Membership</p>
              <h2 className="font-display mt-3 text-3xl font-black">Need more than five?</h2>
              <p className="mt-3 text-sm text-gray-400">Black Card expands the vault to 50 S-Tier slots.</p>
              <div className="mt-6">
                <UpgradeButton />
              </div>
            </div>
          )}
          <UploadModal />
        </div>
      </section>
    </main>
  );
}
