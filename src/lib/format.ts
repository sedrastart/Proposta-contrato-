export function formatCpfCnpj(digits: string): string {
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return digits;
}

export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Reverte um texto já formatado por `currency.format()` (ex.: "R$ 620,00",
 * "R$ 1.234,56") de volta pra número — usado pra somar valores salvos como
 * snapshot em texto (Contrato/Proposta.valorFinal). Retorna 0 se não
 * conseguir interpretar (ex.: "A definir"). */
export function parseValorFinal(texto: string): number {
  const limpo = texto.replace(/[^\d,.-]/g, "");
  const semMilhar = limpo.replace(/\.(?=\d{3}(?:\D|$))/g, "");
  const valor = parseFloat(semMilhar.replace(",", "."));
  return Number.isFinite(valor) ? valor : 0;
}

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function dataExtenso(data: Date): string {
  return `${data.getDate()} de ${MESES[data.getMonth()]} de ${data.getFullYear()}`;
}
