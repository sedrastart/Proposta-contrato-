import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { LOGO_SEDRA_PNG_BASE64, MARCA_DAGUA_PNG_BASE64 } from "./marca-assets";
import { CONTRATADO } from "../templates/contratado";

const MM = 2.834645669; // pontos PDF por milímetro

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

  const linhasRodape = [CONTRATADO.telefone, CONTRATADO.email, CONTRATADO.site];

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

    // Rodapé de contato — canto inferior esquerdo.
    linhasRodape.forEach((linha, i) => {
      const y = 16 * MM - i * 5 * MM;
      pagina.drawCircle({
        x: 20 * MM + 1.5,
        y: y + 3,
        size: 1.5,
        color: rgb(0.15, 0.15, 0.15),
      });
      pagina.drawText(linha, {
        x: 20 * MM + 6,
        y,
        size: 9,
        font: fonte,
        color: rgb(0.15, 0.15, 0.15),
      });
    });
  });

  return Buffer.from(await pdfDoc.save());
}
