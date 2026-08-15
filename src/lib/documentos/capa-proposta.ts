import { renderizarHtmlParaPdf } from "./pdf";
import {
  FOTO_CAPA_PROPOSTA_JPG_BASE64,
  FOTO_ABERTURA_PROPOSTA_JPG_BASE64,
} from "./marca-assets";

export type DadosCapaProposta = {
  clienteNome: string;
  numeroSequencial: number;
  dataEmissao: Date;
};

const ACCENT = "#368DCC";
const NAVY = "#10305D";

function formatarData(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

function formatarValidade(dataEmissao: Date): string {
  const validade = new Date(dataEmissao);
  validade.setDate(validade.getDate() + 15);
  return formatarData(validade);
}

function formatarNumero(numeroSequencial: number): string {
  return String(numeroSequencial).padStart(6, "0");
}

function escapeHtml(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Duas páginas fixas — capa e "Em favor de" — que abrem a Proposta. O
// texto institucional é curto e fixo (não editável pelo admin nesta
// versão). Capa e abertura usam fotos reais fornecidas pelo usuário
// (marca-assets.ts) em vez de um grafismo genérico.
function montarHtmlCapa(dados: DadosCapaProposta): string {
  const fotoCapa = `data:image/jpeg;base64,${FOTO_CAPA_PROPOSTA_JPG_BASE64}`;
  const fotoAbertura = `data:image/jpeg;base64,${FOTO_ABERTURA_PROPOSTA_JPG_BASE64}`;
  const clienteNome = escapeHtml(dados.clienteNome);
  const dataFormatada = formatarData(dados.dataEmissao);
  const validadeFormatada = formatarValidade(dados.dataEmissao);
  const numero = formatarNumero(dados.numeroSequencial);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; }
  .pagina {
    width: 210mm;
    height: 297mm;
    position: relative;
    overflow: hidden;
    page-break-after: always;
  }
  .pagina:last-child { page-break-after: auto; }

  /* ---- Página 1: capa ---- */
  .capa-topo {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 60%;
    background: ${ACCENT};
    padding: 18mm 16mm;
  }
  .capa-marca-top {
    position: absolute;
    top: 16mm; right: 16mm;
    text-align: right;
    color: white;
  }
  .capa-marca-top .nome {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 20pt;
    font-weight: 700;
    letter-spacing: 1pt;
  }
  .capa-marca-top .sub {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 10pt;
    font-weight: 400;
    margin-top: -1mm;
  }
  .capa-titulo {
    position: absolute;
    left: 16mm; bottom: 16mm;
    font-size: 44pt;
    font-weight: 800;
    line-height: 0.97;
    letter-spacing: 0.5pt;
    text-transform: uppercase;
    color: white;
  }
  .capa-foto {
    position: absolute;
    top: 60%; left: 0; right: 0; bottom: 28mm;
    overflow: hidden;
  }
  .capa-foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .capa-rodape {
    position: absolute;
    bottom: 0; left: 0; right: 0; height: 28mm;
    background: ${NAVY};
    color: white;
    padding: 0 16mm;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .capa-rodape .info strong { display: block; font-size: 13pt; }
  .capa-rodape .info span { display: block; font-size: 9.5pt; opacity: 0.8; margin-top: 1.5mm; }
  .capa-rodape .marca span { font-size: 12pt; font-weight: 700; letter-spacing: 1.5pt; opacity: 0.9; }

  /* ---- Página 2: abertura "Em favor de" ---- */
  .abertura-faixa {
    position: absolute;
    top: 0; left: 0; bottom: 0; width: 18mm;
    background: ${NAVY};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .abertura-faixa span {
    color: white;
    font-size: 19pt;
    font-weight: 700;
    letter-spacing: 5pt;
    white-space: nowrap;
    transform: rotate(-90deg);
  }
  .abertura-foto {
    position: absolute;
    top: 0; left: 18mm; right: 0; height: 42%;
    overflow: hidden;
  }
  .abertura-foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .abertura-texto {
    position: absolute;
    top: 42%; left: 18mm; right: 0; height: 26%;
    background: ${ACCENT};
    color: white;
    display: flex;
    align-items: center;
    padding: 0 16mm;
  }
  .abertura-texto p { font-size: 12.5pt; line-height: 1.6; }
  .abertura-rodape {
    position: absolute;
    top: 68%; left: 18mm; right: 0; bottom: 0;
    background: ${NAVY};
    color: white;
    padding: 14mm 16mm;
  }
  .abertura-rodape h2 { font-size: 17pt; margin-bottom: 10mm; font-weight: 700; }
  .abertura-rodape .linha { margin-bottom: 7mm; }
  .abertura-rodape .linha b {
    display: block;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 1pt;
    opacity: 0.65;
    font-weight: 400;
    margin-bottom: 1.5mm;
  }
  .abertura-rodape .linha span { font-size: 12.5pt; }
</style>
</head>
<body>
  <div class="pagina">
    <div class="capa-topo">
      <div class="capa-marca-top">
        <div class="nome">SEDRA</div>
        <div class="sub">Consultoria</div>
      </div>
      <div class="capa-titulo">Proposta<br>Comercial</div>
    </div>
    <div class="capa-foto">
      <img src="${fotoCapa}" alt="">
    </div>
    <div class="capa-rodape">
      <div class="info">
        <strong>${clienteNome}</strong>
        <span>${dataFormatada} &middot; Proposta ${numero}</span>
      </div>
      <div class="marca">
        <span>SEDRA</span>
      </div>
    </div>
  </div>
  <div class="pagina">
    <div class="abertura-faixa"><span>SEDRA</span></div>
    <div class="abertura-foto"><img src="${fotoAbertura}" alt=""></div>
    <div class="abertura-texto">
      <p>Cuidamos da parte contábil e fiscal do seu negócio com atenção e
      proximidade, para que você possa focar no que só você pode fazer:
      fazer sua empresa crescer.</p>
    </div>
    <div class="abertura-rodape">
      <h2>Em favor de</h2>
      <div class="linha"><b>Nome do cliente</b><span>${clienteNome}</span></div>
      <div class="linha"><b>Data da proposta</b><span>${dataFormatada}</span></div>
      <div class="linha"><b>Validade da proposta</b><span>${validadeFormatada}</span></div>
    </div>
  </div>
</body>
</html>`;
}

/** Renderiza as 2 páginas fixas (capa + "Em favor de") que abrem o PDF
 * da Proposta. Não passa por `carimbarPaginas` — o layout já é completo. */
export async function renderizarCapaProposta(dados: DadosCapaProposta): Promise<Buffer> {
  return renderizarHtmlParaPdf(montarHtmlCapa(dados));
}
