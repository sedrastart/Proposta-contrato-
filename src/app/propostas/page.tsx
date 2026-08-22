import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_PROPOSTA_LABEL, type StatusProposta } from "@/lib/proposta-status";

export const dynamic = "force-dynamic";

export default async function PropostasPage() {
  const propostas = await prisma.proposta.findMany({
    orderBy: { numeroSequencial: "desc" },
    include: { cliente: { select: { id: true, razaoSocial: true } } },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Propostas</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {propostas.length} proposta{propostas.length !== 1 && "s"} emitida
            {propostas.length !== 1 && "s"} no total.
          </p>
        </div>
        <Link
          href="/propostas/nova"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          + Nova proposta
        </Link>
      </div>

      {propostas.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-muted">
          Nenhuma proposta emitida ainda.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Número</th>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Emitida em</th>
                <th className="px-4 py-2 font-medium">Valor</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {propostas.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2 tabular-nums text-ink">
                    <Link
                      href={`/clientes/${p.clienteId}/propostas/${p.id}`}
                      className="hover:underline"
                    >
                      {String(p.numeroSequencial).padStart(6, "0")}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/clientes/${p.clienteId}`} className="hover:underline">
                      {p.cliente.razaoSocial}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-ink-muted">
                    {new Intl.DateTimeFormat("pt-BR").format(p.dataEmissao)}
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{p.valorFinal}</td>
                  <td className="px-4 py-2 text-ink-muted">
                    {STATUS_PROPOSTA_LABEL[p.status as StatusProposta] ?? p.status}
                  </td>
                  <td className="px-4 py-2">
                    <a href={`/api/propostas/${p.id}`} className="text-ink hover:underline">
                      PDF
                    </a>
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
