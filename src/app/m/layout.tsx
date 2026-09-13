import Link from "next/link";
import { LOGO_SEDRA_COMPLETO_PNG_BASE64 } from "@/lib/documentos/marca-assets";

// Shell próprio do fluxo /m — sem a barra lateral fixa de 232px do painel
// administrativo (ver app-shell.tsx), que não cabe numa tela de celular.
// Coluna única, largura de leitura confortável no polegar, e um respiro
// embaixo (pb-24) pra nenhum passo esconder conteúdo atrás da barra de
// ação fixa que cada etapa desenha no rodapé.
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-4 py-3">
        <Link href="/m" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${LOGO_SEDRA_COMPLETO_PNG_BASE64}`}
            alt="Sedra Consultoria"
            className="h-6 w-auto"
          />
        </Link>
        <Link href="/painel?full=1" className="text-xs text-ink-muted hover:underline">
          Versão completa →
        </Link>
      </header>
      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-5">{children}</main>
    </div>
  );
}
