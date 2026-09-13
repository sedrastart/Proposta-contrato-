import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buscarClienteParaContrato, montarDadosContrato } from "@/lib/contrato-dados";
import { TituloEtapa } from "../../mobile-ui";
import { ContratoMobileStep } from "./contrato-mobile-step";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function ContratoMobilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [cliente, propostas] = await Promise.all([
    buscarClienteParaContrato(id),
    prisma.proposta.findMany({
      where: { clienteId: id },
      orderBy: { numeroSequencial: "desc" },
      select: { id: true, numeroSequencial: true, status: true, valorFinal: true },
    }),
  ]);
  if (!cliente) notFound();

  if (!cliente.regimeTributario || cliente.servicos.length === 0) {
    return (
      <div>
        <Link href="/m" className="text-sm text-ink-muted hover:underline">
          ← Início
        </Link>
        <div className="mt-6 rounded-lg border border-dashed border-line p-6 text-sm text-ink-muted">
          Defina regime, serviços e plano antes de gerar o contrato.
          <br />
          <Link href={`/m/${cliente.id}/comercial`} className="text-accent hover:underline">
            Ir para regime e serviços →
          </Link>
        </div>
      </div>
    );
  }

  const dados = montarDadosContrato(cliente);
  const propostaOrigem = propostas[0] ?? null;

  return (
    <div>
      <Link href="/m" className="text-sm text-ink-muted hover:underline">
        ← {cliente.razaoSocial}
      </Link>
      <TituloEtapa
        passo={4}
        total={4}
        titulo="Gerar contrato"
        descricao="Confira os campos e gere o PDF/DOCX final."
      />
      <ContratoMobileStep
        clienteId={cliente.id}
        dadosIniciais={dados}
        propostaOrigem={propostaOrigem}
      />
    </div>
  );
}
