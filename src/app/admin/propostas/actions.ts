"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function atualizarModeloPropostaAction(modeloId: string, corpo: string) {
  await prisma.modeloProposta.update({
    where: { id: modeloId },
    data: { corpo },
  });
  revalidatePath("/admin/propostas");
}
