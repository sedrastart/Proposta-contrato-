import Link from "next/link";
import { renderContrato } from "@/lib/templates";
import { buscarPreviewModelo } from "@/lib/documentos/preview-modelo";

export const dynamic = "force-dynamic";

export default async function PreviewModeloContratoPage({
  searchParams,
}: {
  searchParams: Promise<{ modelo?: string }>;
}) {
  const { modelo = "simples-nacional" } = await searchParams;
  const preview = await buscarPreviewModelo(modelo);

  if (!preview) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <Link href="/admin/contratos" className="text-sm text-ink-muted hover:underline">
          ← Voltar para edição
        </Link>
        <div className="mt-6 rounded-lg border border-dashed border-line p-6 text-sm text-ink-muted">
          Nenhum modelo de contrato encontrado para &quot;{modelo}&quot;.
        </div>
      </main>
    );
  }

  const { regimeSlug, nome, dados, clausulas } = preview;
  const texto = renderContrato(regimeSlug, dados, clausulas);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link
        href={`/admin/contratos?modelo=${regimeSlug}`}
        className="text-sm text-ink-muted hover:underline"
      >
        ← Voltar para edição
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">
          Visualização — {nome}
        </h1>
        <a
          href={`/api/admin/contratos/preview-pdf?modelo=${regimeSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          Ver como PDF (com logo e marca d&apos;água) →
        </a>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        Gerado com dados de exemplo (não é um cliente real) — só para
        conferir como fica com as cláusulas atuais. O texto abaixo é só o
        conteúdo bruto; use o botão acima para ver como sai o documento
        oficial (logo, marca d&apos;água, numeração e rodapé).
      </p>

      <div className="mt-6 rounded-lg border border-line bg-white p-6">
        <pre className="max-h-[75vh] overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink">
          {texto}
        </pre>
      </div>
    </main>
  );
}
