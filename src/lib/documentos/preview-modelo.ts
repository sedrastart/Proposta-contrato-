import { prisma } from "@/lib/prisma";
import type { DadosContrato, ClausulaRenderavel } from "@/lib/templates";

// Dados fictícios usados só para a visualização de modelos no admin — não
// correspondem a nenhum cliente real.
export const DADOS_EXEMPLO_GERAL: DadosContrato = {
  contratanteNome: "Empresa Exemplo LTDA",
  contratanteCpfCnpj: "12.345.678/0001-90",
  contratanteEndereco: "Avenida Paulista, 1000 - Bela Vista, São Paulo/SP",
  contratanteCidadeUf: "São Paulo/SP",
  contratanteCep: "01310-100",
  valor: "R$ 199,90",
  vigenciaMeses: 12,
  multaDescricao: "50% do valor das mensalidades vincendas, limitada ao prazo restante do contrato",
  condicaoPagamento: "à vista",
  dataEmissaoExtenso: "1 de agosto de 2026",
  cidadeEmissao: "São Paulo",
  servicosSelecionados: ["Contabilidade", "Departamento Pessoal"],
  limitesUso: [],
};

export const DADOS_EXEMPLO_MEI: DadosContrato = {
  ...DADOS_EXEMPLO_GERAL,
  contratanteNome: "João da Silva Comércio (MEI)",
  contratanteCpfCnpj: "12.345.678/0001-90",
  valor: "R$ 39,90",
  servicosSelecionados: ["Contabilidade"],
  multaDescricao: "50% do valor restante até o término do contrato",
  limitesUso: [
    {
      unidade: "notas fiscais",
      quantidade: 3,
      tipoCobranca: "por_unidade",
      valorPorUnidade: "R$ 5,00",
      faixas: [],
    },
    {
      unidade: "lançamentos",
      quantidade: 50,
      tipoCobranca: "faixa",
      faixas: [
        { percentualAte: 33, valorAdicional: "R$ 9,90" },
        { percentualAte: 66, valorAdicional: "R$ 19,90" },
        { percentualAte: 999, valorAdicional: "R$ 29,90" },
      ],
    },
  ],
};

export async function buscarPreviewModelo(regimeSlug: string): Promise<{
  regimeSlug: string;
  nome: string;
  dados: DadosContrato;
  clausulas: ClausulaRenderavel[];
} | null> {
  const modelo = await prisma.modeloContrato.findUnique({
    where: { slug: regimeSlug },
    select: {
      nome: true,
      clausulas: {
        where: { ativo: true },
        orderBy: { ordem: "asc" },
        select: { tipo: true, titulo: true, corpo: true },
      },
    },
  });
  if (!modelo) return null;

  const dados = regimeSlug === "mei" ? DADOS_EXEMPLO_MEI : DADOS_EXEMPLO_GERAL;
  return { regimeSlug, nome: modelo.nome, dados, clausulas: modelo.clausulas };
}
