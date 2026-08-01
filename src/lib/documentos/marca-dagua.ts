import { PDFDocument, PDFName, PDFString, PDFPage, rgb, StandardFonts } from "pdf-lib";
import { LOGO_SEDRA_PNG_BASE64, MARCA_DAGUA_PNG_BASE64 } from "./marca-assets";
import { CONTRATADO } from "../templates/contratado";

const MM = 2.834645669; // pontos PDF por milímetro

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
export async function carimbarPaginas(pdfBuffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);

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
      color: rgb(0.1, 0.1, 0.1),
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
