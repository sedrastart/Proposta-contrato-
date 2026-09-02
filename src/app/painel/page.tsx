import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_PROPOSTA, STATUS_PROPOSTA_LABEL, type StatusProposta } from "@/lib/proposta-status";
import { STATUS_CONTRATO_LABEL, type StatusContrato } from "@/lib/contrato-status";
import { calcularVencimento, LIMITE_DIAS_VENCENDO } from "@/lib/vencimento-contrato";

export const dynamic = "force-dynamic";

const LIMITE_DIAS_ESFRIANDO = 10;
const STATUS_PODE_ESFRIAR = new Set(["rascunho", "enviada"]);

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

type Periodo = "mes" | "mes_passado" | "tudo";

function intervaloDoPeriodo(periodo: Periodo): { gte: Date; lte: Date } | null {
  const agora = new Date();
  if (periodo === "mes") {
    const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
    return { gte: inicio, lte: agora };
  }
  if (periodo === "mes_passado") {
    const inicio = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const fim = new Date(agora.getFullYear(), agora.getMonth(), 0, 23, 59, 59, 999);
    return { gte: inicio, lte: fim };
  }
  return null;
}

const LABEL_PERIODO: Record<Periodo, string> = {
  mes: "Este mês",
  mes_passado: "Mês passado",
  tudo: "Todo o período",
};

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo: periodoParam } = await searchParams;
  const periodo: Periodo =
    periodoParam === "mes" || periodoParam === "mes_passado" ? periodoParam : "tudo";
  const intervalo = intervaloDoPeriodo(periodo);
  const filtroData = intervalo ? { dataEmissao: intervalo } : {};

  const [
    totalClientes,
    totalContratosPeriodo,
    propostasPorStatus,
    contratosAssinadosPeriodo,
    ultimosContratos,
    ultimasPropostas,
    propostasAbertas,
    contratosAtivos,
  ] = await Promise.all([
    prisma.cliente.count(),
    prisma.contrato.count({ where: filtroData }),
    prisma.proposta.groupBy({ by: ["status"], _count: true, where: filtroData }),
    prisma.contrato.count({ where: { status: "assinado", ...filtroData } }),
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
    prisma.proposta.findMany({
      where: { status: { in: ["rascunho", "enviada"] } },
      select: { id: true, status: true, atualizadoEm: true },
    }),
    prisma.contrato.findMany({
      where: { status: { not: "cancelado" } },
      select: { id: true, dataEmissao: true, vigenciaMeses: true },
    }),
  ]);

  const totalPropostas = propostasPorStatus.reduce((soma, p) => soma + p._count, 0);
  const contagemPorStatus = Object.fromEntries(
    STATUS_PROPOSTA.map((s) => [s, propostasPorStatus.find((p) => p.status === s)?._count ?? 0])
  ) as Record<StatusProposta, number>;

  const agora = Date.now();
  const totalEsfriando = propostasAbertas.filter((p) => {
    const dias = Math.floor((agora - p.atualizadoEm.getTime()) / (1000 * 60 * 60 * 24));
    return STATUS_PODE_ESFRIAR.has(p.status) && dias >= LIMITE_DIAS_ESFRIANDO;
  }).length;

  const totalVencendo = contratosAtivos.filter((c) => {
    const vencimento = calcularVencimento(c.dataEmissao, c.vigenciaMeses, agora);
    return vencimento !== null && vencimento.diasParaVencer <= LIMITE_DIAS_VENCENDO;
  }).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Sedra — Propostas e Contratos
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Automação de propostas comerciais e contratos de prestação de
        serviços contábeis.
      </p>

      {(totalEsfriando > 0 || totalVencendo > 0) && (
        <div className="mt-6 flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:gap-4">
          <span className="font-medium">⚠ Precisa de atenção:</span>
          {totalEsfriando > 0 && (
            <Link href="/propostas" className="hover:underline">
              {totalEsfriando} proposta{totalEsfriando !== 1 && "s"} esfriando →
            </Link>
          )}
          {totalVencendo > 0 && (
            <Link href="/contratos" className="hover:underline">
              {totalVencendo} contrato{totalVencendo !== 1 && "s"} perto de vencer →
            </Link>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-2">
        {(["mes", "mes_passado", "tudo"] as Periodo[]).map((p) => (
          <Link
            key={p}
            href={p === "tudo" ? "/painel" : `/painel?periodo=${p}`}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
              periodo === p
                ? "border-accent bg-accent text-white"
                : "border-line text-ink-muted hover:bg-neutral-50"
            }`}
          >
            {LABEL_PERIODO[p]}
          </Link>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Clientes</p>
          <p className="mt-2 tabular-nums text-2xl font-semibold text-ink">{totalClientes}</p>
          <p className="mt-2.5 text-[11px] text-ink-muted">total cadastrado, todos os períodos</p>
        </div>

        <div className="rounded-lg border border-line bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Propostas por status
          </p>
          <p className="mt-2 tabular-nums text-2xl font-semibold text-ink">
            {totalPropostas} <span className="text-sm font-normal text-ink-muted">no período</span>
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
            {contratosAssinadosPeriodo}
            <span className="text-sm font-normal text-ink-muted"> de {totalContratosPeriodo} emitidos</span>
          </p>
          {totalContratosPeriodo > 0 && (
            <>
              <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <span
                  className="block h-full rounded-full bg-emerald-500"
                  style={{ width: `${(contratosAssinadosPeriodo / totalContratosPeriodo) * 100}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {Math.round((contratosAssinadosPeriodo / totalContratosPeriodo) * 100)}% assinados
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
