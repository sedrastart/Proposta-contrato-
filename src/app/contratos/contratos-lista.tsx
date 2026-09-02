"use client";

import { useState } from "react";
import Link from "next/link";
import { useOrdenacao } from "@/lib/use-ordenacao";
import { usePaginacao } from "@/lib/use-paginacao";
import { exportarCsv } from "@/lib/exportar-csv";
import { PaginacaoControle } from "../paginacao-controle";

type Contrato = {
  id: string;
  clienteId: string;
  numero: string;
  clienteNome: string;
  dataFormatada: string;
  dataTimestamp: number;
  valorFinal: string;
  valorNumerico: number;
  statusLabel: string;
  vencendo: boolean;
  diasParaVencer: number | null;
};

function ThOrdenavel({
  label,
  campo,
  colunaAtiva,
  direcao,
  onClick,
}: {
  label: string;
  campo: keyof Contrato;
  colunaAtiva: keyof Contrato | null;
  direcao: "asc" | "desc";
  onClick: (campo: keyof Contrato) => void;
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

function textoVencimento(dias: number): string {
  return dias < 0 ? `vencido há ${Math.abs(dias)}d` : `vence em ${dias}d`;
}

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

  const { ordenados, coluna, direcao, ordenarPor } = useOrdenacao(filtrados, "numero");
  const { pageItens, pagina, totalPaginas, setPagina } = usePaginacao(ordenados);

  function exportar() {
    exportarCsv(
      "contratos.csv",
      ["Número", "Cliente", "Emitido em", "Valor", "Status", "Dias até vencer"],
      ordenados.map((c) => [c.numero, c.clienteNome, c.dataFormatada, c.valorFinal, c.statusLabel, c.diasParaVencer ?? ""])
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
          Nenhum contrato encontrado.
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <ThOrdenavel label="Número" campo="numero" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                  <ThOrdenavel label="Cliente" campo="clienteNome" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                  <ThOrdenavel label="Emitido em" campo="dataTimestamp" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                  <ThOrdenavel label="Valor" campo="valorNumerico" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                  <ThOrdenavel label="Status" campo="statusLabel" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                  <th className="px-4 py-2 font-medium">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pageItens.map((c) => (
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
                    <td className="px-4 py-2 tabular-nums text-ink-muted">{c.valorFinal}</td>
                    <td className="px-4 py-2 text-ink-muted">
                      <span className="inline-flex items-center gap-1.5">
                        {c.statusLabel}
                        {c.vencendo && c.diasParaVencer !== null && (
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                            ⚠ {textoVencimento(c.diasParaVencer)}
                          </span>
                        )}
                      </span>
                    </td>
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
          <PaginacaoControle pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />
        </>
      )}
    </div>
  );
}
