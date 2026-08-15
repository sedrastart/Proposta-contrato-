import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  buscarClienteParaContrato,
  buscarClausulasModelo,
  montarDadosContrato,
} from "@/lib/contrato-dados";
import { PreviaEditor } from "./previa-editor";

export const dynamic = "force-dynamic";

export default async function PreviaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ propostaId?: string }>;
}) {
  const { id } = await params;
  const { propostaId } = await searchParams;

  const [cliente, propostas] = await Promise.all([
    buscarClienteParaContrato(id),
    prisma.proposta.findMany({
      where: { clienteId: id },
      orderBy: { numeroSequencial: "desc" },
      select: { id: true, numeroSequencial: true, status: true },
    }),
  ]);
  if (!cliente) notFound();

  if (!cliente.regimeTributario) {
    return (
      <AvisoIncompleto clienteId={cliente.id} texto="Selecione o regime tributário antes de gerar a prévia." />
    );
  }
  if (cliente.servicos.length === 0) {
    return (
      <AvisoIncompleto
        clienteId={cliente.id}
        texto="Selecione ao menos um serviço com plano definido antes de gerar a prévia."
      />
    );
  }

  const dados = montarDadosContrato(cliente);
  const clausulas = await buscarClausulasModelo(cliente.regimeTributario.slug);
  const propostaOrigem = propostaId ? propostas.find((p) => p.id === propostaId) ?? null : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <Link
        href={`/clientes/${cliente.id}`}
        className="text-sm text-ink-muted hover:underline"
      >
        ← {cliente.razaoSocial}
      </Link>
      <p className="mt-2 text-xs uppercase tracking-wide text-ink-muted">
        Etapa 5 de 5 — Prévia
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-ink">
        Prévia do contrato
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Apenas os 7 campos abaixo são editáveis — o restante vem do regime,
        dos serviços e do plano escolhidos.
      </p>

      <PreviaEditor
        clienteId={cliente.id}
        regimeSlug={cliente.regimeTributario.slug}
        dadosIniciais={dados}
        clausulas={clausulas}
        propostaOrigem={propostaOrigem}
        propostas={propostas}
      />
    </main>
  );
}

function AvisoIncompleto({ clienteId, texto }: { clienteId: string; texto: string }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href={`/clientes/${clienteId}`} className="text-sm text-ink-muted hover:underline">
        ← Voltar
      </Link>
      <div className="mt-6 rounded-lg border border-dashed border-line p-6 text-sm text-ink-muted">
        {texto}
      </div>
    </main>
  );
}
