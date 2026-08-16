import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import UploadModal from '@/components/UploadModal';
import UpgradeButton from '@/components/UpgradeButton';

export default async function PublicVault({ params }: { params: { username: string } }) {
  // Await the params object in Next.js 15 Server Components
  const { username } = await params;

  // 1. Fetch the user's ID based on their username
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (!user) return notFound();

  // 2. Fetch their exact 5 saved looks from the vault
  const { data: vaultItems } = await supabase
    .from('vaults')
    .select(`
      look_id,
      looks (
        image_url,
        elo_rating,
        actors ( name )
      )
    `)
    .eq('user_id', user.id);

  return (
    <main className="min-h-screen bg-background text-white p-8 md:p-16 flex flex-col items-center">
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">{username}&apos;s Vault</h1>
        <p className="text-neon tracking-widest uppercase text-sm">S-Tier Aesthetic Collection</p>
      </header>

      {/* The Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {vaultItems?.map((item: any, index: number) => (
          <div 
            key={item.look_id} 
            className={`relative group rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
          >
            {/* The Image */}
            <div className={`relative w-full ${index === 0 ? 'aspect-square' : 'aspect-[3/4]'}`}>
              <Image 
                src={item.looks.image_url} 
                alt={item.looks.actors?.name || "Actor"} 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            </div>
            
            {/* The Overlay Data */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
              <h3 className="text-2xl font-bold">{item.looks.actors?.name || "Unknown"}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400 uppercase text-xs font-bold tracking-wider">Global Rank</span>
                <span className="text-neon font-black">{Math.round(item.looks.elo_rating)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link href="/" className="mt-16 px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform uppercase tracking-widest shadow-glow">
        Build Your Own Vault
      </Link>

      <div className="mt-16 w-full flex justify-center">
        <UpgradeButton />
      </div>

      <div className="mt-12 w-full flex justify-center">
        <UploadModal />
      </div>
    </main>
  );
}
