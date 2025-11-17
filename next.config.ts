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
  },
  // Ensure public folder is included in build
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
