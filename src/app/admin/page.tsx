import { getDashboardStats } from '@/app/actions/admin';
import Image from 'next/image';
import IngestForm from './IngestForm';

export default async function AdminDashboard() {
  const { topLooks, totalVotes } = await getDashboardStats();

  return (
    <div className="min-h-screen bg-surface p-8 text-white">
      <header className="mb-12 border-b border-gray-800 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-neon">Softbare Command</h1>
          <p className="text-gray-400 mt-2">Real-time Aesthetic Sentiment</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-accent">{totalVotes?.toLocaleString()}</p>
          <p className="text-sm text-gray-500 uppercase tracking-widest">Total Votes Processed</p>
        </div>
      </header>

      <section>
        <h2 className="text-xl font-bold mb-6">Global Top 10 (Highest ELO)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {topLooks?.map((look: any, index: number) => (
            <div key={look.id} className="bg-black p-4 rounded-xl shadow-lg border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-black text-gray-600">#{index + 1}</span>
                <span className="bg-neon/20 text-neon px-3 py-1 rounded-full text-sm font-bold">
                  {Math.round(look.elo_rating)}
                </span>
              </div>
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden mb-3">
                <Image 
                  src={look.image_url} 
                  alt={look.actors?.name || "Actor"} 
                  fill 
                  className="object-cover" 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <h3 className="font-bold text-lg truncate">{look.actors?.name || "Unknown"}</h3>
              <p className="text-sm text-gray-400">{look.total_wins} Wins / {look.total_battles} Battles</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <IngestForm />
      </section>
    </div>
  );
}
