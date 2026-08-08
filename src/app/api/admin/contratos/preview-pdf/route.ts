import { renderContrato } from "@/lib/templates";
import { gerarPdf } from "@/lib/documentos/pdf";
import { buscarPreviewModelo } from "@/lib/documentos/preview-modelo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modeloParam = searchParams.get("modelo") ?? "simples-nacional";

  const preview = await buscarPreviewModelo(modeloParam);
  if (!preview) {
    return new Response(`Nenhum modelo de contrato encontrado para "${modeloParam}"`, {
      status: 404,
    });
  }

  const { regimeSlug, dados, clausulas } = preview;
  const texto = renderContrato(regimeSlug, dados, clausulas);
  const pdf = await gerarPdf(texto);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="preview-${regimeSlug}.pdf"`,
    },
  });
}
