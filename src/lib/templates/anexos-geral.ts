import type { DadosContrato } from "./types";

// Anexos I a IV do contrato real do Magno — verbatim, exceto o valor dos
// honorários no Anexo II (item 1), que repete o mesmo dado dinâmico da
// Cláusula 3 do corpo principal.
export function renderAnexosGeral(dados: DadosContrato): string {
  const assinaturas = `_______________________________
${dados.responsavelNome ?? dados.contratanteNome}
CONTRATANTE

_______________________________
Fernando Soares Matos da Silva
CONTRATADO`;

  return `ANEXOS DO CONTRATO

ANEXO I - LISTA DE SERVIÇOS INCLUÍDOS E SERVIÇOS EXTRAS

O presente anexo tem por finalidade detalhar os serviços compreendidos na mensalidade contratada e aqueles considerados serviços extraordinários.

1. SERVIÇOS INCLUÍDOS NA MENSALIDADE

Estão incluídos no valor mensal contratado os seguintes serviços:

1.1 Escrituração Contábil
● Classificação contábil das movimentações financeiras
● Escrituração contábil conforme normas brasileiras de contabilidade
● Elaboração de balancetes contábeis periódicos
● Elaboração de demonstrações contábeis obrigatórias quando aplicável

1.2 Escrituração Fiscal
● Apuração de tributos federais, estaduais e municipais aplicáveis
● Emissão de guias de recolhimento de impostos
● Orientação sobre cumprimento das obrigações fiscais

1.3 Obrigações Acessórias
● Elaboração e transmissão de declarações fiscais obrigatórias exigidas pelos órgãos públicos
● Cumprimento das obrigações acessórias relacionadas ao regime tributário da empresa

1.4 Assessoria Contábil
● Orientação básica sobre obrigações fiscais e contábeis
● Esclarecimento de dúvidas relacionadas à contabilidade da empresa
● Apoio na organização documental básica para fins contábeis

2. SERVIÇOS NÃO INCLUÍDOS (SERVIÇOS EXTRAS)

Os serviços abaixo não estão incluídos na mensalidade contratada e poderão ser cobrados separadamente mediante orçamento prévio:
● abertura de empresa
● alteração contratual ou cadastral
● encerramento de empresa
● regularização fiscal de períodos anteriores
● parcelamentos tributários
● planejamento tributário
● recuperação de créditos tributários
● elaboração de relatórios gerenciais específicos
● emissão de certidões específicas
● atendimento a fiscalizações ou auditorias
● defesas administrativas perante órgãos fiscais
● elaboração de contratos ou documentos jurídicos
● assessoria financeira ou consultoria empresarial aprofundada.

3. APROVAÇÃO DE SERVIÇOS EXTRAS

Qualquer serviço extraordinário somente será executado após apresentação de orçamento ao CONTRATANTE e aprovação formal do serviço solicitado.

${assinaturas}


ANEXO II - POLÍTICA DE HONORÁRIOS E REAJUSTES

Este anexo estabelece as regras relacionadas aos honorários profissionais e reajustes contratuais.

1. VALOR DOS HONORÁRIOS

Pelos serviços contratados, o CONTRATANTE pagará ao CONTRATADO o valor mensal de:
${dados.valor}.

2. DATA DE PAGAMENTO

O pagamento deverá ser realizado mensalmente até o dia 10, por meio de:
● boleto bancário (Bolix)
● transferência bancária (PIX)
● outro meio acordado entre as partes.

3. ATRASO NO PAGAMENTO

Em caso de atraso no pagamento incidirão:
● multa de 2% sobre o valor devido
● juros de 1% ao mês
● correção monetária.

Caso a inadimplência ultrapasse 30 dias, os serviços poderão ser suspensos até regularização.

4. REAJUSTE ANUAL

Os honorários poderão ser reajustados anualmente, considerando:
● revisão interna de honorários profissionais.

O reajuste será comunicado ao CONTRATANTE com antecedência mínima de 10 dias corridos.

5. REVISÃO EXTRAORDINÁRIA DE HONORÁRIOS

Os honorários poderão ser revisados antes do prazo anual nos seguintes casos:
● aumento significativo do volume de movimentações da empresa
● mudança de regime tributário
● inclusão de funcionários
● inclusão de novas obrigações acessórias
● aumento relevante da complexidade operacional.

Nessas situações será apresentado novo orçamento ao CONTRATANTE.

${assinaturas}


ANEXO III - POLÍTICA DE ENVIO DE DOCUMENTOS CONTÁBEIS

Este anexo estabelece as regras para envio de documentos necessários ao processamento contábil da empresa.

1. PRAZO DE ENVIO

Os documentos contábeis deverão ser enviados ao CONTRATADO até o dia 10 (dez) do mês subsequente ao mês de competência.

2. DOCUMENTOS QUE DEVEM SER ENVIADOS

Devem ser encaminhados mensalmente:

Documentos de Receita
● notas fiscais emitidas
● relatórios de faturamento
● comprovantes de recebimentos.

Documentos Bancários
● extratos bancários completos
● extratos de contas digitais
● extratos de máquinas de cartão.

Documentos de Despesas
● notas fiscais de despesas
● comprovantes de pagamento
● despesas operacionais
● despesas administrativas.

Documentos de Caixa
● controle de caixa
● movimentações em dinheiro.

3. FORMATO DE ENVIO

Recomenda-se que os documentos sejam enviados preferencialmente por meio de:
● pasta digital compartilhada
● e-mail organizado por competência
● sistema de gestão financeira ou contábil
● aplicativo de gestão documental.

4. BOAS PRÁTICAS DE ORGANIZAÇÃO

Para garantir maior eficiência contábil, recomenda-se ao CONTRATANTE:
● manter organização mensal de documentos
● registrar despesas quando ocorrem
● evitar envio fragmentado de documentos
● centralizar documentos em um único canal de envio.

5. ENVIO FORA DO PRAZO

Caso os documentos sejam enviados após o prazo estabelecido:
● o CONTRATADO não poderá garantir a entrega das obrigações dentro do prazo legal
● eventuais multas ou penalidades fiscais decorrentes serão de responsabilidade do CONTRATANTE.

${assinaturas}


ANEXO IV - MATRIZ DE RESPONSABILIDADES CONTÁBEIS

Este anexo integra o Contrato de Prestação de Serviços Contábeis.

1. OBJETIVO

Este anexo tem como objetivo estabelecer de forma clara e objetiva as responsabilidades operacionais, fiscais e contábeis de cada parte, garantindo transparência na execução dos serviços contratados e prevenindo divergências quanto às obrigações legais.

2. RESPONSABILIDADES DO CONTRATADO (CONTADOR)

Compete ao CONTRATADO:

2.1 Processamento Contábil
● realizar a classificação contábil das movimentações financeiras
● realizar a escrituração contábil conforme normas brasileiras de contabilidade
● elaborar demonstrativos contábeis obrigatórios quando aplicável.

2.2 Apuração Fiscal
● apurar tributos federais, estaduais e municipais conforme legislação vigente
● emitir guias de recolhimento de impostos
● orientar o CONTRATANTE sobre prazos e obrigações fiscais.

2.3 Obrigações Acessórias
● elaborar e transmitir declarações obrigatórias aos órgãos fiscais
● manter acompanhamento das obrigações fiscais relacionadas ao regime tributário da empresa.

2.4 Orientação Profissional
● orientar o CONTRATANTE sobre obrigações contábeis e fiscais
● informar alterações relevantes na legislação tributária que impactem a empresa.

3. RESPONSABILIDADES DO CONTRATANTE (EMPRESÁRIO)

Compete ao CONTRATANTE:

3.1 Fornecimento de Informações
● fornecer ao contador todas as informações necessárias para execução dos serviços
● garantir a veracidade e integridade das informações prestadas.

3.2 Envio de Documentos
● enviar mensalmente os documentos contábeis até o dia 10 do mês subsequente ao mês de competência
● encaminhar documentos completos e legíveis.

3.3 Pagamento de Tributos
● efetuar o pagamento dos tributos dentro do prazo de vencimento das guias emitidas
● manter saldo financeiro suficiente para cumprimento das obrigações fiscais.

3.4 Cumprimento de Obrigações Trabalhistas

Caso a empresa possua funcionários, será responsabilidade do CONTRATANTE:
● informar admissões, demissões e alterações contratuais
  o admissões devem ser informadas com antecedência mínima de 48 horas.
● cumprir obrigações trabalhistas e previdenciárias
● pagar salários e encargos trabalhistas.

3.5 Atualização de Informações

Compete ainda ao CONTRATANTE informar ao CONTRATADO sempre que ocorrer:
● alteração de endereço
● alteração de atividade econômica
● alteração societária
● abertura de conta bancária
● contratação de funcionários
● aquisição de bens relevantes para a empresa.

4. LIMITES DE RESPONSABILIDADE DO CONTADOR

O CONTRATADO não poderá ser responsabilizado por:
● informações incorretas fornecidas pelo CONTRATANTE
● omissão de documentos
● envio tardio de documentos
● ausência de documentos fiscais ou financeiros
● pagamentos de tributos não realizados pelo CONTRATANTE.

Eventuais multas ou penalidades decorrentes dessas situações serão de responsabilidade exclusiva do CONTRATANTE.

5. RESPONSABILIDADE SOBRE DECISÕES EMPRESARIAIS

Decisões relacionadas à gestão da empresa, tais como:
● formação de preços
● contratação de funcionários
● tomada de empréstimos
● investimentos
● políticas comerciais,

são de responsabilidade exclusiva do CONTRATANTE.

O CONTRATADO atua exclusivamente como profissional contábil e orientador técnico, não sendo responsável por decisões empresariais tomadas pelo CONTRATANTE.

6. COMUNICAÇÃO ENTRE AS PARTES

A comunicação entre CONTRATANTE e CONTRATADO deverá ocorrer por meio de:
● e-mail
● aplicativo de mensagens
● reuniões previamente agendadas.

Todas as orientações relevantes poderão ser formalizadas por meio eletrônico.

7. DISPOSIÇÕES FINAIS

Este anexo passa a integrar o Contrato de Prestação de Serviços Contábeis, tendo a mesma validade jurídica.

${assinaturas}`;
}
