"use client";

import { useState } from "react";
import Link from "next/link";
import { BotaoExcluirCliente } from "./botao-excluir-cliente";
import { useOrdenacao } from "@/lib/use-ordenacao";

type Cliente = {
  id: string;
  razaoSocial: string;
  cpfCnpjFormatado: string;
  cidadeUf: string;
  cadastradoEmFormatado: string;
  cadastradoEmTimestamp: number;
  statusLabel: string;
  status: { label: string; completo: boolean; href: string };
};

function ThOrdenavel({
  label,
  campo,
  colunaAtiva,
  direcao,
  onClick,
}: {
  label: string;
  campo: keyof Cliente;
  colunaAtiva: keyof Cliente | null;
  direcao: "asc" | "desc";
  onClick: (campo: keyof Cliente) => void;
}) {
  const ativo = colunaAtiva === campo;
  return (
    <th
      className="cursor-pointer select-none px-4 py-3 font-medium hover:text-ink"
      onClick={() => onClick(campo)}
    >
      {label}
      {ativo && <span className="ml-1 text-accent">{direcao === "asc" ? "▲" : "▼"}</span>}
    </th>
  );
}

export function ClientesLista({ clientes }: { clientes: Cliente[] }) {
  const [busca, setBusca] = useState("");
  const buscaLower = busca.trim().toLowerCase();
  const filtrados = buscaLower
    ? clientes.filter(
        (c) =>
          c.razaoSocial.toLowerCase().includes(buscaLower) ||
          c.cpfCnpjFormatado.toLowerCase().includes(buscaLower) ||
          c.cidadeUf.toLowerCase().includes(buscaLower)
      )
    : clientes;

  const { ordenados, coluna, direcao, ordenarPor } = useOrdenacao(filtrados, "cadastradoEmTimestamp");

  return (
    <div>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome, CPF/CNPJ ou cidade..."
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
      />

      {ordenados.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-muted">
          Nenhum cliente encontrado.
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <ThOrdenavel label="Nome / Razão Social" campo="razaoSocial" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                <ThOrdenavel label="CPF/CNPJ" campo="cpfCnpjFormatado" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                <ThOrdenavel label="Cidade/UF" campo="cidadeUf" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                <ThOrdenavel label="Cadastrado em" campo="cadastradoEmTimestamp" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                <ThOrdenavel label="Status do cadastro" campo="statusLabel" colunaAtiva={coluna} direcao={direcao} onClick={ordenarPor} />
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ordenados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/clientes/${cliente.id}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {cliente.razaoSocial}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-muted">
                    {cliente.cpfCnpjFormatado}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{cliente.cidadeUf}</td>
                  <td className="px-4 py-3 text-ink-muted">{cliente.cadastradoEmFormatado}</td>
                  <td className="px-4 py-3">
                    {cliente.status.completo ? (
                      <span className="rounded-md border border-line bg-neutral-50 px-2.5 py-1 text-xs font-medium text-ink-muted">
                        {cliente.status.label}
                      </span>
                    ) : (
                      <Link
                        href={cliente.status.href}
                        className="rounded-md border border-accent-soft bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent hover:brightness-95"
                      >
                        {cliente.status.label}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <BotaoExcluirCliente clienteId={cliente.id} nomeCliente={cliente.razaoSocial} />
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
