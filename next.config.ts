import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100gb",
    },
    proxyClientMaxBodySize: "100gb",
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "streaming-bucket-123.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "notes-market-bucket.s3.eu-north-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      }
    ],
  },
};

export default nextConfig;


