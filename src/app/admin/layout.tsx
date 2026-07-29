import Link from "next/link";

const ABAS = [
  { href: "/admin", label: "Início" },
  { href: "/admin/regimes", label: "Regimes" },
  { href: "/admin/servicos", label: "Serviços" },
  { href: "/admin/planos", label: "Planos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-1 px-6">
          <Link href="/" className="mr-4 py-3 text-sm font-semibold text-neutral-900">
            Sedra · admin
          </Link>
          {ABAS.map((aba) => (
            <Link
              key={aba.href}
              href={aba.href}
              className="border-b-2 border-transparent px-3 py-3 text-sm font-medium text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
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
