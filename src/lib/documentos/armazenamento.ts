import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const STORAGE_ROOT = path.resolve(process.cwd(), "storage", "contratos");

/** Salva o PDF e o DOCX de um contrato emitido no disco local, indexados pelo número sequencial. */
export async function salvarArquivosContrato(
  numeroSequencial: number,
  pdf: Buffer,
  docx: Buffer
): Promise<{ arquivoPdf: string; arquivoDocx: string }> {
  await mkdir(STORAGE_ROOT, { recursive: true });

  const nomeBase = String(numeroSequencial).padStart(6, "0");
  const caminhoPdf = path.join(STORAGE_ROOT, `${nomeBase}.pdf`);
  const caminhoDocx = path.join(STORAGE_ROOT, `${nomeBase}.docx`);

  await Promise.all([writeFile(caminhoPdf, pdf), writeFile(caminhoDocx, docx)]);

  return {
    arquivoPdf: path.relative(process.cwd(), caminhoPdf),
    arquivoDocx: path.relative(process.cwd(), caminhoDocx),
  };
}

export function caminhoAbsoluto(caminhoRelativo: string): string {
  return path.resolve(process.cwd(), caminhoRelativo);
}
