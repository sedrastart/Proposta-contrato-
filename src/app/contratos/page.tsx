import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_CONTRATO_LABEL, type StatusContrato } from "@/lib/contrato-status";

export const dynamic = "force-dynamic";

export default async function ContratosPage() {
  const contratos = await prisma.contrato.findMany({
    orderBy: { numeroSequencial: "desc" },
    include: { cliente: { select: { id: true, razaoSocial: true } } },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink">Contratos</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {contratos.length} contrato{contratos.length !== 1 && "s"} emitido
        {contratos.length !== 1 && "s"} no total.
      </p>

      {contratos.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-muted">
          Nenhum contrato emitido ainda.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Número</th>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Emitido em</th>
                <th className="px-4 py-2 font-medium">Valor</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {contratos.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2 font-mono text-ink">
                    <Link
                      href={`/clientes/${c.clienteId}/contratos/${c.id}`}
                      className="hover:underline"
                    >
                      {String(c.numeroSequencial).padStart(6, "0")}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/clientes/${c.clienteId}`} className="hover:underline">
                      {c.cliente.razaoSocial}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-ink-muted">
                    {new Intl.DateTimeFormat("pt-BR").format(c.dataEmissao)}
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{c.valorFinal}</td>
                  <td className="px-4 py-2 text-ink-muted">
                    {STATUS_CONTRATO_LABEL[c.status as StatusContrato] ?? c.status}
                  </td>
                  <td className="px-4 py-2">
                    <a href={`/api/contratos/${c.id}/pdf`} className="text-ink hover:underline">
                      PDF
                    </a>
                    <span className="mx-1.5 text-ink-muted">·</span>
                    <a href={`/api/contratos/${c.id}/docx`} className="text-ink hover:underline">
                      DOCX
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
