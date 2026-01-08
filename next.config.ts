import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    esmExternals: true,
  },
  transpilePackages: ['nextstepjs'],
};

export default nextConfig;
