import type { DadosContrato, FaixaExcedenteTexto } from "./types";
import { CONTRATADO } from "./contratado";

// Valores prontos para substituição nos placeholders {{chave}} das cláusulas
// do banco. Cálculos que hoje seriam loops/condicionais (ex.: a lista de
// faixas de excedente) são pré-renderizados aqui numa única string, para que
// o texto armazenado no banco seja sempre um preenchimento simples de
// lacunas, sem lógica.

export function construirContextoGeral(dados: DadosContrato): Record<string, string> {
  return {
    servicosSelecionados: dados.servicosSelecionados.join(", "),
    valor: dados.valor,
    vigenciaTexto: vigenciaExtenso(dados.vigenciaMeses),
    multaDescricao: dados.multaDescricao,
    condicaoPagamento: dados.condicaoPagamento,
    limitesUsoLista: limitesUsoLista(dados),
  };
}

export function construirContextoMei(dados: DadosContrato): Record<string, string> {
  const notas = limiteNotasFiscais(dados);
  const lancamentos = limiteLancamentos(dados);

  return {
    servicosSelecionados: dados.servicosSelecionados.join(", "),
    notasQuantidadeTexto: `${notas.quantidade.toString().padStart(2, "0")} (${notas.quantidade === 3 ? "três" : notas.quantidade})`,
    notasValorAdicional: notas.valorAdicional,
    lancamentosQuantidadeTexto: `${lancamentos.quantidade} (${lancamentos.quantidade === 50 ? "cinquenta" : lancamentos.quantidade})`,
    faixasExcedenteLista: renderFaixasExcedente(lancamentos.faixas),
    valor: dados.valor,
    vigenciaMeses: String(dados.vigenciaMeses),
    multaDescricao: dados.multaDescricao,
    condicaoPagamento: dados.condicaoPagamento,
  };
}

export function construirContextoProposta(dados: DadosContrato): Record<string, string> {
  return {
    contratanteNome: dados.contratanteNome,
    contratanteCpfCnpj: dados.contratanteCpfCnpj,
    servicosLista: dados.servicosSelecionados.map((s) => `✔ ${s}`).join("\n"),
    servicosSelecionados: dados.servicosSelecionados.join(", "),
    valor: dados.valor,
    vigenciaTexto:
      dados.vigenciaMeses > 0
        ? `${dados.vigenciaMeses} ${dados.vigenciaMeses === 1 ? "mês" : "meses"}`
        : "a definir",
    condicaoPagamento: dados.condicaoPagamento,
    telefoneContratado: CONTRATADO.telefone,
    emailContratado: CONTRATADO.email,
    siteContratado: CONTRATADO.site,
  };
}

function vigenciaExtenso(meses: number): string {
  return `${meses} (${meses === 12 ? "doze" : meses}) ${meses === 1 ? "mês" : "meses"}`;
}

function limiteNotasFiscais(dados: DadosContrato) {
  const limite = dados.limitesUso.find((l) => l.unidade === "notas fiscais");
  return {
    quantidade: limite?.quantidade ?? 3,
    valorAdicional: limite?.valorPorUnidade ?? "R$ 5,00",
  };
}

// Usada pelos regimes fora do MEI (que não têm placeholders individuais por
// unidade) — lista, num só bloco, a franquia de TODOS os serviços contratados
// que tiverem limite configurado no plano (ex.: lançamentos da Contabilidade,
// colaboradores do Departamento Pessoal, notas fiscais da Escrita Fiscal).
function limitesUsoLista(dados: DadosContrato): string {
  if (dados.limitesUso.length === 0) {
    return "Os serviços contratados não possuem franquia de uso limitada por volume.";
  }
  return dados.limitesUso
    .map((l) => {
      if (l.tipoCobranca === "faixa" && l.faixas.length > 0) {
        return `● ${l.unidade}: ${l.quantidade} incluído(s) por mês; excedente cobrado por faixa:\n${renderFaixasExcedente(l.faixas)}`;
      }
      return `● ${l.unidade}: ${l.quantidade} incluído(s) por mês; excedente de ${l.valorPorUnidade ?? "valor a combinar"} por unidade.`;
    })
    .join("\n");
}

function limiteLancamentos(dados: DadosContrato) {
  const limite = dados.limitesUso.find((l) => l.unidade === "lançamentos");
  return {
    quantidade: limite?.quantidade ?? 50,
    faixas: limite?.faixas ?? [],
  };
}

function renderFaixasExcedente(faixas: FaixaExcedenteTexto[]): string {
  return faixas
    .map(
      (f, i, arr) =>
        `${String.fromCharCode(98 + i)}) ${
          f.percentualAte >= 999
            ? "acima de " + arr[i - 1]?.percentualAte + "%"
            : "até " + f.percentualAte + "% de excedente"
        }: ${f.valorAdicional}`
    )
    .join("\n");
}
