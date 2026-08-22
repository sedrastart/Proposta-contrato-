"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { clienteSchema, onlyDigits } from "@/lib/validation";
import { buscarEnderecoPorCep } from "@/lib/cep";
import { buscarDadosPorCnpj } from "@/lib/cnpj";

export type CriarClienteState = {
  errors: Record<string, string>;
  values: Record<string, string>;
};

export async function criarClienteAction(
  _prevState: CriarClienteState,
  formData: FormData
): Promise<CriarClienteState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;

  const parsed = clienteSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0])] = issue.message;
    }
    return { errors, values: raw };
  }

  const data = parsed.data;
  const cpfCnpjDigits = onlyDigits(data.cpfCnpj);

  const existente = await prisma.cliente.findUnique({
    where: { cpfCnpj: cpfCnpjDigits },
  });
  if (existente) {
    return {
      errors: { cpfCnpj: "Já existe um cliente cadastrado com este CPF/CNPJ" },
      values: raw,
    };
  }

  const cliente = await prisma.cliente.create({
    data: {
      tipoPessoa: data.tipoPessoa,
      razaoSocial: data.razaoSocial,
      nomeFantasia: data.nomeFantasia || null,
      cpfCnpj: cpfCnpjDigits,
      inscricaoEstadual: data.inscricaoEstadual || null,
      enderecoLogradouro: data.enderecoLogradouro,
      enderecoNumero: data.enderecoNumero,
      enderecoComplemento: data.enderecoComplemento || null,
      enderecoBairro: data.enderecoBairro,
      enderecoCidade: data.enderecoCidade,
      enderecoUf: data.enderecoUf,
      enderecoCep: onlyDigits(data.enderecoCep),
      telefone: data.telefone,
      email: data.email,
      responsavelNome: data.responsavelNome || null,
      responsavelCpf: data.responsavelCpf ? onlyDigits(data.responsavelCpf) : null,
    },
  });

  redirect(`/clientes/${cliente.id}`);
}

export async function buscarCepAction(cep: string) {
  return buscarEnderecoPorCep(cep);
}

export async function buscarCnpjAction(cnpj: string) {
  return buscarDadosPorCnpj(cnpj);
}

export async function definirRegimeAction(
  clienteId: string,
  regimeTributarioId: string
) {
  const regime = await prisma.regimeTributario.findUnique({
    where: { id: regimeTributarioId },
  });
  if (!regime || !regime.ativo) {
    throw new Error("Regime tributário inválido");
  }

  await prisma.cliente.update({
    where: { id: clienteId },
    data: { regimeTributarioId },
  });

  // Serviços já selecionados que não existem mais no catálogo do novo regime
  // (ex.: trocar de Simples Nacional para MEI) deixam de fazer sentido.
  const habilitados = await prisma.servicoRegime.findMany({
    where: { regimeTributarioId },
    select: { servicoId: true },
  });
  const idsHabilitados = habilitados.map((h) => h.servicoId);

  await prisma.clienteServico.deleteMany({
    where: {
      clienteId,
      servicoId: { notIn: idsHabilitados },
    },
  });

  // Planos escolhidos que eram específicos do regime anterior deixam de
  // valer (ex.: plano MEI não existe mais depois de virar Simples Nacional).
  await prisma.clienteServico.updateMany({
    where: {
      clienteId,
      plano: { regimeTributarioId: { not: regimeTributarioId } },
    },
    data: { planoId: null },
  });

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath(`/clientes/${clienteId}/comercial`);
}

export async function atualizarServicosAction(
  clienteId: string,
  servicoIds: string[]
) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: { servicos: true },
  });
  if (!cliente?.regimeTributarioId) {
    throw new Error("Selecione o regime tributário antes de escolher serviços");
  }

  const habilitados = await prisma.servicoRegime.findMany({
    where: { regimeTributarioId: cliente.regimeTributarioId },
    select: { servicoId: true },
  });
  const idsHabilitados = new Set(habilitados.map((h) => h.servicoId));
  const selecionadosValidos = new Set(
    servicoIds.filter((id) => idsHabilitados.has(id))
  );
  const jaSelecionados = new Set(cliente.servicos.map((s) => s.servicoId));

  // Diff em vez de apagar tudo e recriar — preserva o planoId (etapa 4) dos
  // serviços que continuam selecionados.
  const paraRemover = [...jaSelecionados].filter((id) => !selecionadosValidos.has(id));
  const paraAdicionar = [...selecionadosValidos].filter((id) => !jaSelecionados.has(id));

  await prisma.$transaction([
    prisma.clienteServico.deleteMany({
      where: { clienteId, servicoId: { in: paraRemover } },
    }),
    prisma.clienteServico.createMany({
      data: paraAdicionar.map((servicoId) => ({ clienteId, servicoId })),
    }),
  ]);

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath(`/clientes/${clienteId}/comercial`);
}

export type ExcluirClienteResultado =
  | { sucesso: true }
  | { sucesso: false; erro: string };

export async function excluirClienteAction(
  clienteId: string
): Promise<ExcluirClienteResultado> {
  const [totalContratos, totalPropostas] = await Promise.all([
    prisma.contrato.count({ where: { clienteId } }),
    prisma.proposta.count({ where: { clienteId } }),
  ]);
  if (totalContratos > 0 || totalPropostas > 0) {
    const partes: string[] = [];
    if (totalContratos > 0) {
      partes.push(`${totalContratos} contrato${totalContratos !== 1 ? "s" : ""} emitido${totalContratos !== 1 ? "s" : ""}`);
    }
    if (totalPropostas > 0) {
      partes.push(`${totalPropostas} proposta${totalPropostas !== 1 ? "s" : ""} emitida${totalPropostas !== 1 ? "s" : ""}`);
    }
    return {
      sucesso: false,
      erro: `Não é possível excluir: existem ${partes.join(" e ")} para este cliente.`,
    };
  }

  await prisma.cliente.delete({ where: { id: clienteId } });
  revalidatePath("/clientes");
  revalidatePath("/");
  return { sucesso: true };
}

export async function definirPlanoAction(
  clienteId: string,
  servicoId: string,
  planoId: string
) {
  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
  if (!cliente?.regimeTributarioId) {
    throw new Error("Cliente sem regime tributário definido");
  }

  const plano = await prisma.plano.findUnique({ where: { id: planoId } });
  if (
    !plano ||
    !plano.ativo ||
    plano.servicoId !== servicoId ||
    (plano.regimeTributarioId && plano.regimeTributarioId !== cliente.regimeTributarioId)
  ) {
    throw new Error("Plano inválido para este serviço/regime");
  }

  await prisma.clienteServico.update({
    where: { clienteId_servicoId: { clienteId, servicoId } },
    data: { planoId },
  });

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath(`/clientes/${clienteId}/comercial`);
}
