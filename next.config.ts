import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "dumpster.ecbtx.com",
          },
        ],
        destination: "/dumpster-leads",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
