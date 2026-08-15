"use client";

import { useState } from "react";
import { LinhaServico } from "./linha-servico";

type Regime = { id: string; nome: string };
type Servico = {
  id: string;
  nome: string;
  ativo: boolean;
  regimes: { regimeTributarioId: string }[];
};

export function ServicosLista({
  servicos,
  regimesDisponiveis,
}: {
  servicos: Servico[];
  regimesDisponiveis: Regime[];
}) {
  const [busca, setBusca] = useState("");

  const buscaLower = busca.trim().toLowerCase();
  const filtrados = buscaLower
    ? servicos.filter((s) => s.nome.toLowerCase().includes(buscaLower))
    : servicos;

  return (
    <div>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome do serviço..."
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        title="Filtra a lista abaixo por nome do serviço"
      />

      <div className="mt-4 space-y-3">
        {filtrados.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line py-8 text-center text-sm text-ink-muted">
            Nenhum serviço encontrado para &quot;{busca}&quot;.
          </p>
        ) : (
          filtrados.map((servico) => (
            <LinhaServico
              key={servico.id}
              servico={servico}
              regimeIdsAtuais={servico.regimes.map((r) => r.regimeTributarioId)}
              regimesDisponiveis={regimesDisponiveis}
            />
          ))
        )}
      </div>
    </div>
  );
}
