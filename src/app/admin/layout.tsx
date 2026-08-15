import Link from "next/link";

const ABAS = [
  { href: "/admin", label: "Início" },
  { href: "/admin/regimes", label: "Regimes" },
  { href: "/admin/servicos", label: "Serviços" },
  { href: "/admin/planos", label: "Planos" },
  { href: "/admin/contratos", label: "Contratos" },
  { href: "/admin/propostas", label: "Propostas" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-1 px-6">
          {ABAS.map((aba) => (
            <Link
              key={aba.href}
              href={aba.href}
              className="border-b-2 border-transparent px-3 py-3 text-sm font-medium text-ink-muted hover:border-line hover:text-ink"
            >
              {aba.label}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
