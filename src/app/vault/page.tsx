import Link from "next/link";

export default function VaultLanding() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 text-white md:px-12">
      <div className="softbare-grid pointer-events-none absolute inset-0" />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-sm font-black tracking-[.28em]">SOFTBARE</Link>
        <Link href="/" className="text-xs font-bold uppercase tracking-[.2em] text-gray-400 hover:text-white">Back to arena</Link>
      </header>
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-12 py-16 lg:grid-cols-[1fr_430px]">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[.3em] text-neon">Your private collection</p>
          <h1 className="max-w-xl text-6xl font-black leading-[.92] tracking-[-.07em] md:text-8xl">Build a vault<br /><span className="text-accent">worth ranking.</span></h1>
          <p className="mt-8 max-w-lg text-base leading-7 text-gray-400">Save your favourite looks, upload new contenders, and build a visual identity that can compete in the Softbare market.</p>
          <Link href="/login" className="mt-9 inline-flex rounded-full bg-white px-7 py-4 text-xs font-black uppercase tracking-[.18em] text-black transition hover:scale-105">Sign in to open your vault</Link>
        </div>
        <div className="softbare-glass rounded-[2rem] p-7">
          <div className="mb-12 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.2em] text-gray-500"><span>Vault access</span><span className="text-accent">Private</span></div>
          <div className="grid grid-cols-2 gap-3"><div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-[#3b2a4a] via-[#171521] to-[#e66d88]" /><div className="mt-12 aspect-[3/4] rounded-2xl bg-gradient-to-br from-[#b7a68b] via-[#383049] to-[#111018]" /></div>
          <div className="mt-7 border-t border-white/10 pt-5"><p className="text-xl font-black">Curate your edge.</p><p className="mt-2 text-sm leading-6 text-gray-500">Your first saved look will appear here after sign in.</p></div>
        </div>
      </section>
    </main>
  );
}
