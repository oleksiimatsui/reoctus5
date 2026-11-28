import type { NextConfig } from "@/client/node_modules/next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@shared"],
};

export default nextConfig;
