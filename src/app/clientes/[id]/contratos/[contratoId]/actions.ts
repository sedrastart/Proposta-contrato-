"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ehStatusContrato } from "@/lib/contrato-status";

export async function atualizarStatusContratoAction(contratoId: string, status: string) {
  if (!ehStatusContrato(status)) throw new Error("Status inválido");

  const contrato = await prisma.contrato.update({
    where: { id: contratoId },
    data: { status },
  });

  revalidatePath(`/clientes/${contrato.clienteId}/contratos/${contratoId}`);
  revalidatePath(`/clientes/${contrato.clienteId}`);
  revalidatePath("/contratos");
}

/** Exclui o contrato definitivamente. Não remove o PDF/DOCX já salvos no
 * Storage. Se ele tinha uma proposta de origem, ela continua existindo. */
export async function excluirContratoAction(contratoId: string) {
  const contrato = await prisma.contrato.delete({ where: { id: contratoId } });
  revalidatePath(`/clientes/${contrato.clienteId}`);
  revalidatePath("/contratos");
}
