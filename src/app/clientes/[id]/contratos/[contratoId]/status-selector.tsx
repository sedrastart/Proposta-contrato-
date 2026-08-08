"use client";

import { useState, useTransition } from "react";
import { atualizarStatusContratoAction } from "./actions";
import { STATUS_CONTRATO, STATUS_CONTRATO_LABEL, type StatusContrato } from "@/lib/contrato-status";

const badgeClass: Record<string, string> = {
  emitido: "bg-sky-50 text-sky-700",
  assinado: "bg-emerald-50 text-emerald-700",
  cancelado: "bg-red-50 text-red-700",
};

export function ContratoStatusSelector({
  contratoId,
  statusAtual,
}: {
  contratoId: string;
  statusAtual: string;
}) {
  const [status, setStatus] = useState(statusAtual);
  const [isPending, startTransition] = useTransition();

  function mudar(novo: string) {
    setStatus(novo);
    startTransition(() => {
      atualizarStatusContratoAction(contratoId, novo);
    });
  }

  return (
    <select
      value={status}
      onChange={(e) => mudar(e.target.value)}
      disabled={isPending}
      className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium ${badgeClass[status] ?? badgeClass.emitido}`}
      title="Marca se o contrato já foi assinado pelo cliente ou foi cancelado"
    >
      {STATUS_CONTRATO.map((s) => (
        <option key={s} value={s}>
          {STATUS_CONTRATO_LABEL[s as StatusContrato]}
        </option>
      ))}
    </select>
  );
}
