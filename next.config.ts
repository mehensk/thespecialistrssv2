import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Temporarily disable optimization to diagnose Netlify image issues
    // The Netlify plugin should handle this, but if images aren't loading, 
    // this will help identify if it's an optimization issue
    unoptimized: process.env.NODE_ENV === 'production' ? false : false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
