import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user's home directory otherwise gets
  // picked up as the inferred workspace root, which breaks relative paths
  // (e.g. the SQLite DATABASE_URL) at runtime.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
