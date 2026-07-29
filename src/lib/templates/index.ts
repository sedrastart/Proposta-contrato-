import type { DadosContrato } from "./types";
import { renderContratoMei } from "./contrato-mei";
import { renderContratoGeral } from "./contrato-geral";

export type { DadosContrato } from "./types";

export function renderContrato(regimeSlug: string, dados: DadosContrato): string {
  return regimeSlug === "mei" ? renderContratoMei(dados) : renderContratoGeral(dados);
}
