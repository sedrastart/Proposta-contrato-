"use server";

import { prisma } from "@/lib/prisma";
import {
  buscarClienteParaContrato,
  buscarClausulasModelo,
  montarDadosContrato,
  type OverridesEditaveis,
} from "@/lib/contrato-dados";
import { renderContrato } from "@/lib/templates";
import { proximoNumeroSequencial } from "@/lib/numero-sequencial";
import { gerarDocx } from "@/lib/documentos/docx";
import { gerarPdf } from "@/lib/documentos/pdf";
import { salvarArquivosContrato, salvarArquivoProposta } from "@/lib/documentos/armazenamento";

export type GerarContratoResultado =
  | { sucesso: true; contratoId: string }
  | { sucesso: false; erro: string };

export type GerarPropostaResultado =
  | { sucesso: true; propostaId: string }
  | { sucesso: false; erro: string };

/** Grava a proposta comercial com o texto já editado pelo usuário (a partir
 * do rascunho inicial) — numeração sequencial e PDF salvo no Storage
 * próprios, independentes do Contrato. */
export async function gerarPropostaAction(
  clienteId: string,
  textoCompleto: string
): Promise<GerarPropostaResultado> {
  const cliente = await buscarClienteParaContrato(clienteId);
  if (!cliente || !cliente.regimeTributario || cliente.servicos.length === 0) {
    return { sucesso: false, erro: "Cliente sem regime, serviços ou plano definidos" };
  }
  if (!textoCompleto.trim()) {
    return { sucesso: false, erro: "O texto da proposta não pode estar vazio" };
  }

  const dados = montarDadosContrato(cliente);

  const numeroSequencial = await proximoNumeroSequencial("proposta");
  const pdf = await gerarPdf(textoCompleto);
  const { arquivoPdf } = await salvarArquivoProposta(numeroSequencial, pdf);

  const proposta = await prisma.proposta.create({
    data: {
      clienteId,
      numeroSequencial,
      contratanteNomeSnapshot: dados.contratanteNome,
      contratanteCpfCnpjSnapshot: dados.contratanteCpfCnpj,
      enderecoSnapshot: dados.contratanteEndereco,
      valorFinal: dados.valor,
      vigenciaMeses: dados.vigenciaMeses,
      multaTexto: dados.multaDescricao,
      servicosSnapshot: dados.servicosSelecionados.join(", "),
      textoCompleto,
      arquivoPdf,
    },
  });

  return { sucesso: true, propostaId: proposta.id };
}

export async function gerarContratoAction(
  clienteId: string,
  overrides: OverridesEditaveis
): Promise<GerarContratoResultado> {
  const cliente = await buscarClienteParaContrato(clienteId);
  if (!cliente || !cliente.regimeTributario || cliente.servicos.length === 0) {
    return { sucesso: false, erro: "Cliente sem regime, serviços ou plano definidos" };
  }

  const clausulas = await buscarClausulasModelo(cliente.regimeTributario.slug);
  const dados = { ...montarDadosContrato(cliente), ...overrides };
  const textoCompleto = renderContrato(cliente.regimeTributario.slug, dados, clausulas);

  const numeroSequencial = await proximoNumeroSequencial("contrato");

  const [pdf, docx] = await Promise.all([
    gerarPdf(textoCompleto),
    gerarDocx(textoCompleto),
  ]);

  const { arquivoPdf, arquivoDocx } = await salvarArquivosContrato(
    numeroSequencial,
    pdf,
    docx
  );

  const contrato = await prisma.contrato.create({
    data: {
      clienteId,
      numeroSequencial,
      regimeSlug: cliente.regimeTributario.slug,
      contratanteNomeSnapshot: dados.contratanteNome,
      contratanteCpfCnpjSnapshot: dados.contratanteCpfCnpj,
      enderecoSnapshot: dados.contratanteEndereco,
      valorFinal: dados.valor,
      vigenciaMeses: dados.vigenciaMeses,
      multaTexto: dados.multaDescricao,
      servicosSnapshot: dados.servicosSelecionados.join(", "),
      textoCompleto,
      arquivoPdf,
      arquivoDocx,
    },
  });

  return { sucesso: true, contratoId: contrato.id };
}
