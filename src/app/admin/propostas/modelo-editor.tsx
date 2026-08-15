"use client";

import { useState, useTransition } from "react";
import { atualizarModeloPropostaAction } from "./actions";

type Modelo = { id: string; corpo: string };

export function ModeloPropostaEditor({ modelo }: { modelo: Modelo }) {
  const [corpo, setCorpo] = useState(modelo.corpo);
  const [isPending, startTransition] = useTransition();

  function salvar() {
    startTransition(() => {
      atualizarModeloPropostaAction(modelo.id, corpo);
    });
  }

  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <textarea
        value={corpo}
        onChange={(e) => setCorpo(e.target.value)}
        onBlur={salvar}
        rows={26}
        className="w-full rounded border border-line px-3 py-2 font-mono text-xs leading-relaxed outline-none focus:border-accent"
        title="Texto padrão da proposta para este regime — salvo automaticamente ao sair do campo"
      />
      {isPending && <p className="mt-2 text-xs text-ink-muted">Salvando...</p>}
    </div>
  );
}
