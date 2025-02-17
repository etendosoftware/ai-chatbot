import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'https://ui.ai.labs.etendo.cloud'
      },
    ],
  },
};

export default nextConfig;
