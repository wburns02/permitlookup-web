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
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "storms.ecbtx.com",
          },
        ],
        destination: "/roofers",
        permanent: true,
      },
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "roofers.ecbtx.com",
          },
        ],
        destination: "/roofers",
        permanent: true,
      },
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "broadband.ecbtx.com",
          },
        ],
        destination: "/broadband",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
