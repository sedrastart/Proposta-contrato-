"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function revalidar() {
  revalidatePath("/admin/contratos");
}

export async function atualizarClausulaAction(
  clausulaId: string,
  dados: { titulo: string; corpo: string }
) {
  await prisma.clausulaModelo.update({
    where: { id: clausulaId },
    data: { titulo: dados.titulo, corpo: dados.corpo },
  });
  revalidar();
}

export async function alternarAtivoClausulaAction(clausulaId: string, ativo: boolean) {
  await prisma.clausulaModelo.update({
    where: { id: clausulaId },
    data: { ativo },
  });
  revalidar();
}

export async function criarClausulaAction(
  modeloContratoId: string,
  dados: { tipo: string; titulo: string; corpo: string }
) {
  const ultima = await prisma.clausulaModelo.findFirst({
    where: { modeloContratoId },
    orderBy: { ordem: "desc" },
  });
  await prisma.clausulaModelo.create({
    data: {
      modeloContratoId,
      tipo: dados.tipo,
      titulo: dados.titulo,
      corpo: dados.corpo,
      ordem: (ultima?.ordem ?? 0) + 1,
    },
  });
  revalidar();
}

export async function excluirClausulaAction(clausulaId: string) {
  await prisma.clausulaModelo.delete({ where: { id: clausulaId } });
  revalidar();
}

export async function moverClausulaAction(clausulaId: string, direcao: "cima" | "baixo") {
  const atual = await prisma.clausulaModelo.findUniqueOrThrow({ where: { id: clausulaId } });
  const vizinho = await prisma.clausulaModelo.findFirst({
    where: {
      modeloContratoId: atual.modeloContratoId,
      ordem: direcao === "cima" ? { lt: atual.ordem } : { gt: atual.ordem },
    },
    orderBy: { ordem: direcao === "cima" ? "desc" : "asc" },
  });
  if (!vizinho) return;

  await prisma.$transaction([
    prisma.clausulaModelo.update({ where: { id: atual.id }, data: { ordem: vizinho.ordem } }),
    prisma.clausulaModelo.update({ where: { id: vizinho.id }, data: { ordem: atual.ordem } }),
  ]);
  revalidar();
}
