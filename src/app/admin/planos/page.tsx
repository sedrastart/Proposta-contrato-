import { prisma } from "@/lib/prisma";
import { criarPlanoAction } from "./actions";
import { PlanosLista } from "./planos-lista";

export const dynamic = "force-dynamic";

const inputClass = "rounded-md border border-line bg-white px-2 py-1.5 text-sm";

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
      <h1 className="text-2xl font-semibold text-ink">Planos</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Valor, vigência, multa, condição de pagamento e limites de uso com
        faixas de excedente — os dados que alimentam as cláusulas dinâmicas
        de cada um dos 6 modelos de contrato e proposta.
      </p>

      <div className="mt-6">
        <PlanosLista planos={planos} ordemRegimes={regimes.map((r) => r.nome)} />
      </div>

      <div className="mt-6 rounded-lg border border-line bg-white p-4">
        <p className="text-sm font-medium text-ink">Novo plano</p>
        <p className="mt-0.5 text-xs text-ink-muted">
          Vincule a um serviço (e, se for o caso, a um regime específico) —
          valor, vigência, multa e condição de pagamento entram
          automaticamente no contrato gerado com este plano.
        </p>

        <form action={criarPlanoAction} className="mt-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-ink-muted">
              Serviço
              <select
                name="servicoId"
                required
                className={`${inputClass} mt-0.5 w-full`}
                title="Qual serviço esse plano se aplica (ex.: Contabilidade, Departamento Pessoal)"
              >
                <option value="">Selecione...</option>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-ink-muted">
              Regime
              <select
                name="regimeTributarioId"
                className={`${inputClass} mt-0.5 w-full`}
                title="Deixe em branco se o plano vale para qualquer regime do serviço, ou escolha um regime específico (ex.: MEI) se este plano for exclusivo dele"
              >
                <option value="">Qualquer regime do serviço</option>
                {regimes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="col-span-2 text-xs text-ink-muted">
              Nome do plano
              <input
                name="nome"
                placeholder='ex.: "Contabilidade — 12 meses"'
                required
                className={`${inputClass} mt-0.5 w-full`}
                title="Nome do plano, como aparece para o cliente (ex.: 'Plano Essencial')"
              />
            </label>
            <label className="text-xs text-ink-muted">
              Valor mensal (R$)
              <input
                name="valor"
                type="number"
                step="0.01"
                placeholder="ex.: 199,90"
                required
                className={`${inputClass} mt-0.5 w-full`}
                title="Valor mensal cobrado do cliente nesse plano"
              />
            </label>
            <label className="text-xs text-ink-muted">
              Vigência (meses)
              <input
                name="vigenciaMeses"
                type="number"
                placeholder="ex.: 12"
                required
                className={`${inputClass} mt-0.5 w-full`}
                title="Duração do contrato em meses (ex.: 12 = um ano)"
              />
            </label>
            <label className="text-xs text-ink-muted">
              Multa (%) — opcional
              <input
                name="multaPercentual"
                type="number"
                step="0.01"
                placeholder="ex.: 50"
                className={`${inputClass} mt-0.5 w-full`}
                title="Percentual de multa cobrado se o cliente quebrar o contrato antes do fim da vigência (opcional)"
              />
            </label>
            <label className="text-xs text-ink-muted">
              Texto da multa
              <input
                name="multaDescricao"
                placeholder='ex.: "50% do saldo restante"'
                className={`${inputClass} mt-0.5 w-full`}
                title="Como a multa aparece escrita no contrato"
              />
            </label>
            <label className="text-xs text-ink-muted">
              Condição de pagamento
              <select
                name="condicaoPagamento"
                defaultValue="a_vista"
                className={`${inputClass} mt-0.5 w-full`}
                title="Se o pagamento desse plano é à vista ou dividido em parcelas — vira o padrão sugerido ao gerar o contrato"
              >
                <option value="a_vista">à vista</option>
                <option value="parcelado">parcelado</option>
              </select>
            </label>
            <label className="text-xs text-ink-muted">
              Número de parcelas
              <input
                name="parcelas"
                type="number"
                min={1}
                defaultValue={1}
                className={`${inputClass} mt-0.5 w-full`}
                title="Em quantas vezes o pagamento é dividido (só usado se a condição for 'parcelado')"
              />
            </label>
            <label className="col-span-2 text-xs text-ink-muted">
              Escopo para a proposta (opcional)
              <textarea
                name="escopoProposta"
                rows={2}
                placeholder='ex.: "emissão e acompanhamento de notas fiscais, além da elaboração e entrega de declarações acessórias"'
                className={`${inputClass} mt-0.5 w-full`}
                title="Aparece só na proposta comercial, ao lado do nome do serviço — as cláusulas do contrato são escritas à parte, em Contratos"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          >
            + Criar plano
          </button>
        </form>
      </div>
    </main>
  );
}
