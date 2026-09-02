import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCpfCnpj } from "@/lib/format";
import { ClientesLista } from "./clientes-lista";

export const dynamic = "force-dynamic";

function statusCadastro(cliente: {
  id: string;
  regimeTributarioId: string | null;
  servicos: { planoId: string | null }[];
}) {
  if (!cliente.regimeTributarioId || cliente.servicos.length === 0) {
    return { label: "Completar cadastro →", completo: false, href: `/clientes/${cliente.id}` };
  }
  if (!cliente.servicos.some((cs) => cs.planoId)) {
    return { label: "Definir plano →", completo: false, href: `/clientes/${cliente.id}` };
  }
  return { label: "Cadastro completo", completo: true, href: `/clientes/${cliente.id}` };
}

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      servicos: { select: { planoId: true } },
    },
  });

  const clientesFormatados = clientes.map((cliente) => ({
    id: cliente.id,
    razaoSocial: cliente.razaoSocial,
    cpfCnpjFormatado: formatCpfCnpj(cliente.cpfCnpj),
    cidadeUf: `${cliente.enderecoCidade}/${cliente.enderecoUf}`,
    cadastradoEmFormatado: new Intl.DateTimeFormat("pt-BR").format(cliente.criadoEm),
    status: statusCadastro(cliente),
  }));

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Cadastro de Clientes</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {clientes.length} cliente{clientes.length !== 1 && "s"} cadastrado
            {clientes.length !== 1 && "s"}
          </p>
        </div>
        <Link
          href="/clientes/novo"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          + Novo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-muted">
          Nenhum cliente cadastrado ainda.
        </div>
      ) : (
        <ClientesLista clientes={clientesFormatados} />
      )}
    </main>
  );
}
