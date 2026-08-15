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

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-1">
      <Sidebar contagens={contagens} />
      <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
