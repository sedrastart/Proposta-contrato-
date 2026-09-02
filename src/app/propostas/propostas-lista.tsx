"use client";

import { useState } from "react";
import Link from "next/link";
import { useOrdenacao } from "@/lib/use-ordenacao";
import { usePaginacao } from "@/lib/use-paginacao";
import { exportarCsv } from "@/lib/exportar-csv";
import { PaginacaoControle } from "../paginacao-controle";

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
  esfriando: boolean;
  diasParado: number;
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
  const { pageItens, pagina, totalPaginas, setPagina } = usePaginacao(ordenados);

  function exportar() {
    exportarCsv(
      "propostas.csv",
      ["Número", "Cliente", "Emitida em", "Valor", "Status", "Dias sem movimento"],
      ordenados.map((p) => [p.numero, p.clienteNome, p.dataFormatada, p.valorFinal, p.statusLabel, p.diasParado])
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por cliente, número ou status..."
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={exportar}
          className="whitespace-nowrap rounded-md border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-neutral-50"
          title="Exporta a lista filtrada/ordenada como CSV"
        >
          Exportar CSV
        </button>
      </div>

      {ordenados.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-muted">
          Nenhuma proposta encontrada.
        </div>
      ) : (
        <>
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
                {pageItens.map((p) => (
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
                    <td className="px-4 py-2 text-ink-muted">
                      <span className="inline-flex items-center gap-1.5">
                        {p.statusLabel}
                        {p.esfriando && (
                          <span
                            className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800"
                            title={`Sem movimento há ${p.diasParado} dias`}
                          >
                            ⚠ {p.diasParado}d parada
                          </span>
                        )}
                      </span>
                    </td>
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
          <PaginacaoControle pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />
        </>
      )}
    </div>
  );
}
