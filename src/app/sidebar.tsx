"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOGO_SEDRA_COMPLETO_PNG_BASE64 } from "@/lib/documentos/marca-assets";

type Contagens = {
  clientes: number;
  propostas: number;
  contratos: number;
};

const ICONES = {
  painel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  clientes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  propostas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  ),
  contratos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  ),
};

export function Sidebar({ contagens }: { contagens: Contagens }) {
  const pathname = usePathname();

  const itens = [
    { href: "/painel", label: "Painel", icone: ICONES.painel, ativo: pathname === "/painel" },
    { href: "/clientes", label: "Clientes", icone: ICONES.clientes, ativo: pathname.startsWith("/clientes"), contagem: contagens.clientes },
    { href: "/propostas", label: "Propostas", icone: ICONES.propostas, ativo: pathname.startsWith("/propostas"), contagem: contagens.propostas },
    { href: "/contratos", label: "Contratos", icone: ICONES.contratos, ativo: pathname.startsWith("/contratos"), contagem: contagens.contratos },
  ];

  return (
    <aside className="flex w-[232px] flex-none flex-col gap-7 border-r border-line bg-white px-4 py-6">
      <Link href="/painel" className="flex items-center gap-2.5 px-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${LOGO_SEDRA_COMPLETO_PNG_BASE64}`}
          alt="Sedra"
          className="h-8 w-8 object-contain"
        />
        <span className="flex flex-col leading-tight">
          <strong className="font-serif text-[15px] tracking-wide text-ink">SEDRA</strong>
          <span className="text-[10px] tracking-wide text-ink-muted">
            PROPOSTAS &amp; CONTRATOS
          </span>
        </span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {itens.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium ${
              item.ativo
                ? "bg-accent text-white"
                : "text-ink-muted hover:bg-accent-soft hover:text-ink"
            }`}
          >
            <span className={`h-4 w-4 flex-none ${item.ativo ? "opacity-100" : "opacity-80"}`}>
              {item.icone}
            </span>
            {item.label}
            {typeof item.contagem === "number" && (
              <span className="ml-auto text-[11px] opacity-70">{item.contagem}</span>
            )}
          </Link>
        ))}
      </nav>

      <nav className="flex flex-col gap-0.5">
        <p className="px-2.5 pb-1.5 text-[10.5px] uppercase tracking-wide text-ink-muted/70">
          Configuração
        </p>
        <Link
          href="/admin"
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium ${
            pathname.startsWith("/admin")
              ? "bg-accent text-white"
              : "text-ink-muted hover:bg-accent-soft hover:text-ink"
          }`}
        >
          <span className={`h-4 w-4 flex-none ${pathname.startsWith("/admin") ? "opacity-100" : "opacity-80"}`}>
            {ICONES.admin}
          </span>
          Área administrativa
        </Link>
      </nav>
    </aside>
  );
}
