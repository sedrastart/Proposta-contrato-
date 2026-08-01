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

export default async function AdminContratosPage() {
  const modelos = await prisma.modeloContrato.findMany({
    include: { clausulas: { orderBy: { ordem: "asc" } } },
    orderBy: { slug: "asc" },
  });

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900">Modelos de contrato</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Edite o texto das cláusulas e anexos usados na geração dos contratos.
        O cabeçalho (identificação das partes) e o bloco de assinatura não
        são editáveis aqui. Cláusulas desativadas somem do documento, mas
        contratos já emitidos não são afetados.
      </p>

      {modelos.map((modelo) => (
        <section key={modelo.id} className="mt-10">
          <h2 className="text-lg font-semibold text-neutral-900">{modelo.nome}</h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
            Variáveis disponíveis:{" "}
            <span className="font-mono normal-case text-neutral-600">
              {(PLACEHOLDERS_POR_SLUG[modelo.slug] ?? []).join(" ")}
            </span>
          </p>

          <div className="mt-4 space-y-4">
            {modelo.clausulas.map((clausula) => (
              <ClausulaEditor key={clausula.id} clausula={clausula} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
