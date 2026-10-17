import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.9", "localhost", "127.0.0.1"],

  experimental: {
    // ✅ Renamed and moved inside experimental
    proxyClientMaxBodySize: "25mb",

    serverActions: {
      bodySizeLimit: "25mb",
    },
  },

  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;