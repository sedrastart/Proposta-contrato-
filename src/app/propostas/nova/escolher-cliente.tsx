"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCpfCnpj } from "@/lib/format";

type Cliente = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cpfCnpj: string;
};

export function EscolherCliente({ clientes }: { clientes: Cliente[] }) {
  const [busca, setBusca] = useState("");
  const buscaLower = busca.trim().toLowerCase();
  const filtrados = buscaLower
    ? clientes.filter(
        (c) =>
          c.razaoSocial.toLowerCase().includes(buscaLower) ||
          c.nomeFantasia?.toLowerCase().includes(buscaLower) ||
          c.cpfCnpj.includes(buscaLower)
      )
    : clientes;

  return (
    <div>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome ou CPF/CNPJ..."
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        autoFocus
      />

      <div className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
        {filtrados.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-ink-muted">
            Nenhum cliente encontrado.
          </p>
        ) : (
          filtrados.map((cliente) => (
            <Link
              key={cliente.id}
              href={`/clientes/${cliente.id}/propostas/nova`}
              className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50"
            >
              <div>
                <p className="text-sm font-medium text-ink">{cliente.razaoSocial}</p>
                {cliente.nomeFantasia && (
                  <p className="text-xs text-ink-muted">{cliente.nomeFantasia}</p>
                )}
              </div>
              <span className="tabular-nums text-xs text-ink-muted">
                {formatCpfCnpj(cliente.cpfCnpj)}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
