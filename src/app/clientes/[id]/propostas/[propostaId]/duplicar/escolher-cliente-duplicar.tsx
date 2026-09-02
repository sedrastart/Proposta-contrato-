"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCpfCnpj } from "@/lib/format";
import { duplicarPropostaAction } from "../../actions";

type Cliente = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cpfCnpj: string;
};

export function EscolherClienteDuplicar({
  propostaId,
  clienteOrigemId,
  clientes,
}: {
  propostaId: string;
  clienteOrigemId: string;
  clientes: Cliente[];
}) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [isPending, startTransition] = useTransition();
  const [clienteEmAndamento, setClienteEmAndamento] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const buscaLower = busca.trim().toLowerCase();
  const filtrados = buscaLower
    ? clientes.filter(
        (c) =>
          c.razaoSocial.toLowerCase().includes(buscaLower) ||
          c.nomeFantasia?.toLowerCase().includes(buscaLower) ||
          c.cpfCnpj.includes(buscaLower)
      )
    : clientes;

  // Cliente atual sempre aparece primeiro, com destaque.
  const ordenados = [...filtrados].sort((a, b) => {
    if (a.id === clienteOrigemId) return -1;
    if (b.id === clienteOrigemId) return 1;
    return 0;
  });

  function escolher(clienteId: string) {
    setErro(null);
    setClienteEmAndamento(clienteId);
    startTransition(async () => {
      const resultado = await duplicarPropostaAction(propostaId, clienteId);
      if (resultado.sucesso) {
        router.push(`/clientes/${clienteId}/propostas/${resultado.propostaId}`);
      } else {
        setErro(resultado.erro);
        setClienteEmAndamento(null);
      }
    });
  }

  return (
    <div>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome ou CPF/CNPJ..."
        className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent"
        autoFocus
      />

      {erro && (
        <div className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
        {ordenados.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-ink-muted">
            Nenhum cliente encontrado.
          </p>
        ) : (
          ordenados.map((cliente) => {
            const ehOrigem = cliente.id === clienteOrigemId;
            const pendente = isPending && clienteEmAndamento === cliente.id;
            return (
              <button
                key={cliente.id}
                type="button"
                disabled={isPending}
                onClick={() => escolher(cliente.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {cliente.razaoSocial}
                    {ehOrigem && (
                      <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
                        cliente atual
                      </span>
                    )}
                  </p>
                  {cliente.nomeFantasia && (
                    <p className="text-xs text-ink-muted">{cliente.nomeFantasia}</p>
                  )}
                </div>
                <span className="tabular-nums text-xs text-ink-muted">
                  {pendente ? "Duplicando..." : formatCpfCnpj(cliente.cpfCnpj)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
