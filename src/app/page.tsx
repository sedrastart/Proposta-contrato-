import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const totalClientes = await prisma.cliente.count();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900">
        Sedra — Propostas e Contratos
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Automação de propostas comerciais e contratos de prestação de
        serviços contábeis.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-neutral-200 p-5">
          <p className="text-3xl font-semibold text-neutral-900">
            {totalClientes}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            cliente{totalClientes !== 1 && "s"} cadastrado
            {totalClientes !== 1 && "s"}
          </p>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/clientes/novo"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Novo cliente
        </Link>
        <Link
          href="/clientes"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Ver clientes
        </Link>
      </div>
    </main>
  );
}
