"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { excluirContratoAction } from "./actions";

export function BotaoExcluirContrato({
  contratoId,
  clienteId,
  numero,
}: {
  contratoId: string;
  clienteId: string;
  numero: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function excluir() {
    if (!confirm(`Excluir o contrato nº ${numero}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    startTransition(async () => {
      await excluirContratoAction(contratoId);
      router.push(`/clientes/${clienteId}`);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={excluir}
      disabled={isPending}
      className="mt-4 text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? "Excluindo..." : "Excluir contrato"}
    </button>
  );
}
