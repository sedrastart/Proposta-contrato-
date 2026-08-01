import type { DadosContrato } from "./types";
import { CONTRATADO } from "./contratado";
import { construirContextoMei } from "./contexto";
import { renderClausulas, type ClausulaRenderavel } from "./motor";

const CONTRATADO_ENDERECO_MEI =
  "rua Apóstolo Judas Tadeu 33, Cidade Tiradentes, São Paulo/SP, CEP 08475-510";

// Cabeçalho e rodapé fixos no código (mesmo racional do modelo geral); as
// 13 cláusulas vêm do banco (ClausulaModelo), editáveis pela área
// administrativa.
export function renderContratoMei(
  dados: DadosContrato,
  clausulas: ClausulaRenderavel[]
): string {
  const contexto = construirContextoMei(dados);

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

${renderClausulas(clausulas, contexto)}

${dados.cidadeEmissao}, ${dados.dataEmissaoExtenso}.


______________________________________
${dados.responsavelNome ?? dados.contratanteNome}


______________________________________
${CONTRATADO.nome}`;
}
