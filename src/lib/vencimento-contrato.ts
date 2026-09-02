/** Calcula a data de término de um contrato (emissão + vigência em meses)
 * e quantos dias faltam pra isso — negativo significa que já venceu.
 * Retorna null quando a vigência não está definida (0 meses = "a definir"). */
export function calcularVencimento(
  dataEmissao: Date,
  vigenciaMeses: number,
  agora: number = Date.now()
): { dataFim: Date; diasParaVencer: number } | null {
  if (vigenciaMeses <= 0) return null;

  const dataFim = new Date(dataEmissao);
  dataFim.setMonth(dataFim.getMonth() + vigenciaMeses);

  const diasParaVencer = Math.floor((dataFim.getTime() - agora) / (1000 * 60 * 60 * 24));
  return { dataFim, diasParaVencer };
}

// Contratos com vencimento dentro dessa janela (ou já vencidos) entram no
// aviso de "perto de vencer" no painel e na lista de contratos.
export const LIMITE_DIAS_VENCENDO = 30;
