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
      <h1 className="text-2xl font-semibold text-neutral-900">Modelos de proposta</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Selecione o regime para editar o rascunho padrão. Toda nova proposta
        criada para um cliente daquele regime nasce a partir deste texto, e
        pode ser adaptada livremente depois, por cliente.
      </p>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-neutral-200">
        {modelos.map((modelo) => (
          <Link
            key={modelo.slug}
            href={`/admin/propostas?modelo=${modelo.slug}`}
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

      {modeloAtivo ? (
        <section className="mt-6">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Variáveis disponíveis:{" "}
            <span className="font-mono normal-case text-neutral-600">
              {PLACEHOLDERS.join(" ")}
            </span>
          </p>

          <div className="mt-4">
            <ModeloPropostaEditor modelo={modeloAtivo} />
          </div>
        </section>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">
          Nenhum modelo de proposta cadastrado ainda — cadastre um regime em
          Regimes tributários para criar um automaticamente.
        </p>
      )}
    </main>
  );
}
