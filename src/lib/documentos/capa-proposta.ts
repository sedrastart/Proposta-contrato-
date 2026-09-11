import { LOGO_OFICIAL_PRATA_PNG_BASE64 } from "./marca-assets";

export type DadosCapaProposta = {
  clienteNome: string;
  numeroSequencial: number;
  dataEmissao: Date;
};

const ACCENT = "#368DCC";
const NAVY = "#10305D";
const CLARO = "#F5F8FB";
const TINTA = "#1C2230";

export function formatarData(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export function formatarValidade(dataEmissao: Date): string {
  const validade = new Date(dataEmissao);
  validade.setDate(validade.getDate() + 15);
  return formatarData(validade);
}

function formatarNumero(numeroSequencial: number): string {
  return String(numeroSequencial).padStart(6, "0");
}

// Página 1 (capa) apenas — a página 2 ("Em favor de") passou a seguir o
// mesmo layout das páginas de conteúdo (ver montarCorpoAbertura em pdf.ts),
// carimbada junto com elas em carimbarPaginasProposta para herdar a mesma
// faixa/rail de cor e numeração de página.
export function montarHtmlCapaProposta(dados: DadosCapaProposta): string {
  const marcaPrata = `data:image/png;base64,${LOGO_OFICIAL_PRATA_PNG_BASE64}`;
  const clienteNome = dados.clienteNome
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const dataFormatada = formatarData(dados.dataEmissao);
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
  }

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
  .capa-marca-top img { width: 11mm; border-radius: 2mm; }
  .capa-marca-top span {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 12pt;
    font-weight: 700;
    letter-spacing: 1.5pt;
    color: white;
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
</style>
</head>
<body>
  <div class="pagina">
    <div class="capa-banda"></div>
    <div class="capa-banda-linha"></div>
    <div class="capa-marca-top">
      <img src="${marcaPrata}" alt="">
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
</body>
</html>`;
}
