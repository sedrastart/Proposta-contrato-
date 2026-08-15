import { prisma } from "@/lib/prisma";
import { criarServicoAction } from "./actions";
import { ServicosLista } from "./servicos-lista";

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
      <h1 className="text-2xl font-semibold text-ink">Serviços</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Catálogo de serviços e em quais regimes cada um aparece na etapa 3
        do assistente.
      </p>

      <div className="mt-6">
        <ServicosLista servicos={servicos} regimesDisponiveis={regimes} />
      </div>

      <form
        action={criarServicoAction}
        className="mt-6 rounded-lg border border-dashed border-line p-5"
      >
        <p className="mb-3 text-sm font-medium text-ink">Novo serviço</p>
        <input
          name="nome"
          placeholder="Nome do serviço"
          required
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
          title="Nome do serviço, como aparece no catálogo do assistente (ex.: 'Departamento Pessoal')"
        />
        <div
          className="mt-3 flex flex-wrap gap-3"
          title="Em quais regimes esse serviço aparece na etapa 3 do assistente — marque todos que se aplicam"
        >
          {regimes.map((regime) => (
            <label key={regime.id} className="flex items-center gap-1.5 text-sm text-ink">
              <input type="checkbox" name="regimeIds" value={regime.id} />
              {regime.nome}
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          + Criar serviço
        </button>
      </form>
    </main>
  );
}
