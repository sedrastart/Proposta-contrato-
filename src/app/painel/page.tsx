import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PainelPage() {
  const [totalClientes, totalContratos, totalPropostas, ultimosContratos, ultimasPropostas] =
    await Promise.all([
      prisma.cliente.count(),
      prisma.contrato.count(),
      prisma.proposta.count(),
      prisma.contrato.findMany({
        orderBy: { numeroSequencial: "desc" },
        take: 5,
        include: { cliente: { select: { id: true, razaoSocial: true } } },
      }),
      prisma.proposta.findMany({
        orderBy: { numeroSequencial: "desc" },
        take: 5,
        include: { cliente: { select: { id: true, razaoSocial: true } } },
      }),
    ]);

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
          <p className="text-3xl font-semibold text-neutral-900">{totalClientes}</p>
          <p className="mt-1 text-sm text-neutral-500">
            cliente{totalClientes !== 1 && "s"} cadastrado{totalClientes !== 1 && "s"}
          </p>
        </div>
        <Link
          href="/propostas"
          className="rounded-lg border border-neutral-200 p-5 hover:border-neutral-400"
        >
          <p className="text-3xl font-semibold text-neutral-900">{totalPropostas}</p>
          <p className="mt-1 text-sm text-neutral-500">
            proposta{totalPropostas !== 1 && "s"} emitida{totalPropostas !== 1 && "s"}
          </p>
        </Link>
        <Link
          href="/contratos"
          className="rounded-lg border border-neutral-200 p-5 hover:border-neutral-400"
        >
          <p className="text-3xl font-semibold text-neutral-900">{totalContratos}</p>
          <p className="mt-1 text-sm text-neutral-500">
            contrato{totalContratos !== 1 && "s"} emitido{totalContratos !== 1 && "s"}
          </p>
        </Link>
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

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Últimas propostas
            </h2>
            <Link href="/propostas" className="text-xs text-neutral-500 hover:underline">
              ver todas →
            </Link>
          </div>
          {ultimasPropostas.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
              Nenhuma proposta emitida ainda.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <ul className="divide-y divide-neutral-100">
                {ultimasPropostas.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <Link href={`/clientes/${p.clienteId}`} className="hover:underline">
                      {p.cliente.razaoSocial}
                    </Link>
                    <span className="text-neutral-500">{p.valorFinal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Últimos contratos
            </h2>
            <Link href="/contratos" className="text-xs text-neutral-500 hover:underline">
              ver todos →
            </Link>
          </div>
          {ultimosContratos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
              Nenhum contrato emitido ainda.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <ul className="divide-y divide-neutral-100">
                {ultimosContratos.map((c) => (
                  <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <Link
                      href={`/clientes/${c.clienteId}/contratos/${c.id}`}
                      className="hover:underline"
                    >
                      {c.cliente.razaoSocial}
                    </Link>
                    <span className="text-neutral-500">{c.valorFinal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
