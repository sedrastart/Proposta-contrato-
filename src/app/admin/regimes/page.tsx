import { prisma } from "@/lib/prisma";
import { criarRegimeAction } from "./actions";
import { LinhaRegime } from "./linha-regime";

export const dynamic = "force-dynamic";

export default async function AdminRegimesPage() {
  const regimes = await prisma.regimeTributario.findMany({
    orderBy: { ordem: "asc" },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900">Regimes tributários</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Decidem qual família de contrato carrega e qual catálogo de serviços
        aparece no assistente. O regime de slug <code>mei</code> é tratado
        como especial pelo motor de documentos — os demais usam o modelo geral.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Ordem</th>
              <th className="px-4 py-2 font-medium">Nome</th>
              <th className="px-4 py-2 font-medium">Slug</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {regimes.map((regime) => (
              <LinhaRegime key={regime.id} regime={regime} />
            ))}
          </tbody>
        </table>
      </div>

      <form action={criarRegimeAction} className="mt-6 flex gap-3">
        <input
          name="nome"
          placeholder="Nome do novo regime"
          required
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Novo regime
        </button>
      </form>
    </main>
  );
}
