import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the user's home directory otherwise gets
  // picked up as the inferred workspace root, which breaks relative paths
  // (e.g. the SQLite DATABASE_URL) at runtime.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // O Prisma Client carrega o binario da query engine via require dinamico
  // (baseado na plataforma detectada em runtime), o que o rastreador de
  // arquivos do Next nao consegue seguir sozinho — sem isso, o .so.node fica
  // de fora do bundle da serverless function na Vercel.
  outputFileTracingIncludes: {
    "/**/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
