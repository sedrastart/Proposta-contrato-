import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RegimeSelector } from "@/app/clientes/[id]/regime-selector";
import { ServicoSelector } from "@/app/clientes/[id]/servico-selector";
import { PlanoSelector } from "@/app/clientes/[id]/plano-selector";
import { TituloEtapa, BarraAcaoFixa } from "../../mobile-ui";

export const dynamic = "force-dynamic";

export default async function ComercialMobilePage({
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
          OR: [{ regimeTributarioId: null }, { regimeTributarioId: cliente.regimeTributarioId }],
        },
        orderBy: { ordem: "asc" },
        include: { limites: { include: { faixas: { orderBy: { ordem: "asc" } } } } },
      })
    : [];

  const podeContinuar =
    cliente.servicos.length > 0 && cliente.servicos.every((s) => s.planoId);

  return (
    <div>
      <Link href="/m" className="text-sm text-ink-muted hover:underline">
        ← {cliente.razaoSocial}
      </Link>
      <TituloEtapa
        passo={2}
        total={4}
        titulo="Regime, serviços e plano"
        descricao="Escolha o regime, os serviços contratados e o plano de cada um."
      />

      <div className="space-y-4">
        <div className="rounded-lg border border-line bg-white p-4">
          <RegimeSelector
            clienteId={cliente.id}
            regimes={regimes}
            regimeAtualId={cliente.regimeTributarioId}
          />
        </div>

        {cliente.regimeTributarioId && (
          <div className="rounded-lg border border-line bg-white p-4">
            <ServicoSelector
              clienteId={cliente.id}
              servicosDisponiveis={servicosDisponiveis}
              servicosSelecionadosIds={servicoIdsSelecionados}
            />
          </div>
        )}

        {cliente.servicos.length > 0 && (
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
        )}
      </div>

      <BarraAcaoFixa>
        {podeContinuar ? (
          <Link
            href={`/m/${cliente.id}/proposta`}
            className="block w-full rounded-lg bg-accent px-4 py-3.5 text-center text-base font-semibold text-white hover:brightness-110"
          >
            Continuar →
          </Link>
        ) : (
          <span className="block w-full rounded-lg bg-neutral-200 px-4 py-3.5 text-center text-base font-semibold text-neutral-500">
            Escolha um plano para cada serviço
          </span>
        )}
      </BarraAcaoFixa>
    </div>
  );
}
