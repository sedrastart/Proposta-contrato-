import { prisma } from "@/lib/prisma";
import { lerArquivoArmazenado } from "@/lib/documentos/armazenamento";

const CONTENT_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; tipo: string }> }
) {
  const { id, tipo } = await params;

  if (tipo !== "pdf" && tipo !== "docx") {
    return new Response("Tipo inválido", { status: 400 });
  }

  const contrato = await prisma.contrato.findUnique({ where: { id } });
  if (!contrato) {
    return new Response("Contrato não encontrado", { status: 404 });
  }

  const referencia = tipo === "pdf" ? contrato.arquivoPdf : contrato.arquivoDocx;
  if (!referencia) {
    return new Response("Arquivo não disponível", { status: 404 });
  }

  const conteudo = await lerArquivoArmazenado(referencia);
  const numero = String(contrato.numeroSequencial).padStart(6, "0");

  return new Response(new Uint8Array(conteudo), {
    headers: {
      "Content-Type": CONTENT_TYPES[tipo],
      "Content-Disposition": `attachment; filename="contrato-${numero}.${tipo}"`,
    },
  });
}
