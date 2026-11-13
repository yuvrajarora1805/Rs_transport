import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Allow requests from LAN IP and tunnel domain during dev
  allowedDevOrigins: [
    "192.168.1.12",
    "rs.yarora.dev",
    "*.yarora.dev",
  ],
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:4000/:path*',
      },
    ];
  },
};

export default nextConfig;
