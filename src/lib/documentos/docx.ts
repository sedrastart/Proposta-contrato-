import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { classificarLinha } from "./linhas";

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
    sections: [{ properties: {}, children: paragraphs }],
  });

  return Packer.toBuffer(documento);
}
