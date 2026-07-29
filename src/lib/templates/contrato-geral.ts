import type { DadosContrato } from "./types";
import { CONTRATADO } from "./contratado";
import { renderAnexosGeral } from "./anexos-geral";

// Reproduz o corpo (28 cláusulas) do contrato real do Magno — Simples
// Nacional / Lucro Presumido / Lucro Real — seguido dos Anexos I a IV
// (integrados por referência na Cláusula 27), cada um com sua própria
// assinatura, igual ao documento original.
export function renderContratoGeral(dados: DadosContrato): string {
  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS CONTÁBEIS

Pelo presente instrumento particular de prestação de serviços contábeis, de um lado:

${dados.contratanteNome}, inscrito no CNPJ/CPF sob nº ${dados.contratanteCpfCnpj}, com sede na ${dados.contratanteEndereco}, CEP ${dados.contratanteCep}${
    dados.responsavelNome
      ? `, neste ato representado por seu titular:\n\n${dados.responsavelNome}, inscrito no CPF nº ${dados.responsavelCpf ?? ""}, doravante denominado CONTRATANTE.`
      : ", doravante denominado CONTRATANTE."
  }

${CONTRATADO.nome}, contador autônomo, inscrito no CPF nº ${CONTRATADO.cpf}, registrado no Cadastro de Contribuintes Mobiliários da Prefeitura de São Paulo sob nº ${CONTRATADO.cmcSp}, com endereço profissional na ${CONTRATADO.enderecoProfissional}, doravante denominado CONTRATADO.

CLÁUSULA 1 – DO OBJETO
O presente contrato tem por objeto a prestação de serviços profissionais de contabilidade, assessoria fiscal e orientação empresarial, executados pelo CONTRATADO ao CONTRATANTE, em conformidade com:
● Código Civil Brasileiro (arts. 593 a 609 – prestação de serviços)
● Normas Brasileiras de Contabilidade
● Normas do Conselho Federal de Contabilidade
● Legislação tributária vigente.
Serviços contratados: ${dados.servicosSelecionados.join(", ")}.

CLÁUSULA 2 – DO ESCOPO DOS SERVIÇOS CONTÁBEIS
Os serviços contratados compreendem:
● Escrituração Contábil
● Escrituração Fiscal
● Obrigações Acessórias
● Assessoria Contábil
O detalhamento completo dos serviços incluídos e dos serviços não incluídos encontra-se descrito no ANEXO I.

CLÁUSULA 3 – POLÍTICA DE HONORÁRIOS
Pelos serviços prestados, o CONTRATANTE pagará ao CONTRATADO a quantia mensal de:
${dados.valor}.
O presente contrato considera o volume atual de movimentações da empresa. Caso haja aumento significativo de documentos fiscais ou volume operacional, os honorários poderão ser revisados, sendo apresentado novo orçamento ao CONTRATANTE.
Detalhamento completo da política de honorários e demais regras estão descritos no ANEXO II.

CLÁUSULA 4 - SUSPENSÃO DOS SERVIÇOS
Em caso de inadimplência superior a 30 dias, o CONTRATADO poderá suspender a prestação dos serviços até a regularização dos pagamentos, não sendo o CONTRATADO responsável por eventuais penalidades fiscais ou administrativas decorrentes da suspensão.

CLÁUSULA 5 – DO REAJUSTE CONTRATUAL
O valor da mensalidade poderá ser reajustado anualmente, contado da data de assinatura deste contrato, conforme detalhado no ANEXO II.

CLÁUSULA 6 – COMUNICAÇÃO ENTRE AS PARTES
Todas as comunicações relacionadas à execução deste contrato poderão ser realizadas por e-mail, aplicativos de mensagens ou outros meios eletrônicos, sendo consideradas válidas para todos os efeitos legais.

CLÁUSULA 7 – ALTERAÇÕES CONTRATUAIS
Qualquer alteração neste contrato somente terá validade mediante acordo formal entre as partes.

CLÁUSULA 8 – DOCUMENTOS DIGITAIS
As partes reconhecem a validade jurídica de documentos eletrônicos e comunicações digitais utilizadas no cumprimento deste contrato.

CLÁUSULA 9 – DA VIGÊNCIA
O presente contrato terá vigência de ${dados.vigenciaMeses} (${dados.vigenciaMeses === 12 ? "doze" : dados.vigenciaMeses}) ${dados.vigenciaMeses === 1 ? "mês" : "meses"}, contados da data de sua assinatura.

CLÁUSULA 10 - VIGÊNCIA AUTOMÁTICA
Ao término da vigência, o contrato será automaticamente renovado por prazo indeterminado, salvo manifestação contrária de qualquer das partes.

CLÁUSULA 11 – DA RESCISÃO
O contrato poderá ser rescindido por qualquer das partes mediante comunicação formal.
Em caso de rescisão antecipada por iniciativa do CONTRATANTE, será devida multa equivalente a ${dados.multaDescricao}.

CLÁUSULA 12 - TRANSIÇÃO DE CONTABILIDADE
Em caso de rescisão contratual, o CONTRATADO disponibilizará ao CONTRATANTE ou ao novo contador os documentos e informações contábeis existentes, desde que não haja pendências financeiras ou contratuais.

CLÁUSULA 13 - CERTIFICADO DIGITAL
O CONTRATANTE compromete-se a manter certificado digital válido sempre que exigido para cumprimento das obrigações fiscais. Na ausência de certificado digital, o CONTRATANTE autoriza expressamente o uso de outros meios de acesso necessários ao cumprimento das obrigações fiscais.

CLÁUSULA 14 – POLÍTICA DE ENVIO DE DOCUMENTOS CONTÁBEIS
Para execução adequada da contabilidade, o CONTRATANTE deverá enviar até o dia 10 do mês subsequente ao mês de competência toda documentação necessária para fechamento contábil e cumprimento das obrigações acessórias.
Caso os documentos sejam enviados após o prazo estabelecido, o CONTRATADO não se responsabiliza por:
● atrasos na entrega de declarações
● multas fiscais
● inconsistências decorrentes da ausência de informações.
Para execução adequada da política de envio de documentos contábeis, o CONTRATANTE deverá seguir as determinações do ANEXO III.

CLÁUSULA 15 - GUARDA DE DOCUMENTOS
O CONTRATANTE é responsável pela guarda dos documentos fiscais e contábeis pelo prazo legal de 5 anos.

CLÁUSULA 16 – SLA DE ATENDIMENTO
O CONTRATADO compromete-se a responder solicitações do CONTRATANTE dentro do prazo máximo de:
1 (um) dia útil, durante horário comercial.
O SLA aplica-se a:
● dúvidas contábeis
● solicitações administrativas
● orientações fiscais.
Demandas complexas poderão exigir prazo adicional, previamente informado ao CONTRATANTE.

CLÁUSULA 17 – LIMITES DE RESPONSABILIDADE PROFISSIONAL
A responsabilidade técnica do CONTRATADO limita-se às informações fornecidas pelo CONTRATANTE.
O CONTRATADO não será responsável por:
● informações incorretas ou incompletas
● omissão de documentos
● envio tardio de dados
● decisões empresariais do CONTRATANTE.
O CONTRATADO não se responsabiliza por multas decorrentes de atraso no envio de informações ou documentos pelo CONTRATANTE.
Os limites e responsabilidades das partes encontram-se detalhados no ANEXO IV.

CLÁUSULA 18 – RESPONSABILIDADE TRIBUTÁRIA E TRABALHISTA
A responsabilidade pelo cumprimento das obrigações legais da empresa é do CONTRATANTE.
Compete ao CONTRATANTE:
● pagamento de tributos
● contratação de funcionários
● cumprimento de obrigações trabalhistas
● cumprimento de normas fiscais.
O CONTRATADO atua exclusivamente na apuração e orientação contábil, não sendo responsável por decisões administrativas ou financeiras da empresa, conforme detalhado no ANEXO IV.

CLÁUSULA 19 - RESPONSABILIDADE SOBRE DECISÕES TRIBUTÁRIAS
O CONTRATADO atua com base na legislação vigente à época da execução dos serviços. Eventuais mudanças de interpretação ou alterações legais posteriores não caracterizam erro profissional.

CLÁUSULA 20 - RESPONSABILIDADE SOBRE DECISÕES FINANCEIRAS
O CONTRATADO não atua como gestor financeiro da empresa, sendo as decisões relacionadas à gestão financeira de responsabilidade exclusiva do CONTRATANTE.

CLÁUSULA 21 - CASO FORTUITO
O CONTRATADO não será responsabilizado por falhas decorrentes de indisponibilidade temporária de sistemas governamentais, plataformas fiscais, serviços bancários ou eventos de força maior.

CLÁUSULA 22 - LIMITAÇÃO DE RESPONSABILIDADE FINANCEIRA
A responsabilidade civil do CONTRATADO decorrente da execução dos serviços previstos neste contrato fica limitada ao valor equivalente a 12 (doze) meses de honorários contratuais vigentes à época do evento que deu origem à eventual responsabilidade.

CLÁUSULA 23 – PRAZO PARA QUESTIONAMENTO DOS SERVIÇOS
O CONTRATANTE deverá comunicar ao CONTRATADO qualquer inconsistência ou divergência relacionada aos serviços prestados no prazo máximo de 180 (cento e oitenta) dias contados da data de entrega dos relatórios, demonstrações contábeis ou documentos relacionados ao serviço executado.
Após esse prazo, considerar-se-ão aceitos os serviços prestados, não cabendo ao CONTRATANTE qualquer reclamação ou questionamento relacionado aos mesmos, ressalvadas as hipóteses de dolo ou fraude, nos termos da legislação vigente.

CLÁUSULA 24 - COMPLIANCE FISCAL
O CONTRATANTE declara que suas atividades empresariais são lícitas e em conformidade com a legislação vigente.

CLÁUSULA 25 – CONFIDENCIALIDADE E LGPD
As partes comprometem-se a respeitar a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), mantendo sigilo sobre informações comerciais, fiscais, financeiras e dados pessoais tratados no âmbito deste contrato.

CLÁUSULA 26 – DA NATUREZA DA RELAÇÃO
Este contrato não gera vínculo empregatício entre as partes, caracterizando-se exclusivamente como prestação de serviços profissionais autônomos.

CLÁUSULA 27 – INTEGRAÇÃO DOS ANEXOS
Os anexos I, II, III e IV integram o presente contrato para todos os fins legais.

CLÁUSULA 28 – DO FORO
Fica eleito o foro da Comarca de São Paulo – SP, para dirimir quaisquer conflitos decorrentes deste contrato.

${dados.cidadeEmissao}, ${dados.dataEmissaoExtenso}.


_______________________________
${dados.responsavelNome ?? dados.contratanteNome}
CONTRATANTE

_______________________________
${CONTRATADO.nome}
CONTRATADO


${renderAnexosGeral(dados)}`;
}
