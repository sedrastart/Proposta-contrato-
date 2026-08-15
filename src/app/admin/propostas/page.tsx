import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ModeloPropostaEditor } from "./modelo-editor";

export const dynamic = "force-dynamic";

const PLACEHOLDERS = [
  "{{contratanteNome}}",
  "{{contratanteCpfCnpj}}",
  "{{servicosLista}}",
  "{{servicosSelecionados}}",
  "{{valor}}",
  "{{vigenciaTexto}}",
  "{{condicaoPagamento}}",
  "{{telefoneContratado}}",
  "{{emailContratado}}",
  "{{siteContratado}}",
];

export default async function AdminPropostasPage({
  searchParams,
}: {
  searchParams: Promise<{ modelo?: string }>;
}) {
  const { modelo: modeloSelecionado } = await searchParams;

  const modelos = await prisma.modeloProposta.findMany({
    orderBy: { slug: "asc" },
  });

  const modeloAtivo = modelos.find((m) => m.slug === modeloSelecionado) ?? modelos[0];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink">Modelos de proposta</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Selecione o regime para editar o rascunho padrão. Toda nova proposta
        criada para um cliente daquele regime nasce a partir deste texto, e
        pode ser adaptada livremente depois, por cliente.
      </p>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-line">
        {modelos.map((modelo) => (
          <Link
            key={modelo.slug}
            href={`/admin/propostas?modelo=${modelo.slug}`}
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

      {modeloAtivo ? (
        <section className="mt-6">
          <p className="text-xs uppercase tracking-wide text-ink-muted">
            Variáveis disponíveis:{" "}
            <span className="font-mono normal-case text-ink-muted">
              {PLACEHOLDERS.join(" ")}
            </span>
          </p>

          <div className="mt-4">
            <ModeloPropostaEditor key={modeloAtivo.id} modelo={modeloAtivo} />
          </div>
        </section>
      ) : (
        <p className="mt-6 text-sm text-ink-muted">
          Nenhum modelo de proposta cadastrado ainda — cadastre um regime em
          Regimes tributários para criar um automaticamente.
        </p>
      )}
    </main>
  );
}
