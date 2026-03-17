import type { NextConfig } from 'next';

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
    const localBackend = 'http://localhost:5000';
    const remoteBackend =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://dr-sayyad-m-quadri-backend.vercel.app';

    const backendOrigin =
      process.env.NODE_ENV === 'development' ? localBackend : remoteBackend;

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
