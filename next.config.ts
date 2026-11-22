import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  // Uploaded media lives on disk under /uploads and is served by app/uploads/[...path]/route.ts
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  // Keep old links from the previous site working.
  async redirects() {
    return [
      { source: "/blog", destination: "/news", permanent: true },
      { source: "/blog/:slug", destination: "/news/:slug", permanent: true },
      { source: "/requirements", destination: "/admissions", permanent: true },
      { source: "/devotion", destination: "/devotions", permanent: true },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.youtube.com" }],
  },
};

export default nextConfig;
