"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { excluirClienteAction } from "./actions";

export function BotaoExcluirCliente({
  clienteId,
  nomeCliente,
  className,
}: {
  clienteId: string;
  nomeCliente: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function excluir() {
    if (
      !confirm(`Excluir o cliente "${nomeCliente}"? Esta ação não pode ser desfeita.`)
    ) {
      return;
    }
    setErro(null);
    startTransition(async () => {
      const resultado = await excluirClienteAction(clienteId);
      if (resultado.sucesso) {
        router.push("/clientes");
        router.refresh();
      } else {
        setErro(resultado.erro);
      }
    });
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={excluir}
        disabled={isPending}
        className="text-sm text-red-600 hover:underline disabled:opacity-50"
      >
        {isPending ? "Excluindo..." : "Excluir cliente"}
      </button>
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
    </div>
  );
}
