import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCpfCnpj } from "@/lib/format";
import { BotaoExcluirCliente } from "./botao-excluir-cliente";

export const dynamic = "force-dynamic";

function proximaAcao(cliente: {
  id: string;
  regimeTributarioId: string | null;
  servicos: { planoId: string | null }[];
  propostas: { id: string; status: string }[];
  contratos: { id: string }[];
}) {
  if (cliente.contratos[0]) {
    return { label: "Ver contrato →", href: `/clientes/${cliente.id}/contratos/${cliente.contratos[0].id}` };
  }
  const ultimaProposta = cliente.propostas[0];
  if (ultimaProposta?.status === "aceita") {
    return { label: "Gerar contrato →", href: `/clientes/${cliente.id}/previa?propostaId=${ultimaProposta.id}` };
  }
  if (ultimaProposta) {
    return { label: "Ver proposta →", href: `/clientes/${cliente.id}/propostas/${ultimaProposta.id}` };
  }
  if (cliente.regimeTributarioId && cliente.servicos.length > 0) {
    return { label: "Nova proposta →", href: `/clientes/${cliente.id}/propostas/nova` };
  }
  return { label: "Completar cadastro →", href: `/clientes/${cliente.id}` };
}

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      servicos: { select: { planoId: true } },
      propostas: { orderBy: { numeroSequencial: "desc" }, take: 1, select: { id: true, status: true } },
      contratos: { orderBy: { numeroSequencial: "desc" }, take: 1, select: { id: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Clientes</h1>
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
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nome / Razão Social</th>
                <th className="px-4 py-3 font-medium">CPF/CNPJ</th>
                <th className="px-4 py-3 font-medium">Cidade/UF</th>
                <th className="px-4 py-3 font-medium">Cadastrado em</th>
                <th className="px-4 py-3 font-medium">Próximo passo</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clientes.map((cliente) => {
                const acao = proximaAcao(cliente);
                return (
                  <tr key={cliente.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {cliente.razaoSocial}
                      </Link>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink-muted">
                      {formatCpfCnpj(cliente.cpfCnpj)}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {cliente.enderecoCidade}/{cliente.enderecoUf}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {new Intl.DateTimeFormat("pt-BR").format(cliente.criadoEm)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={acao.href}
                        className="rounded-md border border-accent-soft bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent hover:brightness-95"
                      >
                        {acao.label}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <BotaoExcluirCliente
                        clienteId={cliente.id}
                        nomeCliente={cliente.razaoSocial}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
