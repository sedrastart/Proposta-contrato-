// Peças compartilhadas pelas telas do fluxo /m — inputs maiores (16px pra
// não disparar zoom automático no iOS ao focar) e uma barra de ação fixa
// no rodapé, fácil de alcançar com o polegar em qualquer etapa.

export const campoClass =
  "w-full rounded-lg border border-line bg-white px-3 py-3 text-base text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent";
export const rotuloClass = "mb-1 block text-sm font-medium text-ink";
export const erroClass = "mt-1 text-xs text-red-600";

export function TituloEtapa({
  passo,
  total,
  titulo,
  descricao,
}: {
  passo: number;
  total: number;
  titulo: string;
  descricao?: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-wide text-ink-muted">
        Passo {passo} de {total}
      </p>
      <h1 className="mt-1 text-xl font-semibold text-ink">{titulo}</h1>
      {descricao && <p className="mt-1 text-sm text-ink-muted">{descricao}</p>}
    </div>
  );
}

export function BarraAcaoFixa({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white p-4">
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );
}

export function BotaoPrimario({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      {...rest}
      className="w-full rounded-lg bg-accent px-4 py-3.5 text-base font-semibold text-white hover:brightness-110 disabled:opacity-50"
    >
      {children}
    </button>
  );
}
