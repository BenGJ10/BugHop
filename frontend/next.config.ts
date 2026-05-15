import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendUrl) {
      return [];
    }

    return [
      {
        source: "/api/inngest",
        destination: `${backendUrl}/api/inngest`,
      },
      {
        source: "/api/inngest/:path*",
        destination: `${backendUrl}/api/inngest/:path*`,
      },
    ];
  },
};

export default nextConfig;
