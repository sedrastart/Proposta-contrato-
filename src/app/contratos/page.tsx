import { prisma } from "@/lib/prisma";
import { STATUS_CONTRATO_LABEL, type StatusContrato } from "@/lib/contrato-status";
import { parseValorFinal } from "@/lib/format";
import { ContratosLista } from "./contratos-lista";

export const dynamic = "force-dynamic";

export default async function ContratosPage() {
  const contratos = await prisma.contrato.findMany({
    orderBy: { numeroSequencial: "desc" },
    include: { cliente: { select: { id: true, razaoSocial: true } } },
  });

  const contratosFormatados = contratos.map((c) => ({
    id: c.id,
    clienteId: c.clienteId,
    numero: String(c.numeroSequencial).padStart(6, "0"),
    clienteNome: c.cliente.razaoSocial,
    dataFormatada: new Intl.DateTimeFormat("pt-BR").format(c.dataEmissao),
    dataTimestamp: c.dataEmissao.getTime(),
    valorFinal: c.valorFinal,
    valorNumerico: parseValorFinal(c.valorFinal),
    statusLabel: STATUS_CONTRATO_LABEL[c.status as StatusContrato] ?? c.status,
  }));

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink">Contratos</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {contratos.length} contrato{contratos.length !== 1 && "s"} emitido
        {contratos.length !== 1 && "s"} no total.
      </p>

      {contratos.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-muted">
          Nenhum contrato emitido ainda.
        </div>
      ) : (
        <ContratosLista contratos={contratosFormatados} />
      )}
    </main>
  );
}
