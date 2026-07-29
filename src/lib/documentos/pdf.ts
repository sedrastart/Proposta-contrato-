import puppeteer from "puppeteer-core";
import { classificarLinha } from "./linhas";

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

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function textoParaHtml(textoCompleto: string): string {
  const linhas = textoCompleto.split("\n");
  const partes: string[] = [];
  let primeiraLinhaEncontrada = false;

  for (const linhaBruta of linhas) {
    const linha = linhaBruta.trim();
    const tipo = classificarLinha(linha, !primeiraLinhaEncontrada && linha !== "");
    if (tipo === "titulo") primeiraLinhaEncontrada = true;

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

function paginaCompleta(corpo: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 22mm 20mm; }
  body {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 11.5pt;
    line-height: 1.5;
    color: #1a1a1a;
  }
  h1 {
    font-size: 15pt;
    text-align: center;
    margin: 0 0 18pt;
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

/** Renderiza o texto do contrato em PDF via Chrome headless. */
export async function gerarPdf(textoCompleto: string): Promise<Buffer> {
  const html = paginaCompleta(textoParaHtml(textoCompleto));
  const { executablePath, args } = await resolverConfiguracaoBrowser();

  const browser = await puppeteer.launch({ executablePath, headless: true, args });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
