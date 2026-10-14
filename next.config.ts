import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/grond/vraag': ['./grond-bronnen/**/*'],
    '/api/grond/regels': ['./grond-regels/**/*'],
  },
};

export default nextConfig;
