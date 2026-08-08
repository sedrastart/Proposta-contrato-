import { prisma } from "@/lib/prisma";
import { formatCpfCnpj, currency, dataExtenso } from "@/lib/format";
import type { DadosContrato, ClausulaRenderavel } from "@/lib/templates";

/** Cláusulas ativas do modelo de contrato daquele regime, na ordem de
 * exibição no documento — cada regime (Simples Nacional, MEI, Lucro
 * Presumido, Lucro Real, Serviços Avulsos, Consultoria) tem seu próprio
 * ModeloContrato, com o mesmo slug do regime. */
export async function buscarClausulasModelo(
  regimeSlug: string
): Promise<ClausulaRenderavel[]> {
  return prisma.clausulaModelo.findMany({
    where: { modeloContrato: { slug: regimeSlug }, ativo: true },
    orderBy: { ordem: "asc" },
    select: { tipo: true, titulo: true, corpo: true },
  });
}

export async function buscarClienteParaContrato(clienteId: string) {
  return prisma.cliente.findUnique({
    where: { id: clienteId },
    include: {
      regimeTributario: true,
      servicos: {
        where: { planoId: { not: null } },
        include: {
          servico: true,
          plano: { include: { limites: { include: { faixas: { orderBy: { ordem: "asc" } } } } } },
        },
      },
    },
  });
}

export type ClienteParaContrato = NonNullable<
  Awaited<ReturnType<typeof buscarClienteParaContrato>>
>;

/** Monta os dados-base do contrato a partir do cliente — antes da aplicação dos 6 overrides editáveis. */
export function montarDadosContrato(cliente: ClienteParaContrato): DadosContrato {
  const valorTotal = cliente.servicos.reduce(
    (soma, s) => soma + (s.plano?.valor ?? 0),
    0
  );

  const planoAncora =
    cliente.servicos.find((s) => s.servico.nome === "Contabilidade")?.plano ??
    cliente.servicos[0].plano!;

  return {
    contratanteNome: cliente.razaoSocial,
    contratanteCpfCnpj: formatCpfCnpj(cliente.cpfCnpj),
    contratanteEndereco: `${cliente.enderecoLogradouro}, ${cliente.enderecoNumero}${
      cliente.enderecoComplemento ? " - " + cliente.enderecoComplemento : ""
    } - ${cliente.enderecoBairro}, ${cliente.enderecoCidade}/${cliente.enderecoUf}`,
    contratanteCidadeUf: `${cliente.enderecoCidade}/${cliente.enderecoUf}`,
    contratanteCep: cliente.enderecoCep.replace(/(\d{5})(\d{3})/, "$1-$2"),
    responsavelNome: cliente.responsavelNome ?? undefined,
    responsavelCpf: cliente.responsavelCpf ? formatCpfCnpj(cliente.responsavelCpf) : undefined,
    valor: currency.format(valorTotal),
    vigenciaMeses: planoAncora.vigenciaMeses,
    multaDescricao: planoAncora.multaDescricao ?? "não possui",
    condicaoPagamento: formatarCondicaoPagamento(planoAncora.condicaoPagamento, planoAncora.parcelas),
    dataEmissaoExtenso: dataExtenso(new Date()),
    cidadeEmissao: "São Paulo",
    servicosSelecionados: cliente.servicos.map((s) => s.servico.nome),
    limitesUso: planoAncora.limites.map((l) => ({
      unidade: l.unidade,
      quantidade: l.quantidade,
      tipoCobranca: l.tipoCobranca,
      valorPorUnidade: l.valorPorUnidade != null ? currency.format(l.valorPorUnidade) : undefined,
      faixas: l.faixas.map((f) => ({
        percentualAte: f.percentualAte,
        valorAdicional: currency.format(f.valorAdicional),
      })),
    })),
  };
}

export function formatarCondicaoPagamento(condicao: string, parcelas: number): string {
  return condicao === "parcelado" ? `parcelado em ${parcelas}x` : "à vista";
}

export type OverridesEditaveis = {
  contratanteNome: string;
  contratanteCpfCnpj: string;
  contratanteEndereco: string;
  valor: string;
  vigenciaMeses: number;
  multaDescricao: string;
  condicaoPagamento: string;
};
