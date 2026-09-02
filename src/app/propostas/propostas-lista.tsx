"use client";

import { useState } from "react";
import Link from "next/link";
import { useOrdenacao } from "@/lib/use-ordenacao";

type Proposta = {
  id: string;
  clienteId: string;
  numero: string;
  clienteNome: string;
  dataFormatada: string;
  dataTimestamp: number;
  valorFinal: string;
  valorNumerico: number;
  statusLabel: string;
};

function ThOrdenavel({
  label,
  campo,
  colunaAtiva,
  direcao,
  onClick,
}: {
  label: string;
  campo: keyof Proposta;
  colunaAtiva: keyof Proposta | null;
  direcao: "asc" | "desc";
  onClick: (campo: keyof Proposta) => void;
}) {
  const ativo = colunaAtiva === campo;
  return (
    <th
      className="cursor-pointer select-none px-4 py-2 font-medium hover:text-ink"
      onClick={() => onClick(campo)}
    >
      {label}
      {ativo && <span className="ml-1 text-accent">{direcao === "asc" ? "▲" : "▼"}</span>}
    </th>
  );
}

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

  const { ordenados, coluna, direcao, ordenarPor } = useOrdenacao(filtradas, "numero");

  return (
    <div className="mt-6">
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por cliente, número ou status..."
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
      />

      {ordenados.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-muted">
          Nenhuma proposta encontrada.
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <ThOrdenavel label="Número" campo="numero" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                <ThOrdenavel label="Cliente" campo="clienteNome" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                <ThOrdenavel label="Emitida em" campo="dataTimestamp" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                <ThOrdenavel label="Valor" campo="valorNumerico" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                <ThOrdenavel label="Status" campo="statusLabel" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                <th className="px-4 py-2 font-medium">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ordenados.map((p) => (
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
                  <td className="px-4 py-2 tabular-nums text-ink-muted">{p.valorFinal}</td>
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
