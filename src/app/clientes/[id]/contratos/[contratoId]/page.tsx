import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContratoStatusSelector } from "./status-selector";
import { BotaoExcluirContrato } from "./botao-excluir-contrato";

export default async function ContratoEmitidoPage({
  params,
}: {
  params: Promise<{ id: string; contratoId: string }>;
}) {
  const { id, contratoId } = await params;

  const contrato = await prisma.contrato.findUnique({
    where: { id: contratoId },
    include: { propostaOrigem: { select: { id: true, numeroSequencial: true } } },
  });
  if (!contrato || contrato.clienteId !== id) notFound();

  const numero = String(contrato.numeroSequencial).padStart(6, "0");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href={`/clientes/${id}`} className="text-sm text-ink-muted hover:underline">
        ← Voltar ao cliente
      </Link>

      <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Contrato nº {numero} gerado com sucesso.
      </div>

      <div className="mt-6 rounded-lg border border-line p-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Número</dt>
            <dd className="mt-0.5 tabular-nums text-ink">{numero}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Status</dt>
            <dd className="mt-0.5">
              <ContratoStatusSelector contratoId={contrato.id} statusAtual={contrato.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Emitido em</dt>
            <dd className="mt-0.5 text-ink">
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                contrato.dataEmissao
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Valor</dt>
            <dd className="mt-0.5 text-ink">{contrato.valorFinal}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Vigência</dt>
            <dd className="mt-0.5 text-ink">{contrato.vigenciaMeses} meses</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Serviços</dt>
            <dd className="mt-0.5 text-ink">{contrato.servicosSnapshot}</dd>
          </div>
        </dl>
        <BotaoExcluirContrato contratoId={contrato.id} clienteId={id} numero={numero} />
      </div>

      <div className="mt-4 flex gap-3">
        <a
          href={`/api/contratos/${contrato.id}/pdf`}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          Baixar PDF
        </a>
        <a
          href={`/api/contratos/${contrato.id}/docx`}
          className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-neutral-50"
        >
          Baixar DOCX
        </a>
        {contrato.propostaOrigem && (
          <Link
            href={`/clientes/${id}/propostas/${contrato.propostaOrigem.id}`}
            className="flex items-center rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-neutral-50"
          >
            Gerado a partir da proposta nº{" "}
            {String(contrato.propostaOrigem.numeroSequencial).padStart(6, "0")} →
          </Link>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-line bg-white p-6">
        <p className="mb-3 text-xs uppercase tracking-wide text-ink-muted">
          Texto emitido (snapshot)
        </p>
        <pre className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink">
          {contrato.textoCompleto}
        </pre>
      </div>
    </main>
  );
}
