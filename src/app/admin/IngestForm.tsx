"use client";

import { useState } from "react";

export default function IngestForm() {
  const [actorName, setActorName] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Initiating open web scrape & AI filter...");

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorName, query }),
      });
      
      const data = await res.json();
      if (data.success) {
        setStatus(`Success: ${data.message}`);
        setActorName("");
        setQuery("");
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err: unknown) {
      console.error(err);
      setStatus("Critical failure connecting to ingestion pipeline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-gray-800 p-6 rounded-xl mt-8">
      <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Open Web Ingestor</h2>
      <p className="text-gray-400 text-sm mb-6">Target specific eras, red carpets, or shoots. The AI will filter explicit content automatically.</p>
      
      <form onSubmit={handleScrape} className="flex flex-col space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subject Name</label>
          <input 
            type="text" 
            required
            value={actorName}
            onChange={(e) => setActorName(e.target.value)}
            placeholder="e.g., Zendaya" 
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-neon transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Scrape Query</label>
          <input 
            type="text" 
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Zendaya 2021 Venice Film Festival Balmain high res" 
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-neon transition-colors"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-white text-black font-black uppercase tracking-widest py-4 rounded-lg mt-4 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Crawling Web..." : "Execute Scrape"}
        </button>
      </form>

      {status && <p className="mt-4 text-sm font-mono text-neon">{status}</p>}
    </div>
  );
}
