import { PDFDocument, PDFName, PDFString, PDFPage, rgb, StandardFonts } from "pdf-lib";
import { LOGO_SEDRA_PNG_BASE64, MARCA_DAGUA_PNG_BASE64 } from "./marca-assets";
import { CONTRATADO } from "../templates/contratado";
import type { TipoDocumento } from "./pdf";

const MM = 2.834645669; // pontos PDF por milímetro

// Mesmas cores usadas no CSS da página (src/lib/documentos/pdf.ts) —
// contrato = azul da marca, proposta = terracota — repetidas aqui na
// barra de topo e no número de página, pra reforçar a diferença em toda
// página, não só na capa.
const ACCENT_RGB: Record<TipoDocumento, ReturnType<typeof rgb>> = {
  contrato: rgb(0.1176, 0.2275, 0.3725),
  proposta: rgb(0.6039, 0.3569, 0.1333),
};

// pdf-lib não tem um helper de alto nível para links clicáveis — a anotação
// precisa ser montada manualmente (padrão documentado pela comunidade do
// pdf-lib para adicionar anotações "Link" com ação URI).
function adicionarLinkClicavel(
  pagina: PDFPage,
  url: string,
  rect: [number, number, number, number]
) {
  const doc = pagina.doc;
  const linkRef = doc.context.register(
    doc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: rect,
      Border: [0, 0, 0],
      A: {
        Type: "Action",
        S: "URI",
        URI: PDFString.of(url),
      },
    })
  );
  const anotacoesExistentes = pagina.node.Annots();
  if (anotacoesExistentes) {
    anotacoesExistentes.push(linkRef);
  } else {
    pagina.node.set(PDFName.of("Annots"), doc.context.obj([linkRef]));
  }
}

// Aplica o mesmo modelo visual da Sedra (logo, marca d'água, numeração de
// página e rodapé de contato) em todas as páginas de um PDF já gerado —
// tanto para Contrato quanto para Proposta, garantindo visual consistente.
export async function carimbarPaginas(
  pdfBuffer: Buffer,
  tipo: TipoDocumento = "contrato"
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const accent = ACCENT_RGB[tipo];

  const logoImage = await pdfDoc.embedPng(Buffer.from(LOGO_SEDRA_PNG_BASE64, "base64"));
  const marcaDaguaImage = await pdfDoc.embedPng(
    Buffer.from(MARCA_DAGUA_PNG_BASE64, "base64")
  );
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonteNegrito = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const paginas = pdfDoc.getPages();
  const total = paginas.length;

  const linhasRodape: { texto: string; url?: string }[] = [
    { texto: CONTRATADO.telefone },
    { texto: CONTRATADO.email, url: `mailto:${CONTRATADO.email}` },
    { texto: CONTRATADO.site, url: `https://${CONTRATADO.site}` },
  ];

  paginas.forEach((pagina, indice) => {
    const { width, height } = pagina.getSize();

    // Barra de destaque no topo — reforça de relance o tipo de documento
    // (contrato/proposta) mesmo folheando páginas internas, sem precisar
    // ler o título.
    pagina.drawRectangle({
      x: 0,
      y: height - 3,
      width,
      height: 3,
      color: accent,
    });

    // Marca d'água — canto inferior direito, atrás do texto.
    const larguraMarca = 110 * MM;
    const alturaMarca = larguraMarca * (marcaDaguaImage.height / marcaDaguaImage.width);
    pagina.drawImage(marcaDaguaImage, {
      x: width - larguraMarca,
      y: 0,
      width: larguraMarca,
      height: alturaMarca,
    });

    // Logo — canto superior direito.
    const larguraLogo = 22 * MM;
    const alturaLogo = larguraLogo * (logoImage.height / logoImage.width);
    pagina.drawImage(logoImage, {
      x: width - 20 * MM - larguraLogo,
      y: height - 10 * MM - alturaLogo,
      width: larguraLogo,
      height: alturaLogo,
    });

    // Numeração — canto superior esquerdo.
    pagina.drawText(`Página ${indice + 1} de ${total}`, {
      x: 20 * MM,
      y: height - 16 * MM,
      size: 10.5,
      font: fonteNegrito,
      color: accent,
    });

    // Rodapé de contato — canto inferior esquerdo. E-mail e site são
    // clicáveis (abrem o app de e-mail / o site direto no PDF).
    const xTexto = 20 * MM + 6;
    linhasRodape.forEach(({ texto, url }, i) => {
      const y = 16 * MM - i * 5 * MM;
      pagina.drawCircle({
        x: 20 * MM + 1.5,
        y: y + 3,
        size: 1.5,
        color: rgb(0.15, 0.15, 0.15),
      });
      pagina.drawText(texto, {
        x: xTexto,
        y,
        size: 9,
        font: fonte,
        color: rgb(0.15, 0.15, 0.15),
      });
      if (url) {
        const largura = fonte.widthOfTextAtSize(texto, 9);
        adicionarLinkClicavel(pagina, url, [xTexto, y - 2, xTexto + largura, y + 9]);
      }
    });
  });

  return Buffer.from(await pdfDoc.save());
}

