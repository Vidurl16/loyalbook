import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.perfect10.co.za",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
