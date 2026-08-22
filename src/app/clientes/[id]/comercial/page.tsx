import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RegimeSelector } from "../regime-selector";
import { ServicoSelector } from "../servico-selector";
import { PlanoSelector } from "../plano-selector";
import { Stepper, type PassoStepper } from "../stepper";

export const dynamic = "force-dynamic";

export default async function ConfiguracaoComercialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cliente, regimes] = await Promise.all([
    prisma.cliente.findUnique({
      where: { id },
      include: { servicos: { include: { servico: true } } },
    }),
    prisma.regimeTributario.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
    }),
  ]);
  if (!cliente) notFound();

  const passosBrutos = [
    {
      titulo: "Regime e serviços",
      subtitulo: cliente.regimeTributarioId
        ? `${cliente.servicos.length} serviço${cliente.servicos.length === 1 ? "" : "s"}`
        : "Não definido",
      feito: Boolean(cliente.regimeTributarioId) && cliente.servicos.length > 0,
    },
    {
      titulo: "Plano",
      subtitulo: cliente.servicos.some((cs) => cs.planoId) ? "Definido" : "Não definido",
      feito: cliente.servicos.some((cs) => cs.planoId),
    },
  ];
  const primeiroPendente = passosBrutos.findIndex((p) => !p.feito);
  const passos: PassoStepper[] = passosBrutos.map((p, i) => ({
    titulo: p.titulo,
    subtitulo: p.subtitulo,
    estado: p.feito ? "concluida" : i === primeiroPendente ? "atual" : "pendente",
  }));

  const servicosDisponiveis = cliente.regimeTributarioId
    ? await prisma.servico.findMany({
        where: {
          ativo: true,
          regimes: { some: { regimeTributarioId: cliente.regimeTributarioId } },
        },
        orderBy: { ordem: "asc" },
      })
    : [];

  const servicoIdsSelecionados = cliente.servicos.map((s) => s.servicoId);
  const planosPorServico = servicoIdsSelecionados.length
    ? await prisma.plano.findMany({
        where: {
          ativo: true,
          servicoId: { in: servicoIdsSelecionados },
          OR: [
            { regimeTributarioId: null },
            { regimeTributarioId: cliente.regimeTributarioId },
          ],
        },
        orderBy: { ordem: "asc" },
        include: { limites: { include: { faixas: { orderBy: { ordem: "asc" } } } } },
      })
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href={`/clientes/${cliente.id}`} className="text-sm text-ink-muted hover:underline">
        ← {cliente.razaoSocial}
      </Link>

      <h1 className="mt-2 mb-8 text-2xl font-semibold text-ink">
        Configuração comercial
      </h1>

      <Stepper passos={passos} />

      <div className="mt-6 rounded-lg border border-line p-5">
        <RegimeSelector
          clienteId={cliente.id}
          regimes={regimes}
          regimeAtualId={cliente.regimeTributarioId}
        />
      </div>

      {cliente.regimeTributarioId && (
        <div className="mt-4 rounded-lg border border-line p-5">
          <ServicoSelector
            clienteId={cliente.id}
            servicosDisponiveis={servicosDisponiveis}
            servicosSelecionadosIds={servicoIdsSelecionados}
          />
        </div>
      )}

      {cliente.servicos.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-ink-muted">
            Planos
          </p>
          <div className="space-y-3">
            {cliente.servicos.map((cs) => (
              <PlanoSelector
                key={cs.servicoId}
                clienteId={cliente.id}
                servicoId={cs.servicoId}
                servicoNome={cs.servico.nome}
                planos={planosPorServico.filter((p) => p.servicoId === cs.servicoId)}
                planoAtualId={cs.planoId}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
