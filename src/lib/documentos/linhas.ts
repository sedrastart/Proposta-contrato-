export type TipoLinha =
  | "titulo"
  | "clausula"
  | "assinatura"
  | "rotuloParte"
  | "item"
  | "vazia"
  | "texto";

const RE_CLAUSULA_OU_ANEXO = /^(CLÁUSULA|ANEXO)\s/;
const RE_LINHA_ASSINATURA = /^_{5,}$/;
const RE_ROTULO_PARTE = /^(CONTRATANTE|CONTRATADO):$/;

/** Classifica uma linha do texto renderizado para decidir sua formatação no DOCX/PDF. */
export function classificarLinha(linha: string, ehPrimeiraLinha: boolean): TipoLinha {
  if (linha === "") return "vazia";
  if (ehPrimeiraLinha) return "titulo";
  if (RE_LINHA_ASSINATURA.test(linha)) return "assinatura";
  if (RE_CLAUSULA_OU_ANEXO.test(linha) || linha === "ANEXOS DO CONTRATO") return "clausula";
  if (RE_ROTULO_PARTE.test(linha)) return "rotuloParte";
  if (linha.startsWith("●")) return "item";
  return "texto";
}
