import puppeteer from "puppeteer-core";
import { PDFDocument } from "pdf-lib";
import { classificarLinha } from "./linhas";
import { carimbarPaginas, carimbarPaginasProposta } from "./marca-dagua";
import { renderizarCapaProposta, type DadosCapaProposta } from "./capa-proposta";

export type { DadosCapaProposta } from "./capa-proposta";

// Em produção (Vercel/AWS Lambda, Linux) não existe um Chrome instalado nem
// disco gravável fora de /tmp — usamos o binário do @sparticuz/chromium,
// feito sob medida para esses ambientes serverless. Localmente (Windows),
// aponta para o Chrome já instalado na máquina.
async function resolverConfiguracaoBrowser(): Promise<{
  executablePath: string;
  args: string[];
}> {
  const emServerless = Boolean(
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  );

  if (emServerless) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return {
      executablePath: await chromium.executablePath(),
      args: chromium.args,
    };
  }

  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  return { executablePath, args: ["--no-sandbox", "--disable-gpu"] };
}

/** Renderiza um HTML completo em PDF via Chrome headless — usado tanto
 * pelo texto corrido do documento quanto pela capa/abertura da proposta. */
export async function renderizarHtmlParaPdf(html: string): Promise<Buffer> {
  const { executablePath, args } = await resolverConfiguracaoBrowser();
  const browser = await puppeteer.launch({ executablePath, headless: true, args });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** `suprimirTitulo`: quando a proposta já tem capa própria com o título
 * grande, a primeira linha do texto (que viraria `<h1>`) fica redundante
 * — é omitida por completo nesse caso. */
function textoParaHtml(textoCompleto: string, suprimirTitulo = false): string {
  const linhas = textoCompleto.split("\n");
  const partes: string[] = [];
  let primeiraLinhaEncontrada = false;

  for (const linhaBruta of linhas) {
    const linha = linhaBruta.trim();
    const tipo = classificarLinha(linha, !primeiraLinhaEncontrada && linha !== "");
    if (tipo === "titulo") {
      primeiraLinhaEncontrada = true;
      if (suprimirTitulo) continue;
    }

    switch (tipo) {
      case "vazia":
        partes.push("<div class=\"linha-vazia\"></div>");
        break;
      case "titulo":
        partes.push(`<h1>${escapeHtml(linha)}</h1>`);
        break;
      case "assinatura":
        partes.push(`<p class="assinatura">${escapeHtml(linha)}</p>`);
        break;
      case "clausula":
        partes.push(`<h2>${escapeHtml(linha)}</h2>`);
        break;
      case "rotuloParte":
        partes.push(`<p class="rotulo">${escapeHtml(linha)}</p>`);
        break;
      case "item":
        partes.push(`<li>${escapeHtml(linha.replace(/^●\s*/, ""))}</li>`);
        break;
      default:
        partes.push(`<p>${escapeHtml(linha)}</p>`);
    }
  }

  // Agrupa <li> consecutivos em <ul>
  const html: string[] = [];
  let dentroDeLista = false;
  for (const parte of partes) {
    const ehItem = parte.startsWith("<li>");
    if (ehItem && !dentroDeLista) {
      html.push("<ul>");
      dentroDeLista = true;
    } else if (!ehItem && dentroDeLista) {
      html.push("</ul>");
      dentroDeLista = false;
    }
    html.push(parte);
  }
  if (dentroDeLista) html.push("</ul>");

  return html.join("\n");
}

export type TipoDocumento = "proposta" | "contrato";

// Cor de destaque diferente por tipo — contrato usa o azul-marinho mais
// escuro da marca (formal, definitivo); proposta usa o azul claro da
// mesma paleta — ajuda a diferenciar os dois de relance, sem precisar ler
// o título, inclusive folheando páginas internas.
const ACCENT_POR_TIPO: Record<TipoDocumento, string> = {
  contrato: "#10305D",
  proposta: "#368DCC",
};

function paginaCompleta(corpo: string, tipo: TipoDocumento): string {
  const accent = ACCENT_POR_TIPO[tipo];
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 36mm 20mm 28mm; }
  body {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 11.5pt;
    line-height: 1.5;
    color: #1a1a1a;
  }
  h1 {
    font-size: 15pt;
    text-align: center;
    margin: 0 0 10pt;
    color: ${accent};
  }
  h1::after {
    content: "";
    display: block;
    width: 32pt;
    height: 2pt;
    margin: 8pt auto 0;
    background: ${accent};
  }
  h2 {
    font-size: 12pt;
    margin: 16pt 0 6pt;
  }
  p { margin: 0 0 6pt; }
  p.rotulo { font-weight: bold; margin-top: 10pt; }
  p.assinatura { margin-top: 14pt; }
  ul { margin: 0 0 8pt; padding-left: 20pt; }
  li { margin-bottom: 3pt; }
  .linha-vazia { height: 6pt; }
</style>
</head>
<body>
${corpo}
</body>
</html>`;
}

/** Junta a capa+abertura (2 páginas, sem carimbo) com as páginas de
 * conteúdo já carimbadas, num único PDF. */
async function juntarPdfs(capaBuffer: Buffer, conteudoBuffer: Buffer): Promise<Buffer> {
  const final = await PDFDocument.create();
  const capaDoc = await PDFDocument.load(capaBuffer);
  const conteudoDoc = await PDFDocument.load(conteudoBuffer);

  const paginasCapa = await final.copyPages(capaDoc, capaDoc.getPageIndices());
  paginasCapa.forEach((p) => final.addPage(p));

  const paginasConteudo = await final.copyPages(conteudoDoc, conteudoDoc.getPageIndices());
  paginasConteudo.forEach((p) => final.addPage(p));

  return Buffer.from(await final.save());
}

async function gerarPdfPropostaComCapa(
  textoCompleto: string,
  dadosCapa: DadosCapaProposta
): Promise<Buffer> {
  const [capaBuffer, conteudoBrutoPdf] = await Promise.all([
    renderizarCapaProposta(dadosCapa),
    renderizarHtmlParaPdf(paginaCompleta(textoParaHtml(textoCompleto, true), "proposta")),
  ]);
  const conteudoCarimbado = await carimbarPaginasProposta(conteudoBrutoPdf);
  return juntarPdfs(capaBuffer, conteudoCarimbado);
}

/** Renderiza o texto do documento em PDF via Chrome headless — `tipo`
 * decide a cor de destaque (contrato = azul-marinho escuro, proposta = azul médio).
 * Para proposta, passar `dadosCapa` adiciona capa + página de abertura. */
export async function gerarPdf(
  textoCompleto: string,
  tipo: TipoDocumento = "contrato",
  dadosCapa?: DadosCapaProposta
): Promise<Buffer> {
  if (tipo === "proposta" && dadosCapa) {
    return gerarPdfPropostaComCapa(textoCompleto, dadosCapa);
  }

  const html = paginaCompleta(textoParaHtml(textoCompleto), tipo);
  const pdf = await renderizarHtmlParaPdf(html);
  return carimbarPaginas(pdf, tipo);
}
