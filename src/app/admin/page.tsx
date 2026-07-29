import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHome() {
  const [regimes, servicos, planos] = await Promise.all([
    prisma.regimeTributario.count(),
    prisma.servico.count(),
    prisma.plano.count(),
  ]);

  const cards = [
    { href: "/admin/regimes", label: "Regimes tributários", total: regimes },
    { href: "/admin/servicos", label: "Serviços", total: servicos },
    { href: "/admin/planos", label: "Planos", total: planos },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900">
        Área administrativa
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Cadastre regimes, serviços e planos sem precisar mexer em código.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-neutral-200 p-5 hover:border-neutral-400"
          >
            <p className="text-3xl font-semibold text-neutral-900">{card.total}</p>
            <p className="mt-1 text-sm text-neutral-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-500">
        Os textos de cláusula e modelos de contrato (MEI / regime geral)
        ainda vivem no código-fonte, não no banco — editar o texto jurídico
        em si continua exigindo um deploy. Só o que muda com frequência
        (regimes, serviços, planos, valores, limites) está aqui.
      </div>
    </main>
  );
}
