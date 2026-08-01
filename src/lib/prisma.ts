import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Usa o driver adapter (pg) em vez do engine binario nativo do Prisma: o
// binario nao e empacotado de forma confiavel pelo tracer de arquivos da
// Vercel quando o client tem output customizado, causando
// PrismaClientInitializationError em runtime.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
