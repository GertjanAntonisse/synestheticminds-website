import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/grond/vraag': ['./grond-bronnen/**/*'],
  },
};

export default nextConfig;
