"use client";

import { useState } from "react";
import Link from "next/link";

type Proposta = {
  id: string;
  clienteId: string;
  numero: string;
  clienteNome: string;
  dataFormatada: string;
  valorFinal: string;
  statusLabel: string;
};

export function PropostasLista({ propostas }: { propostas: Proposta[] }) {
  const [busca, setBusca] = useState("");
  const buscaLower = busca.trim().toLowerCase();
  const filtradas = buscaLower
    ? propostas.filter(
        (p) =>
          p.clienteNome.toLowerCase().includes(buscaLower) ||
          p.numero.includes(buscaLower) ||
          p.statusLabel.toLowerCase().includes(buscaLower)
      )
    : propostas;

  return (
    <div className="mt-6">
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por cliente, número ou status..."
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
      />

      {filtradas.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-muted">
          Nenhuma proposta encontrada.
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Número</th>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Emitida em</th>
                <th className="px-4 py-2 font-medium">Valor</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtradas.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2 tabular-nums text-ink">
                    <Link href={`/clientes/${p.clienteId}/propostas/${p.id}`} className="hover:underline">
                      {p.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/clientes/${p.clienteId}`} className="hover:underline">
                      {p.clienteNome}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{p.dataFormatada}</td>
                  <td className="px-4 py-2 text-ink-muted">{p.valorFinal}</td>
                  <td className="px-4 py-2 text-ink-muted">{p.statusLabel}</td>
                  <td className="px-4 py-2">
                    <a href={`/api/propostas/${p.id}`} className="text-ink hover:underline">
                      PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
