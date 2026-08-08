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
