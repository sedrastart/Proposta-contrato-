import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { AppShell } from "./app-shell";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sedra | Propostas e Contratos",
  description: "Automação de propostas e contratos de prestação de serviços contábeis",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [clientes, propostas, contratos] = await Promise.all([
    prisma.cliente.count(),
    prisma.proposta.count(),
    prisma.contrato.count(),
  ]);

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-background text-ink">
        <AppShell contagens={{ clientes, propostas, contratos }}>{children}</AppShell>
      </body>
    </html>
  );
}
