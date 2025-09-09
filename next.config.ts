import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'howgioosfxkhcuefqrdg.supabase.co',
      },
    ],
  },
};

export default nextConfig;
