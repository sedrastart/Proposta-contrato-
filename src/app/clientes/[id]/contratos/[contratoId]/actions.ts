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
