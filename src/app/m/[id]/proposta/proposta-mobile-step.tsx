"use client";

import { useRouter } from "next/navigation";
import { NovaPropostaEditor } from "@/app/clientes/[id]/propostas/nova/nova-proposta-editor";

export function PropostaMobileStep({
  clienteId,
  textoInicial,
}: {
  clienteId: string;
  textoInicial: string;
}) {
  const router = useRouter();

  return (
    <NovaPropostaEditor
      clienteId={clienteId}
      textoInicial={textoInicial}
      aoCriar={() => router.push(`/m/${clienteId}/contrato`)}
    />
  );
}
