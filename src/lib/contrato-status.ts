export const STATUS_CONTRATO = ["emitido", "assinado", "cancelado"] as const;

export type StatusContrato = (typeof STATUS_CONTRATO)[number];

export const STATUS_CONTRATO_LABEL: Record<StatusContrato, string> = {
  emitido: "Emitido",
  assinado: "Assinado",
  cancelado: "Cancelado",
};

export function ehStatusContrato(valor: string): valor is StatusContrato {
  return (STATUS_CONTRATO as readonly string[]).includes(valor);
}
