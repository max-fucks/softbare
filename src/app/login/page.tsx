import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  const signInWithGoogle = async () => {
    "use server";
    const authClient = await createClient();
    const headersList = await headers();
    const requestOrigin =
      headersList.get("origin") ||
      `${headersList.get("x-forwarded-proto") || "https"}://${headersList.get("host")}`;
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "production" ? "https://softbare.vercel.app" : requestOrigin);
    const { data } = await authClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (data.url) {
      redirect(data.url);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="softbare-grid pointer-events-none absolute inset-0" />
      <div className="softbare-glass relative z-10 w-full max-w-md rounded-[2rem] p-10 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[.32em] text-neon">Softbare identity</p>
        <h1 className="font-display mt-4 text-4xl font-black uppercase tracking-tight">Identify yourself</h1>
        <p className="mt-3 text-sm text-gray-400">Google sign-in writes your votes to the live ledger and opens a 5-slot vault.</p>
        {error && <p className="mt-4 text-xs text-accent">Auth callback failed. Try again.</p>}
        <form action={signInWithGoogle} className="mt-8">
          <button className="w-full rounded-full bg-white px-8 py-4 font-bold text-black shadow-glow transition-transform hover:scale-105 active:scale-95">
            Enter with Google
          </button>
        </form>
        <Link href="/" className="mt-6 inline-block text-[10px] uppercase tracking-[.2em] text-gray-500 hover:text-white">
          Back to arena
        </Link>
      </div>
    </main>
  );
}
