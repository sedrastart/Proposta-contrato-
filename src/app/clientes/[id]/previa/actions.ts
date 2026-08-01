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
import { salvarArquivosContrato } from "@/lib/documentos/armazenamento";

export type GerarContratoResultado =
  | { sucesso: true; contratoId: string }
  | { sucesso: false; erro: string };

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
