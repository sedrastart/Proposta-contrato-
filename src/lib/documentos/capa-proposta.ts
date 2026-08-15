import { MARCA_DAGUA_PNG_BASE64 } from "./marca-assets";

export type DadosCapaProposta = {
  clienteNome: string;
  numeroSequencial: number;
  dataEmissao: Date;
};

const ACCENT = "#368DCC";
const NAVY = "#10305D";
const CLARO = "#F5F8FB";
const TINTA = "#1C2230";

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

// Duas páginas fixas — capa e "Em favor de" — que abrem a Proposta. Fundo
// claro com uma faixa diagonal em degradê (azul → marinho), no lugar do
// bloco de cor sólida da versão anterior. Sem foto (por enquanto).
export function montarHtmlCapaProposta(dados: DadosCapaProposta): string {
  const marca = `data:image/png;base64,${MARCA_DAGUA_PNG_BASE64}`;
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
    background: ${CLARO};
    page-break-after: always;
  }
  .pagina:last-child { page-break-after: auto; }

  /* ---- Página 1: capa ---- */
  .capa-banda {
    position: absolute;
    width: 130mm; height: 420mm;
    left: 108mm; top: -140mm;
    background: linear-gradient(160deg, ${ACCENT} 12%, ${NAVY} 88%);
    border-radius: 65mm;
    transform: rotate(-20deg);
  }
  .capa-banda-linha {
    position: absolute;
    width: 4.5mm; height: 420mm;
    left: 156mm; top: -136mm;
    background: rgba(255,255,255,0.45);
    border-radius: 2.5mm;
    transform: rotate(-20deg);
  }
  .capa-marca-top {
    position: absolute;
    top: 16mm; right: 16mm;
    display: flex;
    align-items: center;
    gap: 3mm;
    z-index: 2;
  }
  .capa-marca-top img { width: 9mm; opacity: 0.85; }
  .capa-marca-top span {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 12pt;
    font-weight: 700;
    letter-spacing: 1.5pt;
    color: ${TINTA};
  }
  .capa-titulo {
    position: absolute;
    left: 20mm; top: 122mm;
    z-index: 2;
  }
  .capa-titulo .linha1 {
    font-size: 26pt;
    font-weight: 500;
    letter-spacing: 1pt;
    color: ${TINTA};
    text-transform: uppercase;
  }
  .capa-titulo .linha2 {
    font-size: 26pt;
    font-weight: 800;
    letter-spacing: 1pt;
    color: ${TINTA};
    text-transform: uppercase;
  }
  .capa-titulo .regua {
    width: 26mm; height: 1mm;
    background: ${ACCENT};
    margin-top: 5mm;
  }
  .capa-rodape {
    position: absolute;
    left: 20mm; bottom: 18mm;
    z-index: 2;
  }
  .capa-rodape strong { display: block; font-size: 11pt; color: ${TINTA}; }
  .capa-rodape span { display: block; font-size: 9pt; color: #6B7280; margin-top: 1.5mm; }

  /* ---- Página 2: abertura "Em favor de" ---- */
  .abertura-banda {
    position: absolute;
    width: 150mm; height: 420mm;
    left: 118mm; top: -160mm;
    background: linear-gradient(160deg, ${ACCENT} 12%, ${NAVY} 88%);
    border-radius: 75mm;
    transform: rotate(-16deg);
  }
  .abertura-banda-linha {
    position: absolute;
    width: 4.5mm; height: 420mm;
    left: 108mm; top: -155mm;
    background: rgba(255,255,255,0.4);
    border-radius: 2.5mm;
    transform: rotate(-16deg);
  }
  .abertura-marca {
    position: absolute;
    top: 16mm; left: 20mm;
    display: flex;
    align-items: center;
    gap: 3mm;
    z-index: 2;
  }
  .abertura-marca img { width: 9mm; opacity: 0.85; }
  .abertura-marca span {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 12pt;
    font-weight: 700;
    letter-spacing: 1.5pt;
    color: ${TINTA};
  }
  .abertura-texto {
    position: absolute;
    left: 20mm; top: 40mm; width: 95mm;
    z-index: 2;
  }
  .abertura-texto h1 {
    font-size: 15pt;
    font-weight: 700;
    color: ${TINTA};
    margin-bottom: 6mm;
  }
  .abertura-texto p {
    font-size: 11pt;
    line-height: 1.6;
    color: #4B5563;
  }
  .abertura-rodape {
    position: absolute;
    right: 14mm; bottom: 115mm; width: 70mm;
    color: white;
    z-index: 2;
  }
  .abertura-rodape h2 { font-size: 15pt; margin-bottom: 9mm; font-weight: 700; }
  .abertura-rodape .linha { margin-bottom: 7mm; }
  .abertura-rodape .linha span { line-height: 1.4; }
  .abertura-rodape .linha b {
    display: block;
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 1pt;
    opacity: 0.75;
    font-weight: 400;
    margin-bottom: 1.5mm;
  }
  .abertura-rodape .linha span { font-size: 12pt; }
</style>
</head>
<body>
  <div class="pagina">
    <div class="capa-banda"></div>
    <div class="capa-banda-linha"></div>
    <div class="capa-marca-top">
      <img src="${marca}" alt="">
      <span>SEDRA</span>
    </div>
    <div class="capa-titulo">
      <div class="linha1">Proposta</div>
      <div class="linha2">Comercial</div>
      <div class="regua"></div>
    </div>
    <div class="capa-rodape">
      <strong>${clienteNome}</strong>
      <span>${dataFormatada} &middot; Proposta ${numero}</span>
    </div>
  </div>
  <div class="pagina">
    <div class="abertura-banda"></div>
    <div class="abertura-banda-linha"></div>
    <div class="abertura-marca">
      <img src="${marca}" alt="">
      <span>SEDRA</span>
    </div>
    <div class="abertura-texto">
      <h1>Quem somos</h1>
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
