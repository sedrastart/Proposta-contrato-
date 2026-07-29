import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const REGIMES = [
  { nome: "MEI", slug: "mei", ordem: 1 },
  { nome: "Simples Nacional", slug: "simples-nacional", ordem: 2 },
  { nome: "Lucro Presumido", slug: "lucro-presumido", ordem: 3 },
  { nome: "Lucro Real", slug: "lucro-real", ordem: 4 },
];

const TODOS_REGIMES = ["mei", "simples-nacional", "lucro-presumido", "lucro-real"];
const REGIMES_GERAIS = ["simples-nacional", "lucro-presumido", "lucro-real"];

// Catálogo com base no escopo original + nos dois contratos reais analisados:
// o MEI (Vinicius) só cobre apoio administrativo/fiscal básico do MEI, sem
// departamento pessoal, escrita fiscal separada ou planejamento tributário —
// isso já vem incluído na guia DAS. Editável depois pela área administrativa.
const SERVICOS = [
  { nome: "Contabilidade", ordem: 1, regimes: TODOS_REGIMES },
  { nome: "Departamento Pessoal", ordem: 2, regimes: REGIMES_GERAIS },
  { nome: "Escrita Fiscal", ordem: 3, regimes: REGIMES_GERAIS },
  { nome: "Abertura de Empresa", ordem: 4, regimes: TODOS_REGIMES },
  { nome: "Alteração Contratual", ordem: 5, regimes: REGIMES_GERAIS },
  { nome: "Encerramento de Empresa", ordem: 6, regimes: TODOS_REGIMES },
  { nome: "Consultoria Tributária", ordem: 7, regimes: REGIMES_GERAIS },
  { nome: "Planejamento Tributário", ordem: 8, regimes: ["lucro-presumido", "lucro-real"] },
  { nome: "BPO Financeiro", ordem: 9, regimes: REGIMES_GERAIS },
  { nome: "Regularização Fiscal", ordem: 10, regimes: TODOS_REGIMES },
  { nome: "Emissão de Certificados", ordem: 11, regimes: TODOS_REGIMES },
  { nome: "Outros", ordem: 12, regimes: TODOS_REGIMES },
];

async function main() {
  for (const regime of REGIMES) {
    await prisma.regimeTributario.upsert({
      where: { slug: regime.slug },
      update: { nome: regime.nome, ordem: regime.ordem },
      create: regime,
    });
  }
  console.log(`Seed ok: ${REGIMES.length} regimes tributários.`);

  const regimesPorSlug = Object.fromEntries(
    (await prisma.regimeTributario.findMany()).map((r) => [r.slug, r.id])
  );

  for (const servico of SERVICOS) {
    const registrado = await prisma.servico.upsert({
      where: { nome: servico.nome },
      update: { ordem: servico.ordem },
      create: { nome: servico.nome, ordem: servico.ordem },
    });

    await prisma.servicoRegime.deleteMany({ where: { servicoId: registrado.id } });
    await prisma.servicoRegime.createMany({
      data: servico.regimes.map((slug) => ({
        servicoId: registrado.id,
        regimeTributarioId: regimesPorSlug[slug],
      })),
    });
  }
  console.log(`Seed ok: ${SERVICOS.length} serviços + disponibilidade por regime.`);

  const contabilidade = await prisma.servico.findUniqueOrThrow({
    where: { nome: "Contabilidade" },
  });

  // Limpa planos antigos do serviço para reseed idempotente.
  await prisma.plano.deleteMany({ where: { servicoId: contabilidade.id } });

  // Plano MEI — replica o contrato real do Vinicius: valor fixo baixo, mas
  // com dois limites de uso mensais independentes e tarifações diferentes.
  const planoMei = await prisma.plano.create({
    data: {
      servicoId: contabilidade.id,
      regimeTributarioId: regimesPorSlug["mei"],
      nome: "Contabilidade MEI — 12 meses",
      valor: 39.9,
      vigenciaMeses: 12,
      multaPercentual: 50,
      multaDescricao: "50% do valor restante até o término do contrato",
      ordem: 1,
      limites: {
        create: [
          {
            unidade: "lançamentos",
            quantidade: 50,
            tipoCobranca: "faixa",
            faixas: {
              create: [
                { percentualAte: 33, valorAdicional: 9.9, ordem: 1 },
                { percentualAte: 66, valorAdicional: 19.9, ordem: 2 },
                { percentualAte: 999, valorAdicional: 29.9, ordem: 3 },
              ],
            },
          },
          {
            unidade: "notas fiscais",
            quantidade: 3,
            tipoCobranca: "por_unidade",
            valorPorUnidade: 5.0,
          },
        ],
      },
    },
  });

  // Planos do regime geral — replicam o contrato do Magno: valor maior,
  // vigência e multa mudam conforme o plano escolhido, sem limite de uso.
  const planoGeral12x = await prisma.plano.create({
    data: {
      servicoId: contabilidade.id,
      regimeTributarioId: regimesPorSlug["simples-nacional"],
      nome: "Contabilidade — 12 meses",
      valor: 199.9,
      vigenciaMeses: 12,
      multaPercentual: 50,
      multaDescricao: "50% do valor das mensalidades vincendas, limitada ao prazo restante do contrato",
      ordem: 1,
    },
  });

  const planoGeralMensal = await prisma.plano.create({
    data: {
      servicoId: contabilidade.id,
      regimeTributarioId: regimesPorSlug["simples-nacional"],
      nome: "Contabilidade — Mensal (sem fidelidade)",
      valor: 299.9,
      vigenciaMeses: 1,
      multaPercentual: null,
      multaDescricao: "Não possui",
      ordem: 2,
    },
  });

  console.log(
    `Seed ok: 3 planos de Contabilidade (${planoMei.nome}, ${planoGeral12x.nome}, ${planoGeralMensal.nome}).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
