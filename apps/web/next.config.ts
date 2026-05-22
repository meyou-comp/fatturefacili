import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://fatture-facili-2ce2b.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
