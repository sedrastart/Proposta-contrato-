"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function atualizarClausulaAction(
  clausulaId: string,
  dados: { titulo: string; corpo: string }
) {
  await prisma.clausulaModelo.update({
    where: { id: clausulaId },
    data: { titulo: dados.titulo, corpo: dados.corpo },
  });
  revalidatePath("/admin/contratos");
}

export async function alternarAtivoClausulaAction(clausulaId: string, ativo: boolean) {
  await prisma.clausulaModelo.update({
    where: { id: clausulaId },
    data: { ativo },
  });
  revalidatePath("/admin/contratos");
}
