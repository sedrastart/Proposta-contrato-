import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PropostaEditor } from "./proposta-editor";

export const dynamic = "force-dynamic";

export default async function PropostaDetalhePage({
  params,
}: {
  params: Promise<{ id: string; propostaId: string }>;
}) {
  const { id, propostaId } = await params;

  const proposta = await prisma.proposta.findUnique({
    where: { id: propostaId },
    include: { contratoGerado: { select: { id: true, numeroSequencial: true } } },
  });
  if (!proposta || proposta.clienteId !== id) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href={`/clientes/${id}`} className="text-sm text-neutral-500 hover:underline">
        ← Voltar ao cliente
      </Link>

      <PropostaEditor
        proposta={{
          id: proposta.id,
          clienteId: proposta.clienteId,
          numeroSequencial: proposta.numeroSequencial,
          status: proposta.status,
          valorFinal: proposta.valorFinal,
          vigenciaMeses: proposta.vigenciaMeses,
          servicosSnapshot: proposta.servicosSnapshot,
          textoCompleto: proposta.textoCompleto,
          dataEmissao: proposta.dataEmissao.toISOString(),
          contratoGerado: proposta.contratoGerado,
        }}
      />
    </main>
  );
}
