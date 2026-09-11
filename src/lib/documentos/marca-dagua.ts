import { PDFDocument, PDFName, PDFString, PDFPage, PDFFont, rgb, StandardFonts } from "pdf-lib";
import {
  LOGO_SEDRA_PNG_BASE64,
  MARCA_DAGUA_PNG_BASE64,
  LOGO_OFICIAL_PRATA_PNG_BASE64,
} from "./marca-assets";
import { CONTRATADO } from "../templates/contratado";
import type { TipoDocumento } from "./pdf";

const MM = 2.834645669; // pontos PDF por milímetro

// Mesmas cores usadas no CSS da página (src/lib/documentos/pdf.ts) —
// contrato = azul-marinho escuro da marca, proposta = azul médio da
// mesma paleta — repetidas aqui na barra de topo e no número de página,
// pra reforçar a diferença em toda página, não só na capa.
const ACCENT_RGB: Record<TipoDocumento, ReturnType<typeof rgb>> = {
  contrato: rgb(0.0627, 0.1882, 0.3647),
  proposta: rgb(0.2118, 0.5529, 0.8000),
};

// Mesmo par de cores do degradê da capa da proposta (ACCENT → NAVY em
// capa-proposta.ts) — repetido aqui pra faixa/rail das páginas de conteúdo
// (e da "Em favor de", que agora usa o mesmo layout) terem a cor da capa
// em vez de um azul sólido só.
const GRADIENTE_PROPOSTA: {
  inicio: [number, number, number];
  fim: [number, number, number];
} = {
  inicio: [0.2118, 0.5529, 0.8000], // #368DCC
  fim: [0.0627, 0.1882, 0.3647], // #10305D
};

// pdf-lib não tem preenchimento em degradê nativo — aproxima desenhando
// várias faixas finas com a cor interpolada entre início e fim.
function desenharRetanguloGradiente(
  pagina: PDFPage,
  opcoes: {
    x: number;
    y: number;
    width: number;
    height: number;
    inicio: [number, number, number];
    fim: [number, number, number];
    direcao: "horizontal" | "vertical";
  }
) {
  const { x, y, width, height, inicio, fim, direcao } = opcoes;
  const faixas = 60;
  for (let i = 0; i < faixas; i++) {
    const t = i / (faixas - 1);
    const cor = rgb(
      inicio[0] + (fim[0] - inicio[0]) * t,
      inicio[1] + (fim[1] - inicio[1]) * t,
      inicio[2] + (fim[2] - inicio[2]) * t
    );
    if (direcao === "horizontal") {
      const larguraFaixa = width / faixas;
      pagina.drawRectangle({ x: x + i * larguraFaixa, y, width: larguraFaixa + 0.5, height, color: cor });
    } else {
      const alturaFaixa = height / faixas;
      pagina.drawRectangle({ x, y: y + i * alturaFaixa, width, height: alturaFaixa + 0.5, color: cor });
    }
  }
}

// pdf-lib desenha texto sem letter-spacing — aproxima o efeito desenhando
// letra por letra e avançando o cursor manualmente. Usado pra reproduzir o
// "SEDRA" com letter-spacing da capa (página 1) nas demais páginas.
function desenharTextoComEspacamento(
  pagina: PDFPage,
  texto: string,
  opcoes: {
    x: number;
    y: number;
    size: number;
    font: PDFFont;
    color: ReturnType<typeof rgb>;
    espacamento: number;
  }
): number {
  let cursorX = opcoes.x;
  for (const letra of texto) {
    pagina.drawText(letra, {
      x: cursorX,
      y: opcoes.y,
      size: opcoes.size,
      font: opcoes.font,
      color: opcoes.color,
    });
    cursorX += opcoes.font.widthOfTextAtSize(letra, opcoes.size) + opcoes.espacamento;
  }
  return cursorX - opcoes.x - opcoes.espacamento;
}

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
// azul grossa no topo (em vez da linha fina de 3pt) e uma barra de
// destaque na lateral esquerda, ecoando a capa/abertura. Rodapé, marca
// d'água e numeração reaproveitam a mesma lógica de `carimbarPaginas`.
export async function carimbarPaginasProposta(pdfBuffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const accent = ACCENT_RGB.proposta;

  const logoImage = await pdfDoc.embedPng(
    Buffer.from(LOGO_OFICIAL_PRATA_PNG_BASE64, "base64")
  );
  const marcaDaguaImage = await pdfDoc.embedPng(
    Buffer.from(MARCA_DAGUA_PNG_BASE64, "base64")
  );
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonteNegrito = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fonteMarca = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

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

    // Faixa grossa no topo — mesmo degradê da capa, agora repetida nas
    // páginas de conteúdo (e na "Em favor de") pra manter a identidade
    // visual da proposta em todas as páginas.
    desenharRetanguloGradiente(pagina, {
      x: 0,
      y: height - alturaFaixa,
      width,
      height: alturaFaixa,
      inicio: GRADIENTE_PROPOSTA.inicio,
      fim: GRADIENTE_PROPOSTA.fim,
      direcao: "horizontal",
    });

    // Barra de destaque na lateral esquerda, full-height.
    desenharRetanguloGradiente(pagina, {
      x: 0,
      y: 0,
      width: larguraRail,
      height,
      inicio: GRADIENTE_PROPOSTA.inicio,
      fim: GRADIENTE_PROPOSTA.fim,
      direcao: "vertical",
    });

    // Selo + "SEDRA" — mesmo ícone prata e a mesma composição da capa
    // (página 1), com o texto desenhado à parte (a fonte Georgia da capa
    // não está disponível aqui; Times-Bold é a serifada mais próxima do
    // conjunto padrão do pdf-lib).
    const tamanhoTextoMarca = 12;
    const espacamentoMarca = 1.5;
    const larguraTextoMarca =
      fonteMarca.widthOfTextAtSize("SEDRA", tamanhoTextoMarca) + espacamentoMarca * 4;
    const iconeLargura = 11 * MM;
    const iconeAltura = iconeLargura * (logoImage.height / logoImage.width);
    const gapMarca = 3 * MM;
    const xIcone = width - 14 * MM - larguraTextoMarca - gapMarca - iconeLargura;
    pagina.drawImage(logoImage, {
      x: xIcone,
      y: height - alturaFaixa / 2 - iconeAltura / 2,
      width: iconeLargura,
      height: iconeAltura,
    });
    desenharTextoComEspacamento(pagina, "SEDRA", {
      x: xIcone + iconeLargura + gapMarca,
      y: height - alturaFaixa / 2 - tamanhoTextoMarca * 0.36,
      size: tamanhoTextoMarca,
      font: fonteMarca,
      color: rgb(1, 1, 1),
      espacamento: espacamentoMarca,
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
