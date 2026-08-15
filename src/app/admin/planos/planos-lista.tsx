"use client";

import { useState } from "react";
import { PlanoCard } from "./plano-card";

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
  limites: {
    id: string;
    unidade: string;
    quantidade: number;
    tipoCobranca: string;
    valorPorUnidade: number | null;
    faixas: { id: string; percentualAte: number; valorAdicional: number }[];
  }[];
};

const SEM_REGIME = "Sem regime específico";

export function PlanosLista({
  planos,
  ordemRegimes,
}: {
  planos: Plano[];
  ordemRegimes: string[];
}) {
  const [busca, setBusca] = useState("");

  const buscaLower = busca.trim().toLowerCase();
  const filtrados = buscaLower
    ? planos.filter(
        (p) =>
          p.nome.toLowerCase().includes(buscaLower) ||
          p.servico.nome.toLowerCase().includes(buscaLower) ||
          (p.regimeTributario?.nome.toLowerCase().includes(buscaLower) ?? false)
      )
    : planos;

  const grupos = new Map<string, Plano[]>();
  for (const plano of filtrados) {
    const chave = plano.regimeTributario?.nome ?? SEM_REGIME;
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(plano);
  }

  const ordem = [...ordemRegimes, SEM_REGIME];
  const chavesOrdenadas = [...grupos.keys()].sort(
    (a, b) => ordem.indexOf(a) - ordem.indexOf(b)
  );

  return (
    <div>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome do plano, serviço ou regime..."
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        title="Filtra a lista abaixo por nome do plano, serviço ou regime tributário"
      />

      <div className="mt-4 space-y-8">
        {chavesOrdenadas.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line py-8 text-center text-sm text-ink-muted">
            Nenhum plano encontrado para &quot;{busca}&quot;.
          </p>
        ) : (
          chavesOrdenadas.map((chave) => (
            <section key={chave}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                {chave}
              </h2>
              <div className="space-y-4">
                {grupos.get(chave)!.map((plano) => (
                  <PlanoCard key={plano.id} plano={plano} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
