import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Temporarily disable optimization to fix Netlify image loading
    // Netlify's Next.js plugin should handle this, but if all images fail,
    // disabling optimization will allow images to load directly
    unoptimized: true,
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
