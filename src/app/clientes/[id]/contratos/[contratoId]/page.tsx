import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContratoStatusSelector } from "./status-selector";

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
      <Link href={`/clientes/${id}`} className="text-sm text-neutral-500 hover:underline">
        ← Voltar ao cliente
      </Link>

      <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Contrato nº {numero} gerado com sucesso.
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 p-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Número</dt>
            <dd className="mt-0.5 font-mono text-neutral-900">{numero}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Status</dt>
            <dd className="mt-0.5">
              <ContratoStatusSelector contratoId={contrato.id} statusAtual={contrato.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Emitido em</dt>
            <dd className="mt-0.5 text-neutral-900">
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                contrato.dataEmissao
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Valor</dt>
            <dd className="mt-0.5 text-neutral-900">{contrato.valorFinal}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Vigência</dt>
            <dd className="mt-0.5 text-neutral-900">{contrato.vigenciaMeses} meses</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Serviços</dt>
            <dd className="mt-0.5 text-neutral-900">{contrato.servicosSnapshot}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 flex gap-3">
        <a
          href={`/api/contratos/${contrato.id}/pdf`}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Baixar PDF
        </a>
        <a
          href={`/api/contratos/${contrato.id}/docx`}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Baixar DOCX
        </a>
        {contrato.propostaOrigem && (
          <Link
            href={`/clientes/${id}/propostas/${contrato.propostaOrigem.id}`}
            className="flex items-center rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Gerado a partir da proposta nº{" "}
            {String(contrato.propostaOrigem.numeroSequencial).padStart(6, "0")} →
          </Link>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6">
        <p className="mb-3 text-xs uppercase tracking-wide text-neutral-500">
          Texto emitido (snapshot)
        </p>
        <pre className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-800">
          {contrato.textoCompleto}
        </pre>
      </div>
    </main>
  );
}
