import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh'
      },
    ],
  },
  env: {
    NEXT_PUBLIC_ETENDO_URL: process.env.ETENDO_URL,
    NEXT_PUBLIC_ETENDO_JWT_TOKEN: process.env.ETENDO_JWT_TOKEN,
  },
};

export default nextConfig;
