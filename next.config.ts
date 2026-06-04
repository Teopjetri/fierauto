import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
      {
        pathname: "/hero/**",
      },
      {
        pathname: "/logo/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/inventory", destination: "/#vetture", permanent: false },
      { source: "/about", destination: "/", permanent: false },
      { source: "/contact", destination: "/#contatti", permanent: false },
    ];
  },
};

export default nextConfig;
