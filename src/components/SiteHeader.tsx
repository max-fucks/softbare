import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { signOut } from "@/app/actions/auth";

export default async function SiteHeader({ active }: { active?: "arena" | "vault" | "market" | "admin" }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    username = profile?.username ?? null;
  }

  const admin = isAdminEmail(user?.email);

  return (
    <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-lg font-black text-black">S</span>
        <span className="font-display text-lg font-black tracking-[.22em]">SOFTBARE</span>
      </Link>
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-gray-400 md:gap-4">
        <Link href="/" className={active === "arena" ? "text-white" : "hover:text-white"}>
          Arena
        </Link>
        <Link href="/market" className={active === "market" ? "text-white" : "hover:text-white"}>
          Market
        </Link>
        <Link href="/vault" className={active === "vault" ? "text-white" : "hover:text-white"}>
          Vault
        </Link>
        {username && (
          <Link href={`/vault/${username}`} className="hidden hover:text-white sm:inline">
            Public
          </Link>
        )}
        {admin && (
          <Link href="/admin" className={active === "admin" ? "text-neon" : "text-neon/80 hover:text-neon"}>
            Admin
          </Link>
        )}
        {user ? (
          <form action={signOut}>
            <button className="rounded-full border border-white/15 px-4 py-2 hover:border-white/40 hover:text-white">
              Sign out
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="rounded-full border border-white/15 px-4 py-2 hover:border-white/40 hover:text-white"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
