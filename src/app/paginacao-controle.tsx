"use client";

export function PaginacaoControle({
  pagina,
  totalPaginas,
  onMudar,
}: {
  pagina: number;
  totalPaginas: number;
  onMudar: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) return null;
  return (
    <div className="mt-3 flex items-center justify-between text-sm text-ink-muted">
      <button
        type="button"
        onClick={() => onMudar(pagina - 1)}
        disabled={pagina <= 1}
        className="rounded-md border border-line px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-40"
      >
        ← Anterior
      </button>
      <span>
        Página {pagina} de {totalPaginas}
      </span>
      <button
        type="button"
        onClick={() => onMudar(pagina + 1)}
        disabled={pagina >= totalPaginas}
        className="rounded-md border border-line px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-40"
      >
        Próxima →
      </button>
    </div>
  );
}
