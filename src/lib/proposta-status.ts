export const STATUS_PROPOSTA = ["rascunho", "enviada", "aceita", "recusada"] as const;

export type StatusProposta = (typeof STATUS_PROPOSTA)[number];

export const STATUS_PROPOSTA_LABEL: Record<StatusProposta, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  aceita: "Aceita",
  recusada: "Recusada",
};

export function ehStatusProposta(valor: string): valor is StatusProposta {
  return (STATUS_PROPOSTA as readonly string[]).includes(valor);
}
