"use client";

import { useState, useTransition } from "react";
import { atualizarServicosAction } from "../actions";

type Servico = { id: string; nome: string };

export function ServicoSelector({
  clienteId,
  servicosDisponiveis,
  servicosSelecionadosIds,
}: {
  clienteId: string;
  servicosDisponiveis: Servico[];
  servicosSelecionadosIds: string[];
}) {
  const [selecionados, setSelecionados] = useState(
    new Set(servicosSelecionadosIds)
  );
  const [isPending, startTransition] = useTransition();
  const [salvo, setSalvo] = useState(false);

  function toggle(id: string) {
    setSalvo(false);
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function salvar() {
    startTransition(async () => {
      await atualizarServicosAction(clienteId, Array.from(selecionados));
      setSalvo(true);
    });
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-muted">
        Etapa 3 — Serviços
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {servicosDisponiveis.map((servico) => (
          <label
            key={servico.id}
            className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
              selecionados.has(servico.id)
                ? "border-accent bg-accent text-white"
                : "border-line text-ink hover:border-line"
            }`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={selecionados.has(servico.id)}
              onChange={() => toggle(servico.id)}
            />
            {servico.nome}
          </label>
        ))}
      </div>
      {servicosDisponiveis.length === 0 && (
        <p className="mt-2 text-sm text-ink-muted">
          Nenhum serviço cadastrado para este regime ainda.
        </p>
      )}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={salvar}
          disabled={isPending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar serviços"}
        </button>
        {salvo && !isPending && (
          <span className="text-sm text-emerald-600">Salvo ✓</span>
        )}
      </div>
    </div>
  );
}
