"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function criarServicoAction(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (nome.length < 2) throw new Error("Informe um nome válido");

  const regimeIds = formData.getAll("regimeIds").map(String);

  const ultimo = await prisma.servico.findFirst({ orderBy: { ordem: "desc" } });

  await prisma.servico.create({
    data: {
      nome,
      ordem: (ultimo?.ordem ?? 0) + 1,
      regimes: {
        create: regimeIds.map((regimeTributarioId) => ({ regimeTributarioId })),
      },
    },
  });

  revalidatePath("/admin/servicos");
}

export async function atualizarServicoAction(
  id: string,
  data: { nome?: string; descricao?: string; ordem?: number }
) {
  await prisma.servico.update({ where: { id }, data });
  revalidatePath("/admin/servicos");
}

export async function alternarAtivoServicoAction(id: string, ativo: boolean) {
  await prisma.servico.update({ where: { id }, data: { ativo } });
  revalidatePath("/admin/servicos");
}

export type ExcluirServicoResultado = { sucesso: true } | { sucesso: false; erro: string };

/** Bloqueia a exclusão se algum cliente já tiver este serviço contratado —
 * o FK é onDelete: Cascade em ClienteServico, então excluir sem essa
 * checagem apagaria silenciosamente o vínculo desses clientes. */
export async function excluirServicoAction(id: string): Promise<ExcluirServicoResultado> {
  const totalClientes = await prisma.clienteServico.count({ where: { servicoId: id } });
  if (totalClientes > 0) {
    return {
      sucesso: false,
      erro: `Não é possível excluir: ${totalClientes} cliente${totalClientes !== 1 ? "s têm" : " tem"} este serviço contratado.`,
    };
  }

  await prisma.servico.delete({ where: { id } });
  revalidatePath("/admin/servicos");
  revalidatePath("/admin/planos");
  return { sucesso: true };
}

export async function atualizarRegimesServicoAction(
  servicoId: string,
  regimeIds: string[]
) {
  await prisma.$transaction([
    prisma.servicoRegime.deleteMany({ where: { servicoId } }),
    prisma.servicoRegime.createMany({
      data: regimeIds.map((regimeTributarioId) => ({ servicoId, regimeTributarioId })),
    }),
  ]);
  revalidatePath("/admin/servicos");
}
