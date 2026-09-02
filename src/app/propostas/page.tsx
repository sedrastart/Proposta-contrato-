import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_PROPOSTA_LABEL, type StatusProposta } from "@/lib/proposta-status";
import { parseValorFinal } from "@/lib/format";
import { PropostasLista } from "./propostas-lista";

export const dynamic = "force-dynamic";

// Propostas nesses status sem nenhuma atualização há X dias são
// consideradas "esfriando" — provável sinal de que ninguém deu
// seguimento (cobrar o cliente, reenviar, marcar como recusada etc.).
const LIMITE_DIAS_ESFRIANDO = 10;
const STATUS_PODE_ESFRIAR = new Set(["rascunho", "enviada"]);

export default async function PropostasPage() {
  const propostas = await prisma.proposta.findMany({
    orderBy: { numeroSequencial: "desc" },
    include: { cliente: { select: { id: true, razaoSocial: true } } },
  });

  const agora = Date.now();
  const propostasFormatadas = propostas.map((p) => {
    const diasParado = Math.floor((agora - p.atualizadoEm.getTime()) / (1000 * 60 * 60 * 24));
    return {
      id: p.id,
      clienteId: p.clienteId,
      numero: String(p.numeroSequencial).padStart(6, "0"),
      clienteNome: p.cliente.razaoSocial,
      dataFormatada: new Intl.DateTimeFormat("pt-BR").format(p.dataEmissao),
      dataTimestamp: p.dataEmissao.getTime(),
      valorFinal: p.valorFinal,
      valorNumerico: parseValorFinal(p.valorFinal),
      statusLabel: STATUS_PROPOSTA_LABEL[p.status as StatusProposta] ?? p.status,
      esfriando: STATUS_PODE_ESFRIAR.has(p.status) && diasParado >= LIMITE_DIAS_ESFRIANDO,
      diasParado,
    };
  });

  const totalEsfriando = propostasFormatadas.filter((p) => p.esfriando).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Propostas</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {propostas.length} proposta{propostas.length !== 1 && "s"} emitida
            {propostas.length !== 1 && "s"} no total.
            {totalEsfriando > 0 && (
              <span className="ml-2 text-amber-700">
                · {totalEsfriando} esfriando (sem movimento há {LIMITE_DIAS_ESFRIANDO}+ dias)
              </span>
            )}
          </p>
        </div>
        <Link
          href="/propostas/nova"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          + Nova proposta
        </Link>
      </div>

      {propostas.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-muted">
          Nenhuma proposta emitida ainda.
        </div>
      ) : (
        <PropostasLista propostas={propostasFormatadas} />
      )}
    </main>
  );
}
