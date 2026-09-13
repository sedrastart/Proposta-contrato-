"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

type Contagens = {
  clientes: number;
  propostas: number;
  contratos: number;
};

export function AppShell({
  children,
  contagens,
}: {
  children: React.ReactNode;
  contagens: Contagens;
}) {
  const pathname = usePathname();

  // "/" (login) e "/m/..." (fluxo simplificado pra celular, sem menu lateral
  // — a barra fixa de 232px não cabe numa tela de telefone) ficam sem o
  // shell administrativo.
  if (pathname === "/" || pathname.startsWith("/m")) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-1">
      <Sidebar contagens={contagens} />
      <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
