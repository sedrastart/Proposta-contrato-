import { prisma } from "@/lib/prisma";
import { criarPlanoAction } from "./actions";
import { PlanosLista } from "./planos-lista";

export const dynamic = "force-dynamic";

export default async function AdminPlanosPage() {
  const [servicos, regimes, planos] = await Promise.all([
    prisma.servico.findMany({ where: { ativo: true }, orderBy: { ordem: "asc" } }),
    prisma.regimeTributario.findMany({ where: { ativo: true }, orderBy: { ordem: "asc" } }),
    prisma.plano.findMany({
      orderBy: [{ servicoId: "asc" }, { ordem: "asc" }],
      include: {
        servico: true,
        regimeTributario: true,
        limites: { include: { faixas: { orderBy: { ordem: "asc" } } } },
      },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900">Planos</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Valor, vigência, multa e limites de uso com faixas de excedente —
        exatamente o que os dois contratos reais (MEI e geral) usam para
        montar as cláusulas dinâmicas.
      </p>

      <div className="mt-6">
        <PlanosLista planos={planos} ordemRegimes={regimes.map((r) => r.nome)} />
      </div>

      <form
        action={criarPlanoAction}
        className="mt-6 rounded-lg border border-dashed border-neutral-300 p-5"
      >
        <p className="mb-3 text-sm font-medium text-neutral-900">Novo plano</p>
        <div className="grid grid-cols-2 gap-3">
          <select
            name="servicoId"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            title="Qual serviço esse plano se aplica (ex.: Contabilidade, Departamento Pessoal)"
          >
            <option value="">Serviço...</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
          <select
            name="regimeTributarioId"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            title="Deixe em branco se o plano vale para qualquer regime do serviço, ou escolha um regime específico (ex.: MEI) se este plano for exclusivo dele"
          >
            <option value="">Qualquer regime do serviço</option>
            {regimes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
              </option>
            ))}
          </select>
          <input
            name="nome"
            placeholder="Nome do plano"
            required
            className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            title="Nome do plano, como aparece para o cliente (ex.: 'Plano Essencial')"
          />
          <input
            name="valor"
            type="number"
            step="0.01"
            placeholder="Valor mensal (R$)"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            title="Valor mensal cobrado do cliente nesse plano"
          />
          <input
            name="vigenciaMeses"
            type="number"
            placeholder="Vigência (meses)"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            title="Duração do contrato em meses (ex.: 12 = um ano)"
          />
          <input
            name="multaPercentual"
            type="number"
            step="0.01"
            placeholder="Multa (%) — opcional"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            title="Percentual de multa cobrado se o cliente quebrar o contrato antes do fim da vigência (opcional)"
          />
          <input
            name="multaDescricao"
            placeholder='Texto da multa (ex.: "50% do saldo restante")'
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            title="Como a multa aparece escrita no contrato"
          />
          <select
            name="condicaoPagamento"
            defaultValue="a_vista"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            title="Se o pagamento desse plano é à vista ou dividido em parcelas — vira o padrão sugerido ao gerar o contrato"
          >
            <option value="a_vista">à vista</option>
            <option value="parcelado">parcelado</option>
          </select>
          <input
            name="parcelas"
            type="number"
            min={1}
            defaultValue={1}
            placeholder="Número de parcelas"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            title="Em quantas vezes o pagamento é dividido (só usado se a condição for 'parcelado')"
          />
        </div>
        <button
          type="submit"
          className="mt-4 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Criar plano
        </button>
      </form>
    </main>
  );
}
