import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function Login() {
  const signInWithGoogle = async () => {
    "use server";
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://softbare.app/auth/callback',
      },
    })
    if (data.url) {
      redirect(data.url)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background flex-col">
      <h1 className="text-4xl text-white font-black mb-8 uppercase tracking-widest">Identify Yourself</h1>
      <form action={signInWithGoogle}>
        <button className="px-8 py-4 bg-white text-black font-bold rounded-full shadow-glow transition-transform hover:scale-105 active:scale-95">
          Enter with Google
        </button>
      </form>
    </div>
  )
}
