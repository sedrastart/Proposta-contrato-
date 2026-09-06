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

  const qualificacaoContratante =
    dados.contratanteTipoPessoa === "PJ"
      ? `${dados.contratanteNome}, pessoa jurídica inscrita no CNPJ nº ${dados.contratanteCpfCnpj}, com sede na ${dados.contratanteEndereco}, CEP ${dados.contratanteCep}`
      : `${dados.contratanteNome}, portador(a) do CPF nº ${dados.contratanteCpfCnpj}, residente e domiciliado(a) na ${dados.contratanteEndereco}, CEP ${dados.contratanteCep}`;

  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE:
${qualificacaoContratante}${
    dados.responsavelNome
      ? `, neste ato representado por seu titular ${dados.responsavelNome}, inscrito no CPF nº ${dados.responsavelCpf ?? ""}`
      : ""
  }.

CONTRATADO:
${CONTRATADO.nome}, contador, inscrito no CPF nº ${CONTRATADO.cpf} e no ${CONTRATADO.crc}, residente na ${CONTRATADO_ENDERECO_MEI}.

O presente contrato é regido pelos arts. 593 a 609 do Código Civil, pela legislação do Microempreendedor Individual (Lei Complementar 123/2006) e demais normas aplicáveis.

${renderClausulas(clausulas, contexto)}

${dados.cidadeEmissao}, ${dados.dataEmissaoExtenso}.


______________________________________
${dados.responsavelNome ?? dados.contratanteNome}


______________________________________
${CONTRATADO.nome}`;
}
