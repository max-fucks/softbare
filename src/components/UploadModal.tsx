"use client";

import { useState, useRef } from "react";

export default function UploadModal() {
  const [file, setFile] = useState<File | null>(null);
  const [actorName, setActorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !actorName) return;

    setLoading(true);
    setStatus("Uploading to the Vault...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("actorName", actorName);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setStatus("Look successfully injected into the Arena!");
        setFile(null);
        setActorName("");
      } else {
        setStatus("Upload failed. Please try again.");
      }
    } catch (error) {
      setStatus("Critical error during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
      <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Contribute</h2>
      <p className="text-gray-400 text-sm mb-6">Drop a high-res look to inject it into the global Arena.</p>

      <form onSubmit={handleUpload} className="space-y-6">
        {/* Drag and Drop Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-neon transition-colors"
        >
          {file ? (
            <span className="text-neon font-bold">{file.name}</span>
          ) : (
            <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Tap to select image</span>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Who is this?</label>
          <input 
            type="text" 
            required
            placeholder="e.g., Ana de Armas"
            value={actorName}
            onChange={(e) => setActorName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-neon transition-colors"
          />
        </div>

        <button 
          type="submit"
          disabled={loading || !file || !actorName}
          className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-lg hover:bg-gray-200 transition-transform active:scale-95 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Inject Look"}
        </button>
        
        {status && <p className="text-center text-sm font-mono text-neon mt-4">{status}</p>}
      </form>
    </div>
  );
}
