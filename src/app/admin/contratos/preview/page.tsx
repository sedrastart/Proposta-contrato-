import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { renderContrato, type DadosContrato } from "@/lib/templates";

export const dynamic = "force-dynamic";

const DADOS_EXEMPLO_GERAL: DadosContrato = {
  contratanteNome: "Empresa Exemplo LTDA",
  contratanteCpfCnpj: "12.345.678/0001-90",
  contratanteEndereco: "Avenida Paulista, 1000 - Bela Vista, São Paulo/SP",
  contratanteCidadeUf: "São Paulo/SP",
  contratanteCep: "01310-100",
  valor: "R$ 199,90",
  vigenciaMeses: 12,
  multaDescricao: "50% do valor das mensalidades vincendas, limitada ao prazo restante do contrato",
  dataEmissaoExtenso: "1 de agosto de 2026",
  cidadeEmissao: "São Paulo",
  servicosSelecionados: ["Contabilidade", "Departamento Pessoal"],
  limitesUso: [],
};

const DADOS_EXEMPLO_MEI: DadosContrato = {
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

export default async function PreviewModeloContratoPage({
  searchParams,
}: {
  searchParams: Promise<{ modelo?: string }>;
}) {
  const { modelo = "geral" } = await searchParams;
  const regimeSlug = modelo === "mei" ? "mei" : "geral";

  const clausulas = await prisma.clausulaModelo.findMany({
    where: { modeloContrato: { slug: regimeSlug }, ativo: true },
    orderBy: { ordem: "asc" },
    select: { tipo: true, titulo: true, corpo: true },
  });

  const dados = regimeSlug === "mei" ? DADOS_EXEMPLO_MEI : DADOS_EXEMPLO_GERAL;
  const texto = renderContrato(regimeSlug, dados, clausulas);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link
        href={`/admin/contratos?modelo=${regimeSlug}`}
        className="text-sm text-neutral-500 hover:underline"
      >
        ← Voltar para edição
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
        Visualização — {regimeSlug === "mei" ? "Modelo MEI" : "Modelo Geral"}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Gerado com dados de exemplo (não é um cliente real) — só para
        conferir como o texto fica com as cláusulas atuais.
      </p>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <pre className="max-h-[75vh] overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-800">
          {texto}
        </pre>
      </div>
    </main>
  );
}
