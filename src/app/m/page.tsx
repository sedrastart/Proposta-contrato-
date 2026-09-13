import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ClienteResumo = Awaited<ReturnType<typeof buscarClientesRecentes>>[number];

async function buscarClientesRecentes() {
  return prisma.cliente.findMany({
    orderBy: { criadoEm: "desc" },
    take: 8,
    select: {
      id: true,
      razaoSocial: true,
      regimeTributarioId: true,
      servicos: { select: { planoId: true } },
      propostas: { select: { id: true } },
      contratos: { select: { id: true } },
    },
  });
}

function proximoPasso(cliente: ClienteResumo) {
  const temPlano = cliente.servicos.some((s) => s.planoId);
  if (!cliente.regimeTributarioId || !temPlano) {
    return { href: `/m/${cliente.id}/comercial`, label: "Definir regime e plano" };
  }
  if (cliente.propostas.length === 0) {
    return { href: `/m/${cliente.id}/proposta`, label: "Gerar proposta" };
  }
  if (cliente.contratos.length === 0) {
    return { href: `/m/${cliente.id}/contrato`, label: "Gerar contrato" };
  }
  return { href: `/m/${cliente.id}/contrato`, label: "Concluído ✓" };
}

export default async function MobileHomePage() {
  const clientes = await buscarClientesRecentes();

  return (
    <div>
      <Link
        href="/m/novo"
        className="flex items-center justify-center rounded-xl bg-accent px-4 py-4 text-base font-semibold text-white shadow-sm hover:brightness-110"
      >
        + Novo cliente
      </Link>

      {clientes.length > 0 && (
        <div className="mt-8">
          <p className="mb-2 text-xs uppercase tracking-wide text-ink-muted">
            Continuar um cadastro
          </p>
          <div className="space-y-2">
            {clientes.map((cliente) => {
              const passo = proximoPasso(cliente);
              return (
                <Link
                  key={cliente.id}
                  href={passo.href}
                  className="block rounded-lg border border-line bg-white px-4 py-3 hover:border-accent"
                >
                  <p className="text-sm font-medium text-ink">{cliente.razaoSocial}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{passo.label}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
