"use client";

import { useState, useTransition } from "react";
import { atualizarRegimeAction, alternarAtivoRegimeAction } from "./actions";

type Regime = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  ativo: boolean;
};

export function LinhaRegime({ regime }: { regime: Regime }) {
  const [nome, setNome] = useState(regime.nome);
  const [ordem, setOrdem] = useState(regime.ordem);
  const [isPending, startTransition] = useTransition();

  function salvar() {
    startTransition(() => {
      atualizarRegimeAction(regime.id, { nome, ordem });
    });
  }

  function alternarAtivo() {
    startTransition(() => {
      alternarAtivoRegimeAction(regime.id, !regime.ativo);
    });
  }

  return (
    <tr>
      <td className="px-4 py-2">
        <input
          type="number"
          value={ordem}
          onChange={(e) => setOrdem(Number(e.target.value))}
          onBlur={salvar}
          className="w-16 rounded border border-neutral-200 px-2 py-1 text-sm"
          title="Posição de exibição desse regime nas listas (menor número aparece primeiro)"
        />
      </td>
      <td className="px-4 py-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onBlur={salvar}
          className="w-full rounded border border-neutral-200 px-2 py-1 text-sm"
          title="Nome do regime, como aparece para escolha no assistente de cliente"
        />
      </td>
      <td
        className="px-4 py-2 font-mono text-xs text-neutral-500"
        title="Identificador técnico usado internamente para ligar este regime ao seu modelo de contrato — não é editável"
      >
        {regime.slug}
      </td>
      <td className="px-4 py-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            regime.ativo ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
          }`}
          title={
            regime.ativo
              ? "Aparece como opção no assistente de cadastro de cliente"
              : "Não aparece mais como opção no assistente — clientes já cadastrados não são afetados"
          }
        >
          {regime.ativo ? "ativo" : "inativo"}
        </span>
      </td>
      <td className="px-4 py-2 text-right">
        <button
          type="button"
          onClick={alternarAtivo}
          disabled={isPending}
          className="text-sm text-neutral-600 hover:underline disabled:opacity-50"
          title={
            regime.ativo
              ? "Esconde este regime do assistente sem apagar nada"
              : "Volta a mostrar este regime no assistente"
          }
        >
          {regime.ativo ? "desativar" : "ativar"}
        </button>
      </td>
    </tr>
  );
}
