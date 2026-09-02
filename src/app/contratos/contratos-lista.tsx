"use client";

import { useState } from "react";
import Link from "next/link";

type Contrato = {
  id: string;
  clienteId: string;
  numero: string;
  clienteNome: string;
  dataFormatada: string;
  valorFinal: string;
  statusLabel: string;
};

export function ContratosLista({ contratos }: { contratos: Contrato[] }) {
  const [busca, setBusca] = useState("");
  const buscaLower = busca.trim().toLowerCase();
  const filtrados = buscaLower
    ? contratos.filter(
        (c) =>
          c.clienteNome.toLowerCase().includes(buscaLower) ||
          c.numero.includes(buscaLower) ||
          c.statusLabel.toLowerCase().includes(buscaLower)
      )
    : contratos;

  return (
    <div className="mt-6">
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por cliente, número ou status..."
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
      />

      {filtrados.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-muted">
          Nenhum contrato encontrado.
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Número</th>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Emitido em</th>
                <th className="px-4 py-2 font-medium">Valor</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2 tabular-nums text-ink">
                    <Link href={`/clientes/${c.clienteId}/contratos/${c.id}`} className="hover:underline">
                      {c.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/clientes/${c.clienteId}`} className="hover:underline">
                      {c.clienteNome}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{c.dataFormatada}</td>
                  <td className="px-4 py-2 text-ink-muted">{c.valorFinal}</td>
                  <td className="px-4 py-2 text-ink-muted">{c.statusLabel}</td>
                  <td className="px-4 py-2">
                    <a href={`/api/contratos/${c.id}/pdf`} className="text-ink hover:underline">
                      PDF
                    </a>
                    <span className="mx-1.5 text-ink-muted">·</span>
                    <a href={`/api/contratos/${c.id}/docx`} className="text-ink hover:underline">
                      DOCX
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
