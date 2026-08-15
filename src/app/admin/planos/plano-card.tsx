"use client";

import { useState, useTransition } from "react";
import {
  atualizarPlanoAction,
  alternarAtivoPlanoAction,
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
  });
  const [isPending, startTransition] = useTransition();
  const [novoLimite, setNovoLimite] = useState({
    unidade: "",
    quantidade: "",
    tipoCobranca: "por_unidade" as "por_unidade" | "faixa",
    valorPorUnidade: "",
  });

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
    });
  }

  return (
    <div className="rounded-lg border border-line p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-ink-muted">
          {plano.servico.nome} · {plano.regimeTributario?.nome ?? "qualquer regime do serviço"}
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              plano.ativo ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-ink-muted"
            }`}
          >
            {plano.ativo ? "ativo" : "inativo"}
          </span>
          <button
            type="button"
            onClick={alternarAtivo}
            disabled={isPending}
            className="text-sm text-ink-muted hover:underline disabled:opacity-50"
          >
            {plano.ativo ? "desativar" : "ativar"}
          </button>
        </div>
      </div>

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
      </div>

      {plano.limites.length > 0 && (
        <div
          className="mt-4 space-y-2"
          title="Quantidade incluída no plano por mês e como cobrar o que passar disso"
        >
          <p className="text-xs uppercase tracking-wide text-ink-muted">Limites de uso</p>
          {plano.limites.map((limite) => (
            <LimiteRow key={limite.id} limite={limite} />
          ))}
        </div>
      )}

      <div className="mt-3 flex items-end gap-2 border-t border-dashed border-line pt-3">
        <input
          placeholder="unidade (ex.: lançamentos)"
          value={novoLimite.unidade}
          onChange={(e) => setNovoLimite({ ...novoLimite, unidade: e.target.value })}
          className={`${inputClass} w-40`}
          title="O que você quer limitar/cobrar por excedente (ex.: 'lançamentos', 'notas fiscais', 'colaboradores')"
        />
        <input
          type="number"
          placeholder="qtd/mês"
          value={novoLimite.quantidade}
          onChange={(e) => setNovoLimite({ ...novoLimite, quantidade: e.target.value })}
          className={`${inputClass} w-24`}
          title="Quantidade já incluída no valor mensal do plano — o que passar disso é cobrado à parte"
        />
        <select
          value={novoLimite.tipoCobranca}
          onChange={(e) =>
            setNovoLimite({ ...novoLimite, tipoCobranca: e.target.value as "por_unidade" | "faixa" })
          }
          className={inputClass}
          title="Como cobrar o que passar da quantidade incluída: valor fixo por unidade extra, ou faixas por % de excedente"
        >
          <option value="por_unidade">por unidade</option>
          <option value="faixa">faixas (%)</option>
        </select>
        {novoLimite.tipoCobranca === "por_unidade" && (
          <input
            type="number"
            step="0.01"
            placeholder="R$/unidade"
            value={novoLimite.valorPorUnidade}
            onChange={(e) => setNovoLimite({ ...novoLimite, valorPorUnidade: e.target.value })}
            className={`${inputClass} w-28`}
            title="Valor cobrado para cada unidade que passar da quantidade incluída"
          />
        )}
        <button
          type="button"
          onClick={adicionarLimite}
          className="rounded-md border border-line px-3 py-1 text-sm text-ink hover:bg-neutral-50"
          title="Adiciona este limite de uso ao plano"
        >
          + limite
        </button>
      </div>
    </div>
  );
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

  return (
    <div className="rounded-md bg-neutral-50 p-3">
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
          onBlur={salvar}
          className={`${inputClass} w-20`}
          title="Quantidade incluída no plano por mês"
        />
        <span className="text-sm text-ink-muted">{limite.unidade}/mês —</span>
        {limite.tipoCobranca === "por_unidade" ? (
          <>
            <input
              type="number"
              step="0.01"
              value={valorPorUnidade}
              onChange={(e) => setValorPorUnidade(Number(e.target.value))}
              onBlur={salvar}
              className={`${inputClass} w-24`}
              title="Valor cobrado para cada unidade que passar da quantidade incluída"
            />
            <span className="text-sm text-ink-muted">por unidade excedente</span>
          </>
        ) : (
          <span className="text-sm text-ink-muted">faixas por % de excedente</span>
        )}
        <button
          type="button"
          onClick={remover}
          className="ml-auto text-xs text-red-600 hover:underline"
          title="Remove este limite de uso do plano"
        >
          remover limite
        </button>
      </div>

      {limite.tipoCobranca === "faixa" && (
        <div className="mt-2 space-y-1 pl-4">
          {limite.faixas.map((faixa) => (
            <FaixaRow key={faixa.id} faixa={faixa} />
          ))}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="até % de excedente"
              value={novaFaixa.percentualAte}
              onChange={(e) => setNovaFaixa({ ...novaFaixa, percentualAte: e.target.value })}
              className={`${inputClass} w-32`}
              title="Até quantos % de excedente essa faixa vale (ex.: 33 = até 33% acima da quantidade incluída)"
            />
            <input
              type="number"
              step="0.01"
              placeholder="valor R$"
              value={novaFaixa.valorAdicional}
              onChange={(e) => setNovaFaixa({ ...novaFaixa, valorAdicional: e.target.value })}
              className={`${inputClass} w-24`}
              title="Valor extra cobrado quando o excedente cai dentro dessa faixa"
            />
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
      <span className="text-xs text-ink-muted">até</span>
      <input
        type="number"
        value={percentualAte}
        onChange={(e) => setPercentualAte(Number(e.target.value))}
        onBlur={salvar}
        className={`${inputClass} w-20`}
        title="Até quantos % de excedente essa faixa vale"
      />
      <span className="text-xs text-ink-muted">% =</span>
      <input
        type="number"
        step="0.01"
        value={valorAdicional}
        onChange={(e) => setValorAdicional(Number(e.target.value))}
        onBlur={salvar}
        className={`${inputClass} w-24`}
        title="Valor extra cobrado quando o excedente cai dentro dessa faixa"
      />
      <button
        type="button"
        onClick={remover}
        className="text-xs text-red-600 hover:underline"
        title="Remove esta faixa"
      >
        remover
      </button>
    </div>
  );
}
