import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EscolherClienteDuplicar } from "./escolher-cliente-duplicar";

export const dynamic = "force-dynamic";
// duplicarPropostaAction gera um PDF novo (capa + conteudo) - mais lento
// que o limite padrao da funcao serverless (10s no plano Hobby).
export const maxDuration = 60;

export default async function DuplicarPropostaPage({
  params,
}: {
  params: Promise<{ id: string; propostaId: string }>;
}) {
  const { propostaId } = await params;

  const [proposta, clientes] = await Promise.all([
    prisma.proposta.findUnique({
      where: { id: propostaId },
      select: { id: true, numeroSequencial: true, clienteId: true },
    }),
    prisma.cliente.findMany({
      where: {
        regimeTributarioId: { not: null },
        servicos: { some: {} },
      },
      orderBy: { razaoSocial: "asc" },
      select: { id: true, razaoSocial: true, nomeFantasia: true, cpfCnpj: true },
    }),
  ]);
  if (!proposta) notFound();

  const numero = String(proposta.numeroSequencial).padStart(6, "0");

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link
        href={`/clientes/${proposta.clienteId}/propostas/${proposta.id}`}
        className="text-sm text-ink-muted hover:underline"
      >
        ← Voltar
      </Link>

      <h1 className="mt-2 text-2xl font-semibold text-ink">
        Duplicar proposta nº {numero}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Escolha pra quem essa proposta vai ser duplicada — pode ser o mesmo
        cliente ou outro com regime/serviços parecidos. O texto e as
        condições são copiados; nome e CNPJ dentro do texto são atualizados
        automaticamente se você trocar de cliente.
      </p>

      <div className="mt-6">
        {clientes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-muted">
            Nenhum cliente com regime e serviços definidos ainda.
          </div>
        ) : (
          <EscolherClienteDuplicar
            propostaId={proposta.id}
            clienteOrigemId={proposta.clienteId}
            clientes={clientes}
          />
        )}
      </div>
    </main>
  );
}
