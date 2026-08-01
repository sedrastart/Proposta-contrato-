import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Header,
  Footer,
  ImageRun,
  ExternalHyperlink,
  PageNumber,
  Tab,
  TabStopType,
  TabStopPosition,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
} from "docx";
import { classificarLinha } from "./linhas";
import { LOGO_SEDRA_PNG_BASE64, MARCA_DAGUA_PNG_BASE64 } from "./marca-assets";
import { CONTRATADO } from "../templates/contratado";

const LOGO_BUFFER = Buffer.from(LOGO_SEDRA_PNG_BASE64, "base64");
const MARCA_DAGUA_BUFFER = Buffer.from(MARCA_DAGUA_PNG_BASE64, "base64");

// Dimensões originais dos recortes (px), para manter a proporção.
const LOGO_ORIGINAL = { width: 321, height: 288 };
const MARCA_DAGUA_ORIGINAL = { width: 1381, height: 609 };

function pxParaMm(mm: number): number {
  return (mm / 25.4) * 96;
}

function construirCabecalho(): Header {
  const larguraLogoMm = 20;
  const larguraLogoPx = pxParaMm(larguraLogoMm);
  const alturaLogoPx = larguraLogoPx * (LOGO_ORIGINAL.height / LOGO_ORIGINAL.width);

  return new Header({
    children: [
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({
            bold: true,
            children: ["Página ", PageNumber.CURRENT, " de ", PageNumber.TOTAL_PAGES],
          }),
          new Tab(),
          new ImageRun({
            type: "png",
            data: LOGO_BUFFER,
            transformation: { width: larguraLogoPx, height: alturaLogoPx },
          }),
        ],
      }),
    ],
  });
}

function construirRodape(): Footer {
  const larguraMarcaMm = 100;
  const larguraMarcaPx = pxParaMm(larguraMarcaMm);
  const alturaMarcaPx =
    larguraMarcaPx * (MARCA_DAGUA_ORIGINAL.height / MARCA_DAGUA_ORIGINAL.width);

  return new Footer({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            type: "png",
            data: MARCA_DAGUA_BUFFER,
            transformation: { width: larguraMarcaPx, height: alturaMarcaPx },
            floating: {
              horizontalPosition: {
                relative: HorizontalPositionRelativeFrom.PAGE,
                align: HorizontalPositionAlign.RIGHT,
              },
              verticalPosition: {
                relative: VerticalPositionRelativeFrom.PAGE,
                align: VerticalPositionAlign.BOTTOM,
              },
              behindDocument: true,
              allowOverlap: true,
            },
          }),
        ],
      }),
      new Paragraph({ children: [new TextRun({ text: `• ${CONTRATADO.telefone}` })] }),
      new Paragraph({
        children: [
          new TextRun({ text: "• " }),
          new ExternalHyperlink({
            link: `mailto:${CONTRATADO.email}`,
            children: [new TextRun({ text: CONTRATADO.email, style: "Hyperlink" })],
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "• " }),
          new ExternalHyperlink({
            link: `https://${CONTRATADO.site}`,
            children: [new TextRun({ text: CONTRATADO.site, style: "Hyperlink" })],
          }),
        ],
      }),
    ],
  });
}

/** Converte o texto do contrato (já renderizado a partir do template) em um .docx real. */
export function gerarDocx(textoCompleto: string): Promise<Buffer> {
  const linhas = textoCompleto.split("\n");
  const paragraphs: Paragraph[] = [];
  let primeiraLinhaEncontrada = false;

  for (const linhaBruta of linhas) {
    const linha = linhaBruta.trim();
    const tipo = classificarLinha(linha, !primeiraLinhaEncontrada && linha !== "");
    if (tipo === "titulo") primeiraLinhaEncontrada = true;

    switch (tipo) {
      case "vazia":
        paragraphs.push(new Paragraph({ text: "" }));
        break;
      case "titulo":
        paragraphs.push(
          new Paragraph({
            text: linha,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          })
        );
        break;
      case "assinatura":
        paragraphs.push(new Paragraph({ text: linha, spacing: { before: 200 } }));
        break;
      case "clausula":
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: linha, bold: true })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 260, after: 120 },
          })
        );
        break;
      case "rotuloParte":
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: linha, bold: true })],
            spacing: { before: 160 },
          })
        );
        break;
      case "item":
        paragraphs.push(
          new Paragraph({ text: linha.replace(/^●\s*/, ""), bullet: { level: 0 } })
        );
        break;
      default:
        paragraphs.push(new Paragraph({ text: linha, spacing: { after: 80 } }));
    }
  }

  const documento = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: "36mm",
              bottom: "28mm",
              left: "20mm",
              right: "20mm",
              header: "10mm",
              footer: "10mm",
            },
          },
        },
        headers: { default: construirCabecalho() },
        footers: { default: construirRodape() },
        children: paragraphs,
      },
    ],
  });

  return Packer.toBuffer(documento);
}
