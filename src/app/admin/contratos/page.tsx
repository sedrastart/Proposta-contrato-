import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ClausulasLista } from "./clausulas-lista";

export const dynamic = "force-dynamic";

const PLACEHOLDERS_GERAL = [
  "{{valor}}",
  "{{vigenciaTexto}}",
  "{{multaDescricao}}",
  "{{condicaoPagamento}}",
  "{{servicosSelecionados}}",
];

const PLACEHOLDERS_POR_SLUG: Record<string, string[]> = {
  mei: [
    "{{valor}}",
    "{{vigenciaMeses}}",
    "{{multaDescricao}}",
    "{{condicaoPagamento}}",
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
  const { modelo: modeloSelecionado } = await searchParams;

  const modelos = await prisma.modeloContrato.findMany({
    include: { clausulas: { orderBy: { ordem: "asc" } } },
    orderBy: { slug: "asc" },
  });

  const modeloAtivo =
    modelos.find((m) => m.slug === modeloSelecionado) ?? modelos[0];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink">Modelos de contrato</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Selecione o tipo de contrato para editar. O cabeçalho (identificação
        das partes) e o bloco de assinatura não são editáveis aqui. Cláusulas
        desativadas somem do documento, mas contratos já emitidos não são
        afetados.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-line">
        <div className="flex flex-wrap gap-1">
          {modelos.map((modelo) => (
            <Link
              key={modelo.slug}
              href={`/admin/contratos?modelo=${modelo.slug}`}
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                modelo.slug === modeloAtivo?.slug
                  ? "border-accent text-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
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
            className="mb-2 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-neutral-50"
          >
            Visualizar contrato →
          </Link>
        )}
      </div>

      {modeloAtivo && (
        <section className="mt-6">
          <p className="text-xs uppercase tracking-wide text-ink-muted">
            Variáveis disponíveis:{" "}
            <span className="font-mono normal-case text-ink-muted">
              {(PLACEHOLDERS_POR_SLUG[modeloAtivo.slug] ?? PLACEHOLDERS_GERAL).join(" ")}
            </span>
          </p>

          <div className="mt-4">
            <ClausulasLista
              modeloContratoId={modeloAtivo.id}
              clausulas={modeloAtivo.clausulas}
            />
          </div>
        </section>
      )}
    </main>
  );
}
