"use client";

import { useState, useTransition } from "react";
import { currency } from "@/lib/format";
import {
  atualizarPlanoAction,
  alternarAtivoPlanoAction,
  excluirPlanoAction,
  criarLimiteAction,
  removerLimiteAction,
  atualizarLimiteAction,
  criarFaixaAction,
  removerFaixaAction,
  atualizarFaixaAction,
} from "./actions";

type Faixa = { id: string; percentualAte: number; valorAdicional: number };
type Limite = {
  id: string;
  unidade: string;
  quantidade: number;
  tipoCobranca: string;
  valorPorUnidade: number | null;
  faixas: Faixa[];
};
type Plano = {
  id: string;
  nome: string;
  valor: number;
  vigenciaMeses: number;
  multaPercentual: number | null;
  multaDescricao: string | null;
  condicaoPagamento: string;
  parcelas: number;
  escopoProposta: string | null;
  ativo: boolean;
  servico: { nome: string };
  regimeTributario: { nome: string } | null;
  limites: Limite[];
};

const inputClass = "rounded-md border border-line px-2 py-1 text-sm";

export function PlanoCard({ plano }: { plano: Plano }) {
  const [campos, setCampos] = useState({
    nome: plano.nome,
    valor: plano.valor,
    vigenciaMeses: plano.vigenciaMeses,
    multaPercentual: plano.multaPercentual ?? "",
    multaDescricao: plano.multaDescricao ?? "",
    condicaoPagamento: plano.condicaoPagamento,
    parcelas: plano.parcelas,
    escopoProposta: plano.escopoProposta ?? "",
  });
  const [isPending, startTransition] = useTransition();
  const [expandido, setExpandido] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);
  const [mostrarNovoLimite, setMostrarNovoLimite] = useState(false);
  const [novoLimite, setNovoLimite] = useState({
    unidade: "",
    quantidade: "",
    tipoCobranca: "por_unidade" as "por_unidade" | "faixa",
    valorPorUnidade: "",
  });

  function excluir() {
    if (!confirm(`Excluir o plano "${plano.nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setErroExcluir(null);
    startTransition(async () => {
      const resultado = await excluirPlanoAction(plano.id);
      if (!resultado.sucesso) setErroExcluir(resultado.erro);
    });
  }

  function salvar() {
    startTransition(() => {
      atualizarPlanoAction(plano.id, {
        nome: campos.nome,
        valor: Number(campos.valor),
        vigenciaMeses: Number(campos.vigenciaMeses),
        multaPercentual: campos.multaPercentual === "" ? null : Number(campos.multaPercentual),
        multaDescricao: campos.multaDescricao,
        condicaoPagamento: campos.condicaoPagamento,
        parcelas: Number(campos.parcelas) || 1,
        escopoProposta: campos.escopoProposta.trim() || null,
      });
    });
  }

  function alternarAtivo() {
    startTransition(() => {
      alternarAtivoPlanoAction(plano.id, !plano.ativo);
    });
  }

  function adicionarLimite() {
    if (!novoLimite.unidade || !novoLimite.quantidade) return;
    startTransition(() => {
      criarLimiteAction(plano.id, {
        unidade: novoLimite.unidade,
        quantidade: Number(novoLimite.quantidade),
        tipoCobranca: novoLimite.tipoCobranca,
        valorPorUnidade:
          novoLimite.tipoCobranca === "por_unidade"
            ? Number(novoLimite.valorPorUnidade || 0)
            : undefined,
      });
      setNovoLimite({ unidade: "", quantidade: "", tipoCobranca: "por_unidade", valorPorUnidade: "" });
      setMostrarNovoLimite(false);
    });
  }

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        expandido ? "border-accent bg-accent-soft" : "border-line"
      }`}
    >
      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
        title={expandido ? "Recolher plano" : "Expandir para editar este plano"}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{plano.nome}</p>
          <p className="text-xs text-ink-muted">
            {plano.servico.nome} · {plano.regimeTributario?.nome ?? "qualquer regime do serviço"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="tabular-nums text-sm text-ink">{currency.format(plano.valor)}/mês</span>
          <span className="hidden text-xs text-ink-muted sm:inline">
            {plano.vigenciaMeses > 0 ? `${plano.vigenciaMeses} meses` : "sem vigência fixa"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              plano.ativo ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-ink-muted"
            }`}
          >
            {plano.ativo ? "ativo" : "inativo"}
          </span>
          <span className="text-ink-muted">{expandido ? "▲" : "▼"}</span>
        </div>
      </button>

      {expandido && (
        <>
          <div className="mt-3 flex items-center justify-end gap-3 border-t border-dashed border-line pt-3">
            <button
              type="button"
              onClick={alternarAtivo}
              disabled={isPending}
              className="text-sm text-ink-muted hover:underline disabled:opacity-50"
            >
              {plano.ativo ? "desativar" : "ativar"}
            </button>
            <button
              type="button"
              onClick={excluir}
              disabled={isPending}
              className="text-sm text-red-600 hover:underline disabled:opacity-50"
              title="Apaga este plano definitivamente"
            >
              excluir
            </button>
          </div>
          {erroExcluir && <p className="mt-1 text-xs text-red-600">{erroExcluir}</p>}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <input
          className={`${inputClass} col-span-2 font-medium`}
          value={campos.nome}
          onChange={(e) => setCampos({ ...campos, nome: e.target.value })}
          onBlur={salvar}
          title="Nome do plano, como aparece para o cliente (ex.: 'Plano Essencial')"
        />
        <label className="text-xs text-ink-muted">
          Valor (R$)
          <input
            type="number"
            step="0.01"
            className={`${inputClass} mt-0.5 w-full`}
            value={campos.valor}
            onChange={(e) => setCampos({ ...campos, valor: Number(e.target.value) })}
            onBlur={salvar}
            title="Valor mensal cobrado do cliente nesse plano"
          />
        </label>
        <label className="text-xs text-ink-muted">
          Vigência (meses)
          <input
            type="number"
            className={`${inputClass} mt-0.5 w-full`}
            value={campos.vigenciaMeses}
            onChange={(e) => setCampos({ ...campos, vigenciaMeses: Number(e.target.value) })}
            onBlur={salvar}
            title="Duração do contrato em meses (ex.: 12 = um ano)"
          />
        </label>
        <label className="text-xs text-ink-muted">
          Multa (%)
          <input
            type="number"
            step="0.01"
            className={`${inputClass} mt-0.5 w-full`}
            value={campos.multaPercentual}
            onChange={(e) => setCampos({ ...campos, multaPercentual: e.target.value })}
            onBlur={salvar}
            title="Percentual de multa cobrado se o cliente quebrar o contrato antes do fim da vigência (opcional)"
          />
        </label>
        <label className="text-xs text-ink-muted">
          Texto da multa
          <input
            className={`${inputClass} mt-0.5 w-full`}
            value={campos.multaDescricao}
            onChange={(e) => setCampos({ ...campos, multaDescricao: e.target.value })}
            onBlur={salvar}
            title="Como a multa aparece escrita no contrato (ex.: '50% do saldo restante')"
          />
        </label>
        <label className="text-xs text-ink-muted">
          Condição de pagamento
          <select
            className={`${inputClass} mt-0.5 w-full`}
            value={campos.condicaoPagamento}
            title="Se o pagamento desse plano é à vista ou dividido em parcelas — vira o padrão sugerido ao gerar o contrato (o usuário ainda pode trocar por cliente)"
            onChange={(e) => {
              const condicaoPagamento = e.target.value;
              setCampos({ ...campos, condicaoPagamento });
              startTransition(() => {
                atualizarPlanoAction(plano.id, {
                  nome: campos.nome,
                  valor: Number(campos.valor),
                  vigenciaMeses: Number(campos.vigenciaMeses),
                  multaPercentual: campos.multaPercentual === "" ? null : Number(campos.multaPercentual),
                  multaDescricao: campos.multaDescricao,
                  condicaoPagamento,
                  parcelas: Number(campos.parcelas) || 1,
                });
              });
            }}
          >
            <option value="a_vista">à vista</option>
            <option value="parcelado">parcelado</option>
          </select>
        </label>
        {campos.condicaoPagamento === "parcelado" && (
          <label className="text-xs text-ink-muted">
            Número de parcelas
            <input
              type="number"
              min={1}
              className={`${inputClass} mt-0.5 w-full`}
              value={campos.parcelas}
              onChange={(e) => setCampos({ ...campos, parcelas: Number(e.target.value) })}
              onBlur={salvar}
              title="Em quantas vezes o pagamento é dividido (ex.: 3 = parcelado em 3x)"
            />
          </label>
        )}
        <label className="col-span-2 text-xs text-ink-muted">
          Escopo para a proposta (opcional)
          <textarea
            rows={2}
            className={`${inputClass} mt-0.5 w-full`}
            placeholder='ex.: "emissão e acompanhamento de notas fiscais, além da elaboração e entrega de declarações acessórias"'
            value={campos.escopoProposta}
            onChange={(e) => setCampos({ ...campos, escopoProposta: e.target.value })}
            onBlur={salvar}
            title="Aparece só na proposta comercial, ao lado do nome do serviço — as cláusulas do contrato são escritas à parte, em Contratos"
          />
        </label>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-white p-4">
        <p className="text-sm font-medium text-ink">Limites de uso</p>
        <p className="mt-0.5 text-xs text-ink-muted">
          Quanto o cliente já tem incluído no plano por mês (ex.: lançamentos,
          notas fiscais, colaboradores) e quanto cobrar a mais pelo que passar
          disso.
        </p>

        {plano.limites.length > 0 && (
          <div className="mt-3 space-y-2">
            {plano.limites.map((limite) => (
              <LimiteRow key={limite.id} limite={limite} />
            ))}
          </div>
        )}

        {plano.limites.length === 0 && !mostrarNovoLimite && (
          <p className="mt-3 text-xs text-ink-muted">
            Nenhum limite configurado — o plano vale para uso ilimitado desses itens.
          </p>
        )}

        {!mostrarNovoLimite ? (
          <button
            type="button"
            onClick={() => setMostrarNovoLimite(true)}
            className="mt-3 rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:bg-neutral-50"
            title="Adiciona um novo limite de uso a este plano"
          >
            + Adicionar limite de uso
          </button>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-accent bg-accent-soft p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Novo limite de uso
              </p>
              <button
                type="button"
                onClick={() => setMostrarNovoLimite(false)}
                className="text-xs text-ink-muted hover:underline"
              >
                cancelar
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-xs text-ink-muted">
                O que limitar
                <input
                  placeholder="ex.: lançamentos, notas fiscais"
                  value={novoLimite.unidade}
                  onChange={(e) => setNovoLimite({ ...novoLimite, unidade: e.target.value })}
                  className={`${inputClass} mt-0.5 w-full bg-white`}
                  title="Nome da unidade que será contada e cobrada por excedente (ex.: 'lançamentos', 'notas fiscais', 'colaboradores')"
                />
              </label>
              <label className="text-xs text-ink-muted">
                Incluídos por mês
                <input
                  type="number"
                  placeholder="ex.: 50"
                  value={novoLimite.quantidade}
                  onChange={(e) => setNovoLimite({ ...novoLimite, quantidade: e.target.value })}
                  className={`${inputClass} mt-0.5 w-full bg-white`}
                  title="Quantidade já incluída no valor mensal do plano — o que passar disso é cobrado à parte"
                />
              </label>
            </div>

            <p className="mt-3 text-xs text-ink-muted">Como cobrar o que passar disso?</p>
            <div className="mt-1 inline-flex overflow-hidden rounded-md border border-line">
              <button
                type="button"
                onClick={() => setNovoLimite({ ...novoLimite, tipoCobranca: "por_unidade" })}
                className={`px-3 py-1.5 text-xs font-medium ${
                  novoLimite.tipoCobranca === "por_unidade"
                    ? "bg-accent text-white"
                    : "bg-white text-ink-muted hover:bg-neutral-50"
                }`}
                title="Cada unidade que exceder o incluído custa um valor fixo"
              >
                Valor fixo por unidade
              </button>
              <button
                type="button"
                onClick={() => setNovoLimite({ ...novoLimite, tipoCobranca: "faixa" })}
                className={`border-l border-line px-3 py-1.5 text-xs font-medium ${
                  novoLimite.tipoCobranca === "faixa"
                    ? "bg-accent text-white"
                    : "bg-white text-ink-muted hover:bg-neutral-50"
                }`}
                title="O excedente é cobrado em degraus, conforme o % acima do incluído (ex.: até 33% = R$9,90, até 66% = R$19,90)"
              >
                Faixas por % de excedente
              </button>
            </div>

            {novoLimite.tipoCobranca === "por_unidade" && (
              <label className="mt-3 block text-xs text-ink-muted">
                Valor do excedente (R$ por unidade)
                <input
                  type="number"
                  step="0.01"
                  placeholder="ex.: 9,90"
                  value={novoLimite.valorPorUnidade}
                  onChange={(e) => setNovoLimite({ ...novoLimite, valorPorUnidade: e.target.value })}
                  className={`${inputClass} mt-0.5 w-full bg-white`}
                  title="Valor cobrado para cada unidade que passar da quantidade incluída"
                />
              </label>
            )}

            {novoLimite.unidade.trim() && novoLimite.quantidade && (
              <p className="mt-3 rounded-md bg-white px-3 py-2 text-xs text-ink">
                {resumoNovoLimite(novoLimite)}
              </p>
            )}

            <button
              type="button"
              onClick={adicionarLimite}
              disabled={!novoLimite.unidade.trim() || !novoLimite.quantidade}
              className="mt-3 w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
              title="Adiciona este limite de uso ao plano"
            >
              + Adicionar limite
            </button>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}

function resumoNovoLimite(novoLimite: {
  unidade: string;
  quantidade: string;
  tipoCobranca: "por_unidade" | "faixa";
  valorPorUnidade: string;
}): string {
  const base = `Inclui até ${novoLimite.quantidade} ${novoLimite.unidade}/mês no plano.`;
  if (novoLimite.tipoCobranca === "por_unidade") {
    const valor = novoLimite.valorPorUnidade || "0,00";
    return `${base} Cada unidade de ${novoLimite.unidade} acima disso custa R$ ${valor}.`;
  }
  return `${base} O que passar disso é cobrado em faixas por % de excedente — defina as faixas depois de adicionar.`;
}

function LimiteRow({ limite }: { limite: Limite }) {
  const [quantidade, setQuantidade] = useState(limite.quantidade);
  const [valorPorUnidade, setValorPorUnidade] = useState(limite.valorPorUnidade ?? 0);
  const [novaFaixa, setNovaFaixa] = useState({ percentualAte: "", valorAdicional: "" });
  const [, startTransition] = useTransition();

  function salvar() {
    startTransition(() => {
      atualizarLimiteAction(limite.id, {
        quantidade,
        ...(limite.tipoCobranca === "por_unidade" ? { valorPorUnidade } : {}),
      });
    });
  }

  function remover() {
    startTransition(() => {
      removerLimiteAction(limite.id);
    });
  }

  function adicionarFaixa() {
    if (!novaFaixa.percentualAte || !novaFaixa.valorAdicional) return;
    startTransition(() => {
      criarFaixaAction(limite.id, {
        percentualAte: Number(novaFaixa.percentualAte),
        valorAdicional: Number(novaFaixa.valorAdicional),
      });
      setNovaFaixa({ percentualAte: "", valorAdicional: "" });
    });
  }

  const resumo =
    limite.tipoCobranca === "por_unidade"
      ? `Inclui ${quantidade} ${limite.unidade}/mês. Acima disso, R$ ${valorPorUnidade.toFixed(2).replace(".", ",")} por unidade excedente.`
      : `Inclui ${quantidade} ${limite.unidade}/mês. O excedente é cobrado em faixas por % acima do incluído.`;

  return (
    <div className="rounded-lg border border-line bg-neutral-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium capitalize text-ink">{limite.unidade}</p>
        <button
          type="button"
          onClick={remover}
          className="text-xs text-red-600 hover:underline"
          title="Remove este limite de uso do plano"
        >
          remover
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3">
        <label className="text-xs text-ink-muted">
          Incluídos por mês
          <input
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            onBlur={salvar}
            className={`${inputClass} mt-0.5 w-full bg-white`}
            title="Quantidade incluída no plano por mês"
          />
        </label>
        {limite.tipoCobranca === "por_unidade" ? (
          <label className="text-xs text-ink-muted">
            Valor do excedente (R$)
            <input
              type="number"
              step="0.01"
              value={valorPorUnidade}
              onChange={(e) => setValorPorUnidade(Number(e.target.value))}
              onBlur={salvar}
              className={`${inputClass} mt-0.5 w-full bg-white`}
              title="Valor cobrado para cada unidade que passar da quantidade incluída"
            />
          </label>
        ) : (
          <div className="text-xs text-ink-muted">
            Cobrança
            <p className="mt-0.5 rounded-md border border-line bg-white px-2 py-1.5 text-ink">
              por faixas de %
            </p>
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-ink-muted">{resumo}</p>

      {limite.tipoCobranca === "faixa" && (
        <div className="mt-3 space-y-1 border-t border-dashed border-line pt-2 pl-1">
          {limite.faixas.map((faixa) => (
            <FaixaRow key={faixa.id} faixa={faixa} />
          ))}
          <div className="flex items-end gap-2">
            <label className="text-xs text-ink-muted">
              Até % de excedente
              <input
                type="number"
                placeholder="ex.: 33"
                value={novaFaixa.percentualAte}
                onChange={(e) => setNovaFaixa({ ...novaFaixa, percentualAte: e.target.value })}
                className={`${inputClass} mt-0.5 w-32 bg-white`}
                title="Até quantos % de excedente essa faixa vale (ex.: 33 = até 33% acima da quantidade incluída)"
              />
            </label>
            <label className="text-xs text-ink-muted">
              Valor da faixa (R$)
              <input
                type="number"
                step="0.01"
                placeholder="ex.: 9,90"
                value={novaFaixa.valorAdicional}
                onChange={(e) => setNovaFaixa({ ...novaFaixa, valorAdicional: e.target.value })}
                className={`${inputClass} mt-0.5 w-24 bg-white`}
                title="Valor extra cobrado quando o excedente cai dentro dessa faixa"
              />
            </label>
            <button
              type="button"
              onClick={adicionarFaixa}
              className="text-xs text-ink-muted hover:underline"
              title="Adiciona esta faixa de excedente ao limite"
            >
              + faixa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FaixaRow({ faixa }: { faixa: Faixa }) {
  const [percentualAte, setPercentualAte] = useState(faixa.percentualAte);
  const [valorAdicional, setValorAdicional] = useState(faixa.valorAdicional);
  const [, startTransition] = useTransition();

  function salvar() {
    startTransition(() => {
      atualizarFaixaAction(faixa.id, { percentualAte, valorAdicional });
    });
  }

  function remover() {
    startTransition(() => {
      removerFaixaAction(faixa.id);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-muted">Até</span>
      <input
        type="number"
        value={percentualAte}
        onChange={(e) => setPercentualAte(Number(e.target.value))}
        onBlur={salvar}
        className={`${inputClass} w-20`}
        title="Até quantos % de excedente essa faixa vale"
      />
      <span className="text-xs text-ink-muted">% de excedente → R$</span>
      <input
        type="number"
        step="0.01"
        value={valorAdicional}
        onChange={(e) => setValorAdicional(Number(e.target.value))}
        onBlur={salvar}
        className={`${inputClass} w-24`}
        title="Valor extra cobrado quando o excedente cai dentro dessa faixa"
      />
      <span className="text-xs text-ink-muted">extra</span>
      <button
        type="button"
        onClick={remover}
        className="ml-auto text-xs text-red-600 hover:underline"
        title="Remove esta faixa"
      >
        remover
      </button>
    </div>
  );
}
