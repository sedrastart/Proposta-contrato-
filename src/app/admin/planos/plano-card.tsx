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
  ativo: boolean;
  servico: { nome: string };
  regimeTributario: { nome: string } | null;
  limites: Limite[];
};

const inputClass = "rounded-md border border-neutral-200 px-2 py-1 text-sm";

export function PlanoCard({ plano }: { plano: Plano }) {
  const [campos, setCampos] = useState({
    nome: plano.nome,
    valor: plano.valor,
    vigenciaMeses: plano.vigenciaMeses,
    multaPercentual: plano.multaPercentual ?? "",
    multaDescricao: plano.multaDescricao ?? "",
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
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {plano.servico.nome} · {plano.regimeTributario?.nome ?? "qualquer regime do serviço"}
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              plano.ativo ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {plano.ativo ? "ativo" : "inativo"}
          </span>
          <button
            type="button"
            onClick={alternarAtivo}
            disabled={isPending}
            className="text-sm text-neutral-600 hover:underline disabled:opacity-50"
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
        />
        <label className="text-xs text-neutral-500">
          Valor (R$)
          <input
            type="number"
            step="0.01"
            className={`${inputClass} mt-0.5 w-full`}
            value={campos.valor}
            onChange={(e) => setCampos({ ...campos, valor: Number(e.target.value) })}
            onBlur={salvar}
          />
        </label>
        <label className="text-xs text-neutral-500">
          Vigência (meses)
          <input
            type="number"
            className={`${inputClass} mt-0.5 w-full`}
            value={campos.vigenciaMeses}
            onChange={(e) => setCampos({ ...campos, vigenciaMeses: Number(e.target.value) })}
            onBlur={salvar}
          />
        </label>
        <label className="text-xs text-neutral-500">
          Multa (%)
          <input
            type="number"
            step="0.01"
            className={`${inputClass} mt-0.5 w-full`}
            value={campos.multaPercentual}
            onChange={(e) => setCampos({ ...campos, multaPercentual: e.target.value })}
            onBlur={salvar}
          />
        </label>
        <label className="text-xs text-neutral-500">
          Texto da multa
          <input
            className={`${inputClass} mt-0.5 w-full`}
            value={campos.multaDescricao}
            onChange={(e) => setCampos({ ...campos, multaDescricao: e.target.value })}
            onBlur={salvar}
          />
        </label>
      </div>

      {plano.limites.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Limites de uso</p>
          {plano.limites.map((limite) => (
            <LimiteRow key={limite.id} limite={limite} />
          ))}
        </div>
      )}

      <div className="mt-3 flex items-end gap-2 border-t border-dashed border-neutral-200 pt-3">
        <input
          placeholder="unidade (ex.: lançamentos)"
          value={novoLimite.unidade}
          onChange={(e) => setNovoLimite({ ...novoLimite, unidade: e.target.value })}
          className={`${inputClass} w-40`}
        />
        <input
          type="number"
          placeholder="qtd/mês"
          value={novoLimite.quantidade}
          onChange={(e) => setNovoLimite({ ...novoLimite, quantidade: e.target.value })}
          className={`${inputClass} w-24`}
        />
        <select
          value={novoLimite.tipoCobranca}
          onChange={(e) =>
            setNovoLimite({ ...novoLimite, tipoCobranca: e.target.value as "por_unidade" | "faixa" })
          }
          className={inputClass}
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
          />
        )}
        <button
          type="button"
          onClick={adicionarLimite}
          className="rounded-md border border-neutral-300 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
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
        />
        <span className="text-sm text-neutral-600">{limite.unidade}/mês —</span>
        {limite.tipoCobranca === "por_unidade" ? (
          <>
            <input
              type="number"
              step="0.01"
              value={valorPorUnidade}
              onChange={(e) => setValorPorUnidade(Number(e.target.value))}
              onBlur={salvar}
              className={`${inputClass} w-24`}
            />
            <span className="text-sm text-neutral-600">por unidade excedente</span>
          </>
        ) : (
          <span className="text-sm text-neutral-600">faixas por % de excedente</span>
        )}
        <button type="button" onClick={remover} className="ml-auto text-xs text-red-600 hover:underline">
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
            />
            <input
              type="number"
              step="0.01"
              placeholder="valor R$"
              value={novaFaixa.valorAdicional}
              onChange={(e) => setNovaFaixa({ ...novaFaixa, valorAdicional: e.target.value })}
              className={`${inputClass} w-24`}
            />
            <button
              type="button"
              onClick={adicionarFaixa}
              className="text-xs text-neutral-600 hover:underline"
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
      <span className="text-xs text-neutral-500">até</span>
      <input
        type="number"
        value={percentualAte}
        onChange={(e) => setPercentualAte(Number(e.target.value))}
        onBlur={salvar}
        className={`${inputClass} w-20`}
      />
      <span className="text-xs text-neutral-500">% =</span>
      <input
        type="number"
        step="0.01"
        value={valorAdicional}
        onChange={(e) => setValorAdicional(Number(e.target.value))}
        onBlur={salvar}
        className={`${inputClass} w-24`}
      />
      <button type="button" onClick={remover} className="text-xs text-red-600 hover:underline">
        remover
      </button>
    </div>
  );
}
