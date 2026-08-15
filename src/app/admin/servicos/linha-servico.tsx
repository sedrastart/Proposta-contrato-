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
    <div className="rounded-lg border border-line p-4">
      <div className="flex items-center gap-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onBlur={salvarNome}
          className="flex-1 rounded-md border border-line px-2 py-1 text-sm font-medium"
          title="Nome do serviço, como aparece no catálogo do assistente"
        />
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            servico.ativo ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-ink-muted"
          }`}
          title={
            servico.ativo
              ? "Aparece como opção no assistente de cadastro de cliente"
              : "Não aparece mais como opção no assistente — clientes já cadastrados não são afetados"
          }
        >
          {servico.ativo ? "ativo" : "inativo"}
        </span>
        <button
          type="button"
          onClick={alternarAtivo}
          disabled={isPending}
          className="text-sm text-ink-muted hover:underline disabled:opacity-50"
          title={
            servico.ativo
              ? "Esconde este serviço do assistente sem apagar nada"
              : "Volta a mostrar este serviço no assistente"
          }
        >
          {servico.ativo ? "desativar" : "ativar"}
        </button>
      </div>
      <div
        className="mt-3 flex flex-wrap gap-3"
        title="Em quais regimes esse serviço aparece na etapa 3 do assistente — marque/desmarque para ajustar"
      >
        {regimesDisponiveis.map((regime) => (
          <label key={regime.id} className="flex items-center gap-1.5 text-sm text-ink">
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