// Variante usada só nas páginas de conteúdo da Proposta com capa — faixa
// terracota grossa no topo (em vez da linha fina de 3pt) e uma barra de
// destaque na lateral esquerda, ecoando a capa/abertura. Rodapé, marca
// d'água e numeração reaproveitam a mesma lógica de `carimbarPaginas`.
export async function carimbarPaginasProposta(pdfBuffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const accent = ACCENT_RGB.proposta;

  const logoImage = await pdfDoc.embedPng(Buffer.from(LOGO_SEDRA_PNG_BASE64, "base64"));
  const marcaDaguaImage = await pdfDoc.embedPng(
    Buffer.from(MARCA_DAGUA_PNG_BASE64, "base64")
  );
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonteNegrito = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const paginas = pdfDoc.getPages();
  const total = paginas.length;
  const alturaFaixa = 14 * MM;
  const larguraRail = 3 * MM;

  const linhasRodape: { texto: string; url?: string }[] = [
    { texto: CONTRATADO.telefone },
    { texto: CONTRATADO.email, url: `mailto:${CONTRATADO.email}` },
    { texto: CONTRATADO.site, url: `https://${CONTRATADO.site}` },
  ];

  paginas.forEach((pagina, indice) => {
    const { width, height } = pagina.getSize();

    // Faixa grossa no topo — mesma função da capa/abertura, agora
    // repetida nas páginas de conteúdo pra manter a identidade da proposta.
    pagina.drawRectangle({ x: 0, y: height - alturaFaixa, width, height: alturaFaixa, color: accent });

    // Barra de destaque na lateral esquerda, full-height.
    pagina.drawRectangle({ x: 0, y: 0, width: larguraRail, height, color: accent });

    // Logo — dentro da faixa, canto superior direito.
    const larguraLogo = 13 * MM;
    const alturaLogo = larguraLogo * (logoImage.height / logoImage.width);
    pagina.drawImage(logoImage, {
      x: width - 14 * MM - larguraLogo,
      y: height - alturaFaixa / 2 - alturaLogo / 2,
      width: larguraLogo,
      height: alturaLogo,
    });

    // Marca d'água — canto inferior direito, atrás do texto.
    const larguraMarca = 110 * MM;
    const alturaMarca = larguraMarca * (marcaDaguaImage.height / marcaDaguaImage.width);
    pagina.drawImage(marcaDaguaImage, {
      x: width - larguraMarca,
      y: 0,
      width: larguraMarca,
      height: alturaMarca,
    });

    // Numeração — logo abaixo da faixa, canto superior esquerdo.
    pagina.drawText(`Página ${indice + 1} de ${total}`, {
      x: 20 * MM,
      y: height - alturaFaixa - 10 * MM,
      size: 10.5,
      font: fonteNegrito,
      color: accent,
    });

    // Rodapé de contato — canto inferior esquerdo. E-mail e site são
    // clicáveis (abrem o app de e-mail / o site direto no PDF).
    const xTexto = 20 * MM + 6;
    linhasRodape.forEach(({ texto, url }, i) => {
      const y = 16 * MM - i * 5 * MM;
      pagina.drawCircle({
        x: 20 * MM + 1.5,
        y: y + 3,
        size: 1.5,
        color: rgb(0.15, 0.15, 0.15),
      });
      pagina.drawText(texto, {
        x: xTexto,
        y,
        size: 9,
        font: fonte,
        color: rgb(0.15, 0.15, 0.15),
      });
      if (url) {
        const largura = fonte.widthOfTextAtSize(texto, 9);
        adicionarLinkClicavel(pagina, url, [xTexto, y - 2, xTexto + largura, y + 9]);
      }
    });
  });

  return Buffer.from(await pdfDoc.save());
}
