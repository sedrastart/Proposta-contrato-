import { prisma } from "@/lib/prisma";
import { criarServicoAction } from "./actions";
import { LinhaServico } from "./linha-servico";

export const dynamic = "force-dynamic";

export default async function AdminServicosPage() {
  const [servicos, regimes] = await Promise.all([
    prisma.servico.findMany({
      orderBy: { ordem: "asc" },
      include: { regimes: true },
    }),
    prisma.regimeTributario.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900">Serviços</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Catálogo de serviços e em quais regimes cada um aparece na etapa 3
        do assistente.
      </p>

      <div className="mt-6 space-y-3">
        {servicos.map((servico) => (
          <LinhaServico
            key={servico.id}
            servico={servico}
            regimeIdsAtuais={servico.regimes.map((r) => r.regimeTributarioId)}
            regimesDisponiveis={regimes}
          />
        ))}
      </div>

      <form
        action={criarServicoAction}
        className="mt-6 rounded-lg border border-dashed border-neutral-300 p-5"
      >
        <p className="mb-3 text-sm font-medium text-neutral-900">Novo serviço</p>
        <input
          name="nome"
          placeholder="Nome do serviço"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <div className="mt-3 flex flex-wrap gap-3">
          {regimes.map((regime) => (
            <label key={regime.id} className="flex items-center gap-1.5 text-sm text-neutral-700">
              <input type="checkbox" name="regimeIds" value={regime.id} />
              {regime.nome}
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="mt-4 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Criar serviço
        </button>
      </form>
    </main>
  );
}
