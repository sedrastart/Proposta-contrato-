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

const MODELO_PROPOSTA_PADRAO = `PROPOSTA DE PRESTAÇÃO DE SERVIÇOS
Cliente: {{contratanteNome}}
CNPJ: {{contratanteCpfCnpj}}

[Descreva aqui a situação do cliente, se houver diagnóstico ou pendências identificadas. Apague esta linha se não se aplicar.]

OPÇÃO 1 – {{servicosSelecionados}}
Investimento: {{valor}}
Inclui:
{{servicosLista}}

[Se aplicável, adicione aqui uma OPÇÃO 2 com outro escopo/valor.]

Observações:
1. Esta proposta considera as informações apresentadas até a presente data.
2. Caso sejam identificadas novas pendências não relacionadas ao escopo acima, poderá ser apresentado orçamento complementar.

Atenção!
As condições desta proposta são válidas por 15 dias a partir da emissão.

{{telefoneContratado}}
{{emailContratado}}
{{siteContratado}}`;

export async function criarRegimeAction(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (nome.length < 2) throw new Error("Informe um nome válido");

  const ultimo = await prisma.regimeTributario.findFirst({
    orderBy: { ordem: "desc" },
  });

  const slug = slugify(nome);

  await prisma.$transaction([
    prisma.regimeTributario.create({
      data: {
        nome,
        slug,
        ordem: (ultimo?.ordem ?? 0) + 1,
      },
    }),
    prisma.modeloContrato.create({
      data: { slug, nome },
    }),
    prisma.modeloProposta.create({
      data: { slug, nome, corpo: MODELO_PROPOSTA_PADRAO },
    }),
  ]);

  revalidatePath("/admin/regimes");
  revalidatePath("/admin/contratos");
  revalidatePath("/admin/propostas");
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
