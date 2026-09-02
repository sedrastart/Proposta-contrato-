"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  buscarClienteParaProposta,
  montarDadosProposta,
} from "@/lib/contrato-dados";
import { proximoNumeroSequencial } from "@/lib/numero-sequencial";
import { gerarPdf } from "@/lib/documentos/pdf";
import { salvarArquivoProposta } from "@/lib/documentos/armazenamento";
import { ehStatusProposta } from "@/lib/proposta-status";

export type CriarPropostaResultado =
  | { sucesso: true; propostaId: string }
  | { sucesso: false; erro: string };

function revalidar(clienteId: string, propostaId?: string) {
  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/propostas");
  if (propostaId) revalidatePath(`/clientes/${clienteId}/propostas/${propostaId}`);
}

/** Cria uma proposta a partir do cliente — exige só regime + ao menos um
 * serviço selecionado, sem exigir plano definido (diferente do contrato). */
export async function criarPropostaAction(
  clienteId: string,
  textoCompleto: string
): Promise<CriarPropostaResultado> {
  const cliente = await buscarClienteParaProposta(clienteId);
  if (!cliente || !cliente.regimeTributario || cliente.servicos.length === 0) {
    return { sucesso: false, erro: "Cliente sem regime ou serviços definidos" };
  }
  if (!textoCompleto.trim()) {
    return { sucesso: false, erro: "O texto da proposta não pode estar vazio" };
  }

  const dados = montarDadosProposta(cliente);

  const numeroSequencial = await proximoNumeroSequencial("proposta");
  const dataEmissao = new Date();
  const pdf = await gerarPdf(textoCompleto, "proposta", {
    clienteNome: dados.contratanteNome,
    numeroSequencial,
    dataEmissao,
  });
  const { arquivoPdf } = await salvarArquivoProposta(numeroSequencial, pdf);

  const proposta = await prisma.proposta.create({
    data: {
      clienteId,
      numeroSequencial,
      dataEmissao,
      status: "rascunho",
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
    },
  });

  revalidar(clienteId, proposta.id);
  return { sucesso: true, propostaId: proposta.id };
}

export async function atualizarStatusPropostaAction(propostaId: string, status: string) {
  if (!ehStatusProposta(status)) throw new Error("Status inválido");

  const proposta = await prisma.proposta.update({
    where: { id: propostaId },
    data: { status },
  });

  revalidar(proposta.clienteId, propostaId);
}

export type AtualizarTextoResultado = { sucesso: true } | { sucesso: false; erro: string };

/** Regrava o texto da proposta e reemite o PDF (mesmo numeroSequencial —
 * o arquivo anterior é sobrescrito no storage). Não altera o status. */
export async function atualizarTextoPropostaAction(
  propostaId: string,
  textoCompleto: string
): Promise<AtualizarTextoResultado> {
  if (!textoCompleto.trim()) {
    return { sucesso: false, erro: "O texto da proposta não pode estar vazio" };
  }

  const proposta = await prisma.proposta.findUniqueOrThrow({ where: { id: propostaId } });
  const pdf = await gerarPdf(textoCompleto, "proposta", {
    clienteNome: proposta.contratanteNomeSnapshot,
    numeroSequencial: proposta.numeroSequencial,
    dataEmissao: proposta.dataEmissao,
  });
  const { arquivoPdf } = await salvarArquivoProposta(proposta.numeroSequencial, pdf);

  await prisma.proposta.update({
    where: { id: propostaId },
    data: { textoCompleto, arquivoPdf },
  });

  revalidar(proposta.clienteId, propostaId);
  return { sucesso: true };
}

/** Cria uma nova proposta (rascunho) copiando texto e dados comerciais da
 * proposta de origem — agiliza quando o mesmo tipo de proposta se repete.
 * `clienteDestinoId` permite duplicar pra outro cliente (perfil parecido);
 * quando omitido, duplica pro mesmo cliente da origem. Ao trocar de
 * cliente, troca também o nome/CNPJ que aparecem dentro do texto (a
 * ocorrência literal do nome/CNPJ antigo é substituída pelo novo — revise
 * o texto se a proposta original tiver sido editada de forma incomum).
 * Gera um novo número sequencial e um novo PDF. */
export async function duplicarPropostaAction(
  propostaId: string,
  clienteDestinoId?: string
): Promise<CriarPropostaResultado> {
  const origem = await prisma.proposta.findUniqueOrThrow({ where: { id: propostaId } });

  const destinoId = clienteDestinoId ?? origem.clienteId;
  const clienteDestino = await buscarClienteParaProposta(destinoId);
  if (!clienteDestino || !clienteDestino.regimeTributario || clienteDestino.servicos.length === 0) {
    return { sucesso: false, erro: "Cliente de destino sem regime ou serviços definidos" };
  }

  const dados = montarDadosProposta(clienteDestino);
  const mudouCliente = destinoId !== origem.clienteId;
  const textoCompleto = mudouCliente
    ? origem.textoCompleto
        .split(origem.contratanteNomeSnapshot)
        .join(dados.contratanteNome)
        .split(origem.contratanteCpfCnpjSnapshot)
        .join(dados.contratanteCpfCnpj)
    : origem.textoCompleto;

  const numeroSequencial = await proximoNumeroSequencial("proposta");
  const dataEmissao = new Date();
  const pdf = await gerarPdf(textoCompleto, "proposta", {
    clienteNome: dados.contratanteNome,
    numeroSequencial,
    dataEmissao,
  });
  const { arquivoPdf } = await salvarArquivoProposta(numeroSequencial, pdf);

  const nova = await prisma.proposta.create({
    data: {
      clienteId: destinoId,
      numeroSequencial,
      dataEmissao,
      status: "rascunho",
      regimeSlug: clienteDestino.regimeTributario.slug,
      contratanteNomeSnapshot: dados.contratanteNome,
      contratanteCpfCnpjSnapshot: dados.contratanteCpfCnpj,
      enderecoSnapshot: dados.contratanteEndereco,
      valorFinal: origem.valorFinal,
      vigenciaMeses: origem.vigenciaMeses,
      multaTexto: origem.multaTexto,
      servicosSnapshot: origem.servicosSnapshot,
      textoCompleto,
      arquivoPdf,
    },
  });

  revalidar(nova.clienteId, nova.id);
  return { sucesso: true, propostaId: nova.id };
}

/** Exclui a proposta definitivamente. Se um contrato já foi gerado a partir
 * dela, o contrato continua existindo — só perde a referência de origem
 * (ON DELETE SET NULL). Não remove o PDF já salvo no Storage. */
export async function excluirPropostaAction(propostaId: string) {
  const proposta = await prisma.proposta.delete({ where: { id: propostaId } });
  revalidar(proposta.clienteId);
}
