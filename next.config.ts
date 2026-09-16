import type { NextConfig } from "next";

// Bypass local SSL inspection / CA certificate errors (UNABLE_TO_VERIFY_LEAF_SIGNATURE) in Node.js dev environment
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
