"use client";

import { useState } from "react";
import { LinhaRegime } from "./linha-regime";

type Regime = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  ativo: boolean;
};

export function RegimesLista({ regimes }: { regimes: Regime[] }) {
  const [busca, setBusca] = useState("");

  const buscaLower = busca.trim().toLowerCase();
  const filtrados = buscaLower
    ? regimes.filter(
        (r) =>
          r.nome.toLowerCase().includes(buscaLower) ||
          r.slug.toLowerCase().includes(buscaLower)
      )
    : regimes;

  return (
    <div>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome ou slug..."
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        title="Filtra a lista abaixo por nome ou slug do regime"
      />

      <div className="mt-4 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Ordem</th>
              <th className="px-4 py-2 font-medium">Nome</th>
              <th className="px-4 py-2 font-medium">Slug</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-muted">
                  Nenhum regime encontrado para &quot;{busca}&quot;.
                </td>
              </tr>
            ) : (
              filtrados.map((regime) => <LinhaRegime key={regime.id} regime={regime} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
