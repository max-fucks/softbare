"use client";

import { createCheckoutSession } from "@/app/actions/stripe";

export default function UpgradeButton() {
  const handleUpgrade = async () => {
    try {
      const { url } = await createCheckoutSession();
      if (url) window.location.href = url; // Redirect to Stripe
    } catch (error) {
      console.error("Failed to initiate checkout");
    }
  };

  return (
    <button 
      onClick={handleUpgrade}
      className="bg-black text-neon border border-neon font-black tracking-widest uppercase px-8 py-4 rounded-full shadow-glow hover:bg-neon hover:text-black transition-all duration-300"
    >
      Unlock Black Card - $4.99/mo
    </button>
  );
}
