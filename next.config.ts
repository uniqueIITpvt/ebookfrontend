import type { NextConfig } from 'next';

// Backend URL configuration
// TOGGLE: Set to 'true' for local backend, 'false' for deployed backend
const USE_LOCAL_BACKEND = true;
const BACKEND_URL = USE_LOCAL_BACKEND
  ? 'http://localhost:5000'
  : (process.env.NEXT_PUBLIC_API_URL || 'https://ebookbackend.vercel.app');

console.log(`[Next Config] Using ${USE_LOCAL_BACKEND ? 'LOCAL' : 'DEPLOYED'} backend: ${BACKEND_URL}`);

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Placeholder images
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
