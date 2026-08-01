import { renderContrato } from "@/lib/templates";
import { gerarPdf } from "@/lib/documentos/pdf";
import { buscarPreviewModelo } from "@/lib/documentos/preview-modelo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modeloParam = searchParams.get("modelo") ?? "geral";

  const { regimeSlug, dados, clausulas } = await buscarPreviewModelo(modeloParam);
  const texto = renderContrato(regimeSlug, dados, clausulas);
  const pdf = await gerarPdf(texto);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="preview-${regimeSlug}.pdf"`,
    },
  });
}
