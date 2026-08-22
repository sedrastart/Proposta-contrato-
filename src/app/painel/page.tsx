import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_PROPOSTA, STATUS_PROPOSTA_LABEL, type StatusProposta } from "@/lib/proposta-status";
import { STATUS_CONTRATO_LABEL, type StatusContrato } from "@/lib/contrato-status";

export const dynamic = "force-dynamic";

const SEG_COR: Record<StatusProposta, string> = {
  rascunho: "bg-neutral-300",
  enviada: "bg-sky-500",
  aceita: "bg-emerald-500",
  recusada: "bg-red-400",
};

const CHIP_PROPOSTA: Record<string, string> = {
  rascunho: "bg-neutral-100 text-neutral-600",
  enviada: "bg-sky-50 text-sky-700",
  aceita: "bg-emerald-50 text-emerald-700",
  recusada: "bg-red-50 text-red-700",
};

const CHIP_CONTRATO: Record<string, string> = {
  emitido: "bg-sky-50 text-sky-700",
  assinado: "bg-emerald-50 text-emerald-700",
  cancelado: "bg-red-50 text-red-700",
};

export default async function PainelPage() {
  const [totalClientes, totalContratos, propostasPorStatus, contratosAssinados, ultimosContratos, ultimasPropostas] =
    await Promise.all([
      prisma.cliente.count(),
      prisma.contrato.count(),
      prisma.proposta.groupBy({ by: ["status"], _count: true }),
      prisma.contrato.count({ where: { status: "assinado" } }),
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

  const totalPropostas = propostasPorStatus.reduce((soma, p) => soma + p._count, 0);
  const contagemPorStatus = Object.fromEntries(
    STATUS_PROPOSTA.map((s) => [s, propostasPorStatus.find((p) => p.status === s)?._count ?? 0])
  ) as Record<StatusProposta, number>;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Sedra — Propostas e Contratos
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Automação de propostas comerciais e contratos de prestação de
        serviços contábeis.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Clientes</p>
          <p className="mt-2 tabular-nums text-2xl font-semibold text-ink">{totalClientes}</p>
        </div>

        <div className="rounded-lg border border-line bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Propostas por status
          </p>
          <p className="mt-2 tabular-nums text-2xl font-semibold text-ink">
            {totalPropostas} <span className="text-sm font-normal text-ink-muted">no total</span>
          </p>
          {totalPropostas > 0 && (
            <>
              <div className="mt-3.5 flex h-1.5 overflow-hidden rounded-full bg-neutral-100">
                {STATUS_PROPOSTA.map((s) => {
                  const pct = (contagemPorStatus[s] / totalPropostas) * 100;
                  if (pct === 0) return null;
                  return <span key={s} className={SEG_COR[s]} style={{ width: `${pct}%` }} />;
                })}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-muted">
                {STATUS_PROPOSTA.map((s) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${SEG_COR[s]}`} />
                    {contagemPorStatus[s]} {STATUS_PROPOSTA_LABEL[s].toLowerCase()}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-lg border border-line bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Contratos assinados
          </p>
          <p className="mt-2 tabular-nums text-2xl font-semibold text-ink">
            {contratosAssinados}
            <span className="text-sm font-normal text-ink-muted"> de {totalContratos} emitidos</span>
          </p>
          {totalContratos > 0 && (
            <>
              <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <span
                  className="block h-full rounded-full bg-emerald-500"
                  style={{ width: `${(contratosAssinados / totalContratos) * 100}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {Math.round((contratosAssinados / totalContratos) * 100)}% assinados
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/clientes/novo"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          + Novo cliente
        </Link>
        <Link
          href="/clientes"
          className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-accent-soft"
        >
          Ver clientes
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Últimas propostas
            </h2>
            <Link href="/propostas" className="text-xs text-ink-muted hover:underline">
              ver todas →
            </Link>
          </div>
          {ultimasPropostas.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line bg-white py-8 text-center text-sm text-ink-muted">
              Nenhuma proposta emitida ainda.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              <ul className="divide-y divide-line">
                {ultimasPropostas.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <Link href={`/clientes/${p.clienteId}`} className="min-w-0 flex-1 truncate hover:underline">
                      {p.cliente.razaoSocial}
                    </Link>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CHIP_PROPOSTA[p.status] ?? CHIP_PROPOSTA.rascunho}`}
                    >
                      {STATUS_PROPOSTA_LABEL[p.status as StatusProposta] ?? p.status}
                    </span>
                    <span className="tabular-nums text-ink-muted">{p.valorFinal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Últimos contratos
            </h2>
            <Link href="/contratos" className="text-xs text-ink-muted hover:underline">
              ver todos →
            </Link>
          </div>
          {ultimosContratos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line bg-white py-8 text-center text-sm text-ink-muted">
              Nenhum contrato emitido ainda.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              <ul className="divide-y divide-line">
                {ultimosContratos.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <Link
                      href={`/clientes/${c.clienteId}/contratos/${c.id}`}
                      className="min-w-0 flex-1 truncate hover:underline"
                    >
                      {c.cliente.razaoSocial}
                    </Link>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CHIP_CONTRATO[c.status] ?? CHIP_CONTRATO.emitido}`}
                    >
                      {STATUS_CONTRATO_LABEL[c.status as StatusContrato] ?? c.status}
                    </span>
                    <span className="tabular-nums text-ink-muted">{c.valorFinal}</span>
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
