"use client";

import { useTransition } from "react";
import { definirRegimeAction } from "../actions";

type Regime = { id: string; nome: string; slug: string };

export function RegimeSelector({
  clienteId,
  regimes,
  regimeAtualId,
}: {
  clienteId: string;
  regimes: Regime[];
  regimeAtualId: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  function selecionar(regimeId: string) {
    startTransition(() => {
      definirRegimeAction(clienteId, regimeId);
    });
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-muted">
        Etapa 2 — Regime tributário
      </p>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {regimes.map((regime) => {
          const selected = regime.id === regimeAtualId;
          return (
            <button
              key={regime.id}
              type="button"
              disabled={isPending}
              onClick={() => selecionar(regime.id)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                selected
                  ? "border-accent bg-accent text-white"
                  : "border-line text-ink hover:border-line"
              }`}
            >
              {regime.nome}
            </button>
          );
        })}
      </div>
    </div>
  );
}
