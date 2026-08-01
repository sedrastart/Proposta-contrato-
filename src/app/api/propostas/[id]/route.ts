import { prisma } from "@/lib/prisma";
import { lerArquivoArmazenado } from "@/lib/documentos/armazenamento";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const proposta = await prisma.proposta.findUnique({ where: { id } });
  if (!proposta) {
    return new Response("Proposta não encontrada", { status: 404 });
  }
  if (!proposta.arquivoPdf) {
    return new Response("Arquivo não disponível", { status: 404 });
  }

  const conteudo = await lerArquivoArmazenado(proposta.arquivoPdf);
  const numero = String(proposta.numeroSequencial).padStart(6, "0");

  return new Response(new Uint8Array(conteudo), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="proposta-${numero}.pdf"`,
    },
  });
}
