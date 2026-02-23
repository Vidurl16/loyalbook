import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
