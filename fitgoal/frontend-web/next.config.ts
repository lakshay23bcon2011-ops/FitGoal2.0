import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose', 'express', 'bcryptjs', 'jsonwebtoken', 'helmet', 'cors'],
};

export default nextConfig;
