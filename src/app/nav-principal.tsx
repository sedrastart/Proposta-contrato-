import Link from "next/link";

export function NavPrincipal() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-sm font-semibold text-neutral-900">
          Sedra · Propostas e Contratos
        </Link>
        <nav className="flex gap-4 text-sm font-medium text-neutral-600">
          <Link href="/" className="hover:text-neutral-900">
            Início
          </Link>
          <Link href="/clientes" className="hover:text-neutral-900">
            Clientes
          </Link>
          <Link href="/propostas" className="hover:text-neutral-900">
            Propostas
          </Link>
          <Link href="/contratos" className="hover:text-neutral-900">
            Contratos
          </Link>
          <Link href="/admin" className="hover:text-neutral-900">
            Área administrativa
          </Link>
        </nav>
      </div>
    </div>
  );
}
