import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'], // Force modern, ultra-lightweight formats
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Whitelist your Supabase storage
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
