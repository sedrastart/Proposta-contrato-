import type { DadosContrato } from "./types";

// Resumo comercial simples enviado ao cliente antes do contrato — sem
// cláusulas jurídicas, só o essencial para aprovação: serviços, valor,
// vigência e condições principais.
export function renderProposta(dados: DadosContrato): string {
  return `PROPOSTA COMERCIAL

${dados.contratanteNome}
CNPJ/CPF: ${dados.contratanteCpfCnpj}
Endereço: ${dados.contratanteEndereco}

SERVIÇOS PROPOSTOS
${dados.servicosSelecionados.map((s) => `● ${s}`).join("\n")}

CONDIÇÕES COMERCIAIS
Valor mensal: ${dados.valor}
Vigência: ${dados.vigenciaMeses} ${dados.vigenciaMeses === 1 ? "mês" : "meses"}
Multa por rescisão antecipada: ${dados.multaDescricao}

Esta proposta não possui validade jurídica de contrato — é um resumo comercial para avaliação prévia. Após aprovação, o contrato de prestação de serviços será emitido com todas as cláusulas aplicáveis.

${dados.cidadeEmissao}, ${dados.dataEmissaoExtenso}.`;
}
