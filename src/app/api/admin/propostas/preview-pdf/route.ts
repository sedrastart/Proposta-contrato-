import { renderPropostaDraft } from "@/lib/templates";
import { gerarPdf } from "@/lib/documentos/pdf";
import { buscarPreviewModeloProposta } from "@/lib/documentos/preview-modelo";

export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modeloParam = searchParams.get("modelo") ?? "simples-nacional";

  const preview = await buscarPreviewModeloProposta(modeloParam);
  if (!preview) {
    return new Response(`Nenhum modelo de proposta encontrado para "${modeloParam}"`, {
      status: 404,
    });
  }

  const { regimeSlug, dados, corpo } = preview;
  const texto = renderPropostaDraft(corpo, dados);
  const pdf = await gerarPdf(texto, "proposta", {
    clienteNome: dados.contratanteNome,
    numeroSequencial: 0,
    dataEmissao: new Date(),
    validadeDias: dados.validadeDias,
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="preview-proposta-${regimeSlug}.pdf"`,
    },
  });
}
