import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EscolherCliente } from "./escolher-cliente";

export const dynamic = "force-dynamic";

// Só clientes com regime e ao menos um serviço definidos podem receber uma
// proposta (mesma exigência de /clientes/[id]/propostas/nova) — filtra aqui
// pra não deixar escolher um cliente que ainda vai travar na etapa seguinte.
export default async function EscolherClienteParaPropostaPage() {
  const clientes = await prisma.cliente.findMany({
    where: {
      regimeTributarioId: { not: null },
      servicos: { some: {} },
    },
    orderBy: { razaoSocial: "asc" },
    select: { id: true, razaoSocial: true, nomeFantasia: true, cpfCnpj: true },
  });

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link href="/propostas" className="text-sm text-ink-muted hover:underline">
        ← Propostas
      </Link>

      <h1 className="mt-2 text-2xl font-semibold text-ink">Nova proposta</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Escolha o cliente pra quem a proposta vai ser gerada.
      </p>

      <div className="mt-6">
        {clientes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-muted">
            Nenhum cliente com regime e serviços definidos ainda.
            <br />
            <Link href="/clientes" className="text-accent hover:underline">
              Complete o cadastro de um cliente primeiro →
            </Link>
          </div>
        ) : (
          <EscolherCliente clientes={clientes} />
        )}
      </div>
    </main>
  );
}
