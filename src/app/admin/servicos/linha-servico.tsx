"use client";

import { useState, useTransition } from "react";
import {
  atualizarServicoAction,
  alternarAtivoServicoAction,
  atualizarRegimesServicoAction,
} from "./actions";

type Regime = { id: string; nome: string };
type Servico = { id: string; nome: string; ativo: boolean };

export function LinhaServico({
  servico,
  regimeIdsAtuais,
  regimesDisponiveis,
}: {
  servico: Servico;
  regimeIdsAtuais: string[];
  regimesDisponiveis: Regime[];
}) {
  const [nome, setNome] = useState(servico.nome);
  const [regimeIds, setRegimeIds] = useState(new Set(regimeIdsAtuais));
  const [isPending, startTransition] = useTransition();

  function salvarNome() {
    if (nome !== servico.nome) {
      startTransition(() => {
        atualizarServicoAction(servico.id, { nome });
      });
    }
  }

  function alternarAtivo() {
    startTransition(() => {
      alternarAtivoServicoAction(servico.id, !servico.ativo);
    });
  }

  function alternarRegime(regimeId: string) {
    const next = new Set(regimeIds);
    if (next.has(regimeId)) next.delete(regimeId);
    else next.add(regimeId);
    setRegimeIds(next);
    startTransition(() => {
      atualizarRegimesServicoAction(servico.id, Array.from(next));
    });
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="flex items-center gap-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onBlur={salvarNome}
          className="flex-1 rounded-md border border-neutral-200 px-2 py-1 text-sm font-medium"
        />
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            servico.ativo ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {servico.ativo ? "ativo" : "inativo"}
        </span>
        <button
          type="button"
          onClick={alternarAtivo}
          disabled={isPending}
          className="text-sm text-neutral-600 hover:underline disabled:opacity-50"
        >
          {servico.ativo ? "desativar" : "ativar"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {regimesDisponiveis.map((regime) => (
          <label key={regime.id} className="flex items-center gap-1.5 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={regimeIds.has(regime.id)}
              onChange={() => alternarRegime(regime.id)}
            />
            {regime.nome}
          </label>
        ))}
      </div>
    </div>
  );
}
