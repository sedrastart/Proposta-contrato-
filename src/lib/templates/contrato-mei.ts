import type { DadosContrato } from "./types";
import { CONTRATADO } from "./contratado";

// Reproduz o contrato real do Vinicius (MEI) analisado na arquitetura, com
// os valores dinâmicos (cláusulas 2.1, 6, 8, 9) injetados a partir do plano
// escolhido.
const CONTRATADO_ENDERECO_MEI =
  "rua Apóstolo Judas Tadeu 33, Cidade Tiradentes, São Paulo/SP, CEP 08475-510";

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

export function renderContratoMei(dados: DadosContrato): string {
  const notas = limiteNotasFiscais(dados);
  const lancamentos = limiteLancamentos(dados);

  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE:
${dados.contratanteNome}, inscrito no CNPJ/CPF nº ${dados.contratanteCpfCnpj}, com sede na ${dados.contratanteEndereco}, CEP ${dados.contratanteCep}${
    dados.responsavelNome
      ? `, neste ato representado por seu titular ${dados.responsavelNome}, inscrito no CPF nº ${dados.responsavelCpf ?? ""}`
      : ""
  }.

CONTRATADO:
${CONTRATADO.nome}, inscrito no CPF nº ${CONTRATADO.cpf}, residente na ${CONTRATADO_ENDERECO_MEI}.

O presente contrato é regido pelos arts. 593 a 609 do Código Civil, pela legislação do Microempreendedor Individual (Lei Complementar 123/2006) e demais normas aplicáveis.

CLÁUSULA 1 – OBJETO
Prestação de serviços de apoio administrativo, controle financeiro e acompanhamento das obrigações do Microempreendedor Individual (MEI), conforme descrito neste instrumento.
Serviços contratados: ${dados.servicosSelecionados.join(", ")}.

CLÁUSULA 2 – DIREITOS DO CONTRATANTE
2.1 Emissão de Notas Fiscais
a) Emissão de até ${notas.quantidade.toString().padStart(2, "0")} (${notas.quantidade === 3 ? "três" : notas.quantidade}) notas fiscais por mês;
b) Excedente será cobrado ${notas.valorAdicional} por nota adicional.
2.2 DAS – Documento de Arrecadação do Simples Nacional
a) Emissão mensal da guia DAS;
b) Envio com antecedência mínima de 05 dias úteis;
c) Direito a 01 recálculo sem custo;
d) A partir do segundo recálculo no mês, será cobrado R$5,00 por emissão adicional.
2.3 Acompanhamento Tributário e Financeiro
a) Controle dos pagamentos das guias;
b) Monitoramento do limite anual de faturamento do MEI;
c) Relatório mensal com simulador de impacto tributário na DIRPF do ano seguinte;
d) Acompanhamento e controle mensal de receitas e despesas.
2.4 Relatórios e Arquivamento
a) Organização e arquivamento digital do movimento financeiro mensal;
b) Elaboração mensal de DRE simplificada;
c) Entrega anual de relatório consolidado para suporte à DIRPF;
d) Elaboração e entrega da Declaração Anual do MEI (DASN-SIMEI).
Parágrafo único: Não está incluída neste contrato a elaboração da Declaração de Imposto de Renda Pessoa Física (DIRPF) do titular.
2.5 Regularidade Fiscal
Emissão trimestral da Certidão Negativa de Débitos (CND), quando disponível nos órgãos competentes.

CLÁUSULA 3 – DEVERES DO CONTRATANTE
a) Solicitar emissão de nota fiscal com antecedência mínima de 03 dias úteis;
b) Enviar mensalmente todos os documentos comprobatórios de receitas e despesas;
c) Encaminhar documentos de forma digital, legível e organizada;
d) Efetuar pagamentos das guias até o vencimento;
e) Informar alterações cadastrais ou desenquadramento do MEI.

CLÁUSULA 4 – CANAL OFICIAL DE ATENDIMENTO
O canal oficial de comunicação será o Google Chat corporativo dedicado ao cliente.
O envio de documentos poderá ocorrer via Google Chat ou e-mail oficial da Sedra Consultoria, canal de comunicação oficial do CONTRATADO.
Horário de atendimento comercial:
a) segunda a sexta-feira: 09h às 18h
c) sábado: 09h às 12h

CLÁUSULA 5 – SLA DE RESPOSTA
O CONTRATADO, na qualidade de profissional autônomo responsável pela execução das atividades contratadas, compromete-se a responder às solicitações do CONTRATANTE no prazo de até 01 (um) dia útil, respeitado o horário comercial.

CLÁUSULA 6 – LIMITE DE MOVIMENTAÇÃO
O plano contempla até ${lancamentos.quantidade} (${lancamentos.quantidade === 50 ? "cinquenta" : lancamentos.quantidade}) lançamentos mensais.
a) Caso exceda os lançamentos mensais será cobrado os seguintes valores adicionais:
${lancamentos.faixas
  .map(
    (f, i) =>
      `${String.fromCharCode(98 + i)}) ${f.percentualAte >= 999 ? "acima de " + lancamentos.faixas[i - 1]?.percentualAte + "%" : "até " + f.percentualAte + "% de excedente"}: ${f.valorAdicional}`
  )
  .join("\n")}
O valor adicional será cobrado de forma única no mês subsequente à ocorrência, exclusivamente referente ao mês que exceder o limite.

CLÁUSULA 7 – CLÁUSULA DE REEQUILÍBRIO
Caso o CONTRATANTE seja desenquadrado do regime MEI, o contrato deverá ser revisto e adequado à nova realidade tributária.

CLÁUSULA 8 – VALOR E FORMA DE PAGAMENTO
Valor mensal: ${dados.valor}.
Data de vencimento: todo dia 10 de cada mês
Vigência mínima: ${dados.vigenciaMeses} meses.

CLÁUSULA 9 – RESCISÃO
Em caso de rescisão antecipada por iniciativa do CONTRATANTE, será devida multa correspondente a ${dados.multaDescricao}.

CLÁUSULA 10 – REAJUSTE
Ao término do prazo contratual, não havendo manifestação formal de rescisão por qualquer das partes, o presente contrato será automaticamente renovado por igual período, sendo o valor da mensalidade reajustado com base na variação acumulada do IPCA (Índice Nacional de Preços ao Consumidor Amplo) dos últimos 12 (doze) meses, ou outro índice oficial que venha a substituí-lo.

CLÁUSULA 11 – CONFIDENCIALIDADE E LGPD
O CONTRATADO compromete-se a tratar todos os dados fornecidos pelo CONTRATANTE em conformidade com a Lei nº 13.709/2018 (LGPD).
Os dados serão utilizados exclusivamente para execução dos serviços contratados, sendo vedado seu compartilhamento indevido.

CLÁUSULA 12 – LIMITAÇÃO DE RESPONSABILIDADE
O CONTRATADO não se responsabiliza por:
a) Multas decorrentes de atraso no envio de documentos;
b) Informações incorretas ou omitidas;
c) Excesso de faturamento não informado.

CLÁUSULA 13 – FORO
Fica eleito o Foro da Comarca de São Paulo/SP.

${dados.cidadeEmissao}, ${dados.dataEmissaoExtenso}.


______________________________________
${dados.responsavelNome ?? dados.contratanteNome}


______________________________________
${CONTRATADO.nome}`;
}
