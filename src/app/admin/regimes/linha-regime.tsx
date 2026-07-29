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
        />
      </td>
      <td className="px-4 py-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onBlur={salvar}
          className="w-full rounded border border-neutral-200 px-2 py-1 text-sm"
        />
      </td>
      <td className="px-4 py-2 font-mono text-xs text-neutral-500">{regime.slug}</td>
      <td className="px-4 py-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            regime.ativo ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
          }`}
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
        >
          {regime.ativo ? "desativar" : "ativar"}
        </button>
      </td>
    </tr>
  );
}
