import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCpfCnpj } from "@/lib/format";
import { BotaoExcluirCliente } from "./botao-excluir-cliente";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { criadoEm: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Clientes</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {clientes.length} cliente{clientes.length !== 1 && "s"} cadastrado
            {clientes.length !== 1 && "s"}
          </p>
        </div>
        <Link
          href="/clientes/novo"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Novo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500">
          Nenhum cliente cadastrado ainda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome / Razão Social</th>
                <th className="px-4 py-3 font-medium">CPF/CNPJ</th>
                <th className="px-4 py-3 font-medium">Cidade/UF</th>
                <th className="px-4 py-3 font-medium">Cadastrado em</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/clientes/${cliente.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {cliente.razaoSocial}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-600">
                    {formatCpfCnpj(cliente.cpfCnpj)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {cliente.enderecoCidade}/{cliente.enderecoUf}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Intl.DateTimeFormat("pt-BR").format(cliente.criadoEm)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <BotaoExcluirCliente
                      clienteId={cliente.id}
                      nomeCliente={cliente.razaoSocial}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
