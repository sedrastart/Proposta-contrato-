import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const STORAGE_ROOT = path.resolve(process.cwd(), "storage", "contratos");
const BUCKET = "contratos";

const CONTENT_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

// Disco local não persiste em ambientes serverless (ex.: Vercel) — quando as
// variáveis do Supabase estão configuradas, os arquivos vão para o Storage;
// caso contrário, cai para disco local (uso em desenvolvimento).
function supabaseConfigurado(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function clienteSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

/** Salva o PDF e o DOCX de um contrato emitido, indexados pelo número sequencial. */
export async function salvarArquivosContrato(
  numeroSequencial: number,
  pdf: Buffer,
  docx: Buffer
): Promise<{ arquivoPdf: string; arquivoDocx: string }> {
  const nomeBase = String(numeroSequencial).padStart(6, "0");

  if (supabaseConfigurado()) {
    const supabase = clienteSupabase();
    const chavePdf = `${nomeBase}.pdf`;
    const chaveDocx = `${nomeBase}.docx`;

    const [pdfResultado, docxResultado] = await Promise.all([
      supabase.storage
        .from(BUCKET)
        .upload(chavePdf, pdf, { contentType: CONTENT_TYPES.pdf, upsert: true }),
      supabase.storage
        .from(BUCKET)
        .upload(chaveDocx, docx, { contentType: CONTENT_TYPES.docx, upsert: true }),
    ]);
    if (pdfResultado.error) throw pdfResultado.error;
    if (docxResultado.error) throw docxResultado.error;

    return { arquivoPdf: `supabase:${chavePdf}`, arquivoDocx: `supabase:${chaveDocx}` };
  }

  await mkdir(STORAGE_ROOT, { recursive: true });
  const caminhoPdf = path.join(STORAGE_ROOT, `${nomeBase}.pdf`);
  const caminhoDocx = path.join(STORAGE_ROOT, `${nomeBase}.docx`);
  await Promise.all([writeFile(caminhoPdf, pdf), writeFile(caminhoDocx, docx)]);

  return {
    arquivoPdf: `local:${path.relative(process.cwd(), caminhoPdf)}`,
    arquivoDocx: `local:${path.relative(process.cwd(), caminhoDocx)}`,
  };
}

/** Salva o PDF de uma proposta comercial, indexado pelo próprio número sequencial (independente do de contrato). */
export async function salvarArquivoProposta(
  numeroSequencial: number,
  pdf: Buffer
): Promise<{ arquivoPdf: string }> {
  const nomeBase = `proposta-${String(numeroSequencial).padStart(6, "0")}`;

  if (supabaseConfigurado()) {
    const supabase = clienteSupabase();
    const chavePdf = `${nomeBase}.pdf`;
    const resultado = await supabase.storage
      .from(BUCKET)
      .upload(chavePdf, pdf, { contentType: CONTENT_TYPES.pdf, upsert: true });
    if (resultado.error) throw resultado.error;
    return { arquivoPdf: `supabase:${chavePdf}` };
  }

  await mkdir(STORAGE_ROOT, { recursive: true });
  const caminhoPdf = path.join(STORAGE_ROOT, `${nomeBase}.pdf`);
  await writeFile(caminhoPdf, pdf);
  return { arquivoPdf: `local:${path.relative(process.cwd(), caminhoPdf)}` };
}

/** Lê de volta um arquivo salvo por salvarArquivosContrato/salvarArquivoProposta, seja qual for o backend usado. */
export async function lerArquivoArmazenado(referencia: string): Promise<Buffer> {
  if (referencia.startsWith("supabase:")) {
    const chave = referencia.slice("supabase:".length);
    const supabase = clienteSupabase();
    const { data, error } = await supabase.storage.from(BUCKET).download(chave);
    if (error) throw error;
    return Buffer.from(await data.arrayBuffer());
  }

  // Registros antigos (antes desta camada existir) não tinham prefixo —
  // tratados como caminho local, igual sempre foi.
  const relativo = referencia.startsWith("local:")
    ? referencia.slice("local:".length)
    : referencia;
  return readFile(path.resolve(process.cwd(), relativo));
}
