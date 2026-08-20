import type { Metadata } from "next";
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Softbare — The Aesthetic Stock Market",
  description: "Swipe two looks. Move live ELO. Vault your S-Tier taste.",
  openGraph: {
    title: "Softbare",
    description: "A live stock market for visual culture.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background font-sans text-white">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
