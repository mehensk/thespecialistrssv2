import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Netlify plugin handles image optimization, but ensure remote images work
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // For Netlify: ensure local images are optimized correctly
    loader: 'default',
    formats: ['image/avif', 'image/webp'],
  },
  // Ensure public folder is included in build
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
