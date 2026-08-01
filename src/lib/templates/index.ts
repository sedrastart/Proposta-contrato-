import type { DadosContrato } from "./types";
import type { ClausulaRenderavel } from "./motor";
import { renderContratoMei } from "./contrato-mei";
import { renderContratoGeral } from "./contrato-geral";

export type { DadosContrato } from "./types";
export type { ClausulaRenderavel } from "./motor";
export { renderPropostaDraft } from "./proposta";

export function renderContrato(
  regimeSlug: string,
  dados: DadosContrato,
  clausulas: ClausulaRenderavel[]
): string {
  return regimeSlug === "mei"
    ? renderContratoMei(dados, clausulas)
    : renderContratoGeral(dados, clausulas);
}
