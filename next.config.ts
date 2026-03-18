import type { NextConfig } from 'next';

// Backend URL configuration
// TOGGLE: Set to 'true' for local backend, 'false' for deployed backend
const USE_LOCAL_BACKEND = false;
const BACKEND_URL = USE_LOCAL_BACKEND 
  ? 'http://localhost:5000' 
  : (process.env.NEXT_PUBLIC_API_URL || 'https://ebookbackend.vercel.app');

console.log(`[Next Config] Using ${USE_LOCAL_BACKEND ? 'LOCAL' : 'DEPLOYED'} backend: ${BACKEND_URL}`);

const nextConfig: NextConfig = {
  images: {
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
      // Medical and Health Websites
      {
        protocol: 'https',
        hostname: 'www.nimh.nih.gov',
      },
      {
        protocol: 'https',
        hostname: 'nimh.nih.gov',
      },
      {
        protocol: 'https',
        hostname: 'www.nih.gov',
      },
      {
        protocol: 'https',
        hostname: 'nih.gov',
      },
      {
        protocol: 'https',
        hostname: 'www.cdc.gov',
      },
      {
        protocol: 'https',
        hostname: 'cdc.gov',
      },
      {
        protocol: 'https',
        hostname: 'www.who.int',
      },
      {
        protocol: 'https',
        hostname: 'who.int',
      },
      {
        protocol: 'https',
        hostname: 'www.mayoclinic.org',
      },
      {
        protocol: 'https',
        hostname: 'mayoclinic.org',
      },
      {
        protocol: 'https',
        hostname: 'www.webmd.com',
      },
      {
        protocol: 'https',
        hostname: 'webmd.com',
      },
      {
        protocol: 'https',
        hostname: 'medlineplus.gov',
      },
      {
        protocol: 'https',
        hostname: 'www.medlineplus.gov',
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
  /* config options here */
};

export default nextConfig;
