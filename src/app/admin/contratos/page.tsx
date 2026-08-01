import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ClausulaEditor } from "./clausula-editor";

export const dynamic = "force-dynamic";

const PLACEHOLDERS_POR_SLUG: Record<string, string[]> = {
  geral: ["{{valor}}", "{{vigenciaTexto}}", "{{multaDescricao}}", "{{servicosSelecionados}}"],
  mei: [
    "{{valor}}",
    "{{vigenciaMeses}}",
    "{{multaDescricao}}",
    "{{servicosSelecionados}}",
    "{{notasQuantidadeTexto}}",
    "{{notasValorAdicional}}",
    "{{lancamentosQuantidadeTexto}}",
    "{{faixasExcedenteLista}}",
  ],
};

export default async function AdminContratosPage({
  searchParams,
}: {
  searchParams: Promise<{ modelo?: string }>;
}) {
  const { modelo: modeloSelecionado = "geral" } = await searchParams;

  const modelos = await prisma.modeloContrato.findMany({
    include: { clausulas: { orderBy: { ordem: "asc" } } },
    orderBy: { slug: "asc" },
  });

  const modeloAtivo =
    modelos.find((m) => m.slug === modeloSelecionado) ?? modelos[0];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900">Modelos de contrato</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Selecione o tipo de contrato para editar. O cabeçalho (identificação
        das partes) e o bloco de assinatura não são editáveis aqui. Cláusulas
        desativadas somem do documento, mas contratos já emitidos não são
        afetados.
      </p>

      <div className="mt-6 flex items-center justify-between border-b border-neutral-200">
        <div className="flex gap-1">
          {modelos.map((modelo) => (
            <Link
              key={modelo.slug}
              href={`/admin/contratos?modelo=${modelo.slug}`}
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                modelo.slug === modeloAtivo?.slug
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {modelo.nome}
            </Link>
          ))}
        </div>
        {modeloAtivo && (
          <Link
            href={`/admin/contratos/preview?modelo=${modeloAtivo.slug}`}
            target="_blank"
            className="mb-2 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Visualizar contrato →
          </Link>
        )}
      </div>

      {modeloAtivo && (
        <section className="mt-6">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Variáveis disponíveis:{" "}
            <span className="font-mono normal-case text-neutral-600">
              {(PLACEHOLDERS_POR_SLUG[modeloAtivo.slug] ?? []).join(" ")}
            </span>
          </p>

          <div className="mt-4 space-y-4">
            {modeloAtivo.clausulas.map((clausula) => (
              <ClausulaEditor key={clausula.id} clausula={clausula} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
