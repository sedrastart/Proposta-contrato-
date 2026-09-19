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

const MODELO_PROPOSTA_PADRAO = `PROPOSTA COMERCIAL

Olá! Somos a Sedra Consultoria e preparamos esta proposta para {{contratanteNome}}.

Cuidamos da parte contábil e fiscal do seu negócio com atenção e agilidade, para você não perder tempo com burocracia e focar no que importa: fazer sua empresa crescer.

O que está incluído:
{{servicosLista}}

Investimento: {{valor}} por mês, pagamento {{condicaoPagamento}}.
Vigência: {{vigenciaTexto}}.

Franquia incluída por mês:
{{limitesUsoLista}}

Multa por cancelamento antecipado: {{multaDescricao}}.

Esta proposta é válida por {{validadeTexto}} a partir da data de emissão.

Ficou com alguma dúvida? Fale com a gente:
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
  if (data.nome !== undefined && data.nome.trim().length < 2) return;
  await prisma.regimeTributario.update({ where: { id }, data });
  revalidatePath("/admin/regimes");
}

export async function alternarAtivoRegimeAction(id: string, ativo: boolean) {
  await prisma.regimeTributario.update({ where: { id }, data: { ativo } });
  revalidatePath("/admin/regimes");
}

export type ExcluirRegimeResultado = { sucesso: true } | { sucesso: false; erro: string };

/** Exclui o regime e, por simetria com a criação, seu modelo de contrato e
 * de proposta (mesmo slug). Bloqueia se houver cliente cadastrado nesse
 * regime — evita órfãos silenciosos (o FK permitiria, virando null). */
export async function excluirRegimeAction(id: string): Promise<ExcluirRegimeResultado> {
  const regime = await prisma.regimeTributario.findUniqueOrThrow({ where: { id } });

  const totalClientes = await prisma.cliente.count({ where: { regimeTributarioId: id } });
  if (totalClientes > 0) {
    return {
      sucesso: false,
      erro: `Não é possível excluir: existem ${totalClientes} cliente${totalClientes !== 1 ? "s" : ""} cadastrado${totalClientes !== 1 ? "s" : ""} neste regime.`,
    };
  }

  await prisma.$transaction([
    prisma.modeloContrato.deleteMany({ where: { slug: regime.slug } }),
    prisma.modeloProposta.deleteMany({ where: { slug: regime.slug } }),
    prisma.regimeTributario.delete({ where: { id } }),
  ]);

  revalidatePath("/admin/regimes");
  revalidatePath("/admin/contratos");
  revalidatePath("/admin/propostas");
  revalidatePath("/admin/servicos");
  revalidatePath("/admin/planos");
  return { sucesso: true };
}
