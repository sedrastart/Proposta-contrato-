import type { DadosContrato } from "./types";
import { CONTRATADO } from "./contratado";

// Diferente do Contrato, a Proposta é inerentemente mais sob medida por
// cliente (cada caso pode ter um diagnóstico, opções de pacote e condições
// próprias — como no exemplo real de regularização fiscal usado de
// referência). Por isso isto NÃO é um template fixo renderizado: é um
// rascunho inicial, pré-preenchido com os dados reais do cliente no mesmo
// estilo dos modelos usados pela Sedra, para o usuário editar livremente
// antes de gerar o PDF. O texto final (já editado) é o que fica salvo.
export function renderPropostaDraft(regimeSlug: string, dados: DadosContrato): string {
  return regimeSlug === "mei" ? draftMei(dados) : draftGeral(dados);
}

function draftMei(dados: DadosContrato): string {
  const itens = dados.servicosSelecionados.map((s) => `✔ ${s}`).join("\n");

  return `PROPOSTA COMERCIAL
SEDRA – Plano MEI

Cliente: ${dados.contratanteNome}
CNPJ/CPF: ${dados.contratanteCpfCnpj}

O QUE ESTÁ INCLUSO:
${itens}

INVESTIMENTO:
${dados.valor}/mês
Vigência: ${dados.vigenciaMeses > 0 ? `${dados.vigenciaMeses} ${dados.vigenciaMeses === 1 ? "mês" : "meses"}` : "a definir"}

Atendimento via Google Chat dedicado.
Prazo de resposta: até 1 dia útil.

${CONTRATADO.telefone}
${CONTRATADO.email}
${CONTRATADO.site}`;
}

function draftGeral(dados: DadosContrato): string {
  const itens = dados.servicosSelecionados.map((s) => `✔ ${s}`).join("\n");

  return `PROPOSTA DE PRESTAÇÃO DE SERVIÇOS
Cliente: ${dados.contratanteNome}
CNPJ: ${dados.contratanteCpfCnpj}

[Descreva aqui a situação do cliente, se houver diagnóstico ou pendências identificadas. Apague esta linha se não se aplicar.]

OPÇÃO 1 – ${dados.servicosSelecionados.join(", ")}
Investimento: ${dados.valor}
Inclui:
${itens}

[Se aplicável, adicione aqui uma OPÇÃO 2 com outro escopo/valor.]

Observações:
1. Esta proposta considera as informações apresentadas até a presente data.
2. Caso sejam identificadas novas pendências não relacionadas ao escopo acima, poderá ser apresentado orçamento complementar.

Atenção!
As condições desta proposta são válidas por 15 dias a partir da emissão.

${CONTRATADO.telefone}
${CONTRATADO.email}
${CONTRATADO.site}`;
}
