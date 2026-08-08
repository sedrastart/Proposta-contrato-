import type { DadosContrato } from "./types";
import { substituirPlaceholders } from "./motor";
import { construirContextoProposta } from "./contexto";

// Diferente do Contrato, a Proposta é inerentemente mais sob medida por
// cliente (cada caso pode ter um diagnóstico, opções de pacote e condições
// próprias). Por isso o resultado aqui NÃO é o texto final: é um rascunho
// inicial, pré-preenchido a partir do modelo do regime (editável em
// /admin/propostas), para o usuário editar livremente antes de gerar o PDF.
// O texto final (já editado) é o que fica salvo.
export function renderPropostaDraft(modeloCorpo: string, dados: DadosContrato): string {
  return substituirPlaceholders(modeloCorpo, construirContextoProposta(dados));
}
