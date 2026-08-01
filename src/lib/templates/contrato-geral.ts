import type { DadosContrato } from "./types";
import { CONTRATADO } from "./contratado";
import { construirContextoGeral } from "./contexto";
import { renderClausulas, substituirPlaceholders, type ClausulaRenderavel } from "./motor";

// Cabeçalho (identificação das partes) e rodapé (assinatura) são fixos no
// código — não são "cláusula" editável, e o rodapé envolve o CPF do
// contador. O corpo (cláusulas + anexos) vem do banco (ClausulaModelo),
// editável pela área administrativa sem precisar de deploy.
export function renderContratoGeral(
  dados: DadosContrato,
  clausulas: ClausulaRenderavel[]
): string {
  const contexto = construirContextoGeral(dados);
  const corpoClausulas = clausulas.filter((c) => c.tipo !== "anexo");
  const anexos = clausulas.filter((c) => c.tipo === "anexo");

  const assinaturas = `_______________________________
${dados.responsavelNome ?? dados.contratanteNome}
CONTRATANTE

_______________________________
${CONTRATADO.nome}
CONTRATADO`;

  const textoAnexos = anexos
    .map(
      (anexo) =>
        `${anexo.titulo}\n\n${substituirPlaceholders(anexo.corpo, contexto)}\n\n${assinaturas}`
    )
    .join("\n\n\n");

  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS CONTÁBEIS

Pelo presente instrumento particular de prestação de serviços contábeis, de um lado:

${dados.contratanteNome}, inscrito no CNPJ/CPF sob nº ${dados.contratanteCpfCnpj}, com sede na ${dados.contratanteEndereco}, CEP ${dados.contratanteCep}${
    dados.responsavelNome
      ? `, neste ato representado por seu titular:\n\n${dados.responsavelNome}, inscrito no CPF nº ${dados.responsavelCpf ?? ""}, doravante denominado CONTRATANTE.`
      : ", doravante denominado CONTRATANTE."
  }

${CONTRATADO.nome}, contador autônomo, inscrito no CPF nº ${CONTRATADO.cpf}, registrado no Cadastro de Contribuintes Mobiliários da Prefeitura de São Paulo sob nº ${CONTRATADO.cmcSp}, com endereço profissional na ${CONTRATADO.enderecoProfissional}, doravante denominado CONTRATADO.

${renderClausulas(corpoClausulas, contexto)}

${dados.cidadeEmissao}, ${dados.dataEmissaoExtenso}.


${assinaturas}


${anexos.length > 0 ? `ANEXOS DO CONTRATO\n\n${textoAnexos}` : ""}`;
}
