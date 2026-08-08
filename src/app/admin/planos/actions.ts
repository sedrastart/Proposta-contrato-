"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function revalidar() {
  revalidatePath("/admin/planos");
}

export async function criarPlanoAction(formData: FormData) {
  const servicoId = String(formData.get("servicoId") ?? "");
  const regimeTributarioIdRaw = String(formData.get("regimeTributarioId") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const valor = Number(formData.get("valor"));
  const vigenciaMeses = Number(formData.get("vigenciaMeses"));
  const multaPercentualRaw = String(formData.get("multaPercentual") ?? "");
  const multaDescricao = String(formData.get("multaDescricao") ?? "").trim();
  const condicaoPagamentoRaw = String(formData.get("condicaoPagamento") ?? "a_vista");
  const parcelasRaw = String(formData.get("parcelas") ?? "1");

  if (!servicoId || nome.length < 2 || !Number.isFinite(valor) || !Number.isFinite(vigenciaMeses)) {
    throw new Error("Preencha serviço, nome, valor e vigência corretamente");
  }

  const ultimo = await prisma.plano.findFirst({
    where: { servicoId },
    orderBy: { ordem: "desc" },
  });

  await prisma.plano.create({
    data: {
      servicoId,
      regimeTributarioId: regimeTributarioIdRaw || null,
      nome,
      valor,
      vigenciaMeses,
      multaPercentual: multaPercentualRaw ? Number(multaPercentualRaw) : null,
      multaDescricao: multaDescricao || null,
      condicaoPagamento: condicaoPagamentoRaw === "parcelado" ? "parcelado" : "a_vista",
      parcelas: Number(parcelasRaw) || 1,
      ordem: (ultimo?.ordem ?? 0) + 1,
    },
  });

  revalidar();
}

export async function atualizarPlanoAction(
  id: string,
  data: {
    nome?: string;
    valor?: number;
    vigenciaMeses?: number;
    multaPercentual?: number | null;
    multaDescricao?: string;
    condicaoPagamento?: string;
    parcelas?: number;
  }
) {
  await prisma.plano.update({ where: { id }, data });
  revalidar();
}

export async function alternarAtivoPlanoAction(id: string, ativo: boolean) {
  await prisma.plano.update({ where: { id }, data: { ativo } });
  revalidar();
}

export async function criarLimiteAction(
  planoId: string,
  data: {
    unidade: string;
    quantidade: number;
    tipoCobranca: "faixa" | "por_unidade";
    valorPorUnidade?: number;
  }
) {
  await prisma.planoLimiteUso.create({
    data: {
      planoId,
      unidade: data.unidade,
      quantidade: data.quantidade,
      tipoCobranca: data.tipoCobranca,
      valorPorUnidade: data.tipoCobranca === "por_unidade" ? data.valorPorUnidade ?? 0 : null,
    },
  });
  revalidar();
}

export async function removerLimiteAction(id: string) {
  await prisma.planoLimiteUso.delete({ where: { id } });
  revalidar();
}

export async function atualizarLimiteAction(
  id: string,
  data: { quantidade?: number; valorPorUnidade?: number }
) {
  await prisma.planoLimiteUso.update({ where: { id }, data });
  revalidar();
}

export async function criarFaixaAction(
  limiteId: string,
  data: { percentualAte: number; valorAdicional: number }
) {
  const ultima = await prisma.planoFaixaExcedente.findFirst({
    where: { planoLimiteUsoId: limiteId },
    orderBy: { ordem: "desc" },
  });
  await prisma.planoFaixaExcedente.create({
    data: {
      planoLimiteUsoId: limiteId,
      percentualAte: data.percentualAte,
      valorAdicional: data.valorAdicional,
      ordem: (ultima?.ordem ?? 0) + 1,
    },
  });
  revalidar();
}

export async function removerFaixaAction(id: string) {
  await prisma.planoFaixaExcedente.delete({ where: { id } });
  revalidar();
}

export async function atualizarFaixaAction(
  id: string,
  data: { percentualAte?: number; valorAdicional?: number }
) {
  await prisma.planoFaixaExcedente.update({ where: { id }, data });
  revalidar();
}
