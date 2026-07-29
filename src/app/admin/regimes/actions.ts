"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const MAPA_ACENTOS: Record<string, string> = {
  á: "a", à: "a", â: "a", ã: "a", ä: "a",
  é: "e", è: "e", ê: "e", ë: "e",
  í: "i", ì: "i", î: "i", ï: "i",
  ó: "o", ò: "o", ô: "o", õ: "o", ö: "o",
  ú: "u", ù: "u", û: "u", ü: "u",
  ç: "c", ñ: "n",
};

function removerAcentos(texto: string): string {
  return texto.replace(/[áàâãäéèêëíìîïóòôõöúùûüçñ]/g, (c) => MAPA_ACENTOS[c] ?? c);
}

function slugify(nome: string): string {
  return removerAcentos(nome.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function criarRegimeAction(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (nome.length < 2) throw new Error("Informe um nome válido");

  const ultimo = await prisma.regimeTributario.findFirst({
    orderBy: { ordem: "desc" },
  });

  await prisma.regimeTributario.create({
    data: {
      nome,
      slug: slugify(nome),
      ordem: (ultimo?.ordem ?? 0) + 1,
    },
  });

  revalidatePath("/admin/regimes");
}

export async function atualizarRegimeAction(
  id: string,
  data: { nome?: string; ordem?: number }
) {
  await prisma.regimeTributario.update({ where: { id }, data });
  revalidatePath("/admin/regimes");
}

export async function alternarAtivoRegimeAction(id: string, ativo: boolean) {
  await prisma.regimeTributario.update({ where: { id }, data: { ativo } });
  revalidatePath("/admin/regimes");
}
