import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // Handle Node.js specific modules for the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
    };
    return config;
  },
};

export default nextConfig;
