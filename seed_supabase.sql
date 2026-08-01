-- Seed inicial: regimes, servicos, planos (equivalente a prisma/seed.ts)
BEGIN;

-- Regimes tributarios
INSERT INTO "regimes_tributarios" ("id","nome","slug","ordem","ativo") VALUES ('b1d84cb0-dcf7-4a17-ba43-2bcc1a60f2c4','MEI','mei',1,true);
INSERT INTO "regimes_tributarios" ("id","nome","slug","ordem","ativo") VALUES ('a9c69337-f24e-4b95-b47d-7371fb568cc1','Simples Nacional','simples-nacional',2,true);
INSERT INTO "regimes_tributarios" ("id","nome","slug","ordem","ativo") VALUES ('5cfcd373-6e16-4fff-ab03-160147e1be03','Lucro Presumido','lucro-presumido',3,true);
INSERT INTO "regimes_tributarios" ("id","nome","slug","ordem","ativo") VALUES ('44ed7a64-fdd3-45b6-bcd5-eacb1085c337','Lucro Real','lucro-real',4,true);

-- Servicos
INSERT INTO "servicos" ("id","nome","ordem","ativo") VALUES ('9b707728-be2e-4850-afc4-133a5ecab779','Contabilidade',1,true);
INSERT INTO "servicos" ("id","nome","ordem","ativo") VALUES ('684932a9-1919-40fb-9e7a-77ec9c1d12d9','Departamento Pessoal',2,true);
INSERT INTO "servicos" ("id","nome","ordem","ativo") VALUES ('986c0126-6785-48d7-b785-3a24aa65441d','Escrita Fiscal',3,true);
INSERT INTO "servicos" ("id","nome","ordem","ativo") VALUES ('ff16cd20-4786-4c25-ac24-cff722e1f81b','Abertura de Empresa',4,true);
INSERT INTO "servicos" ("id","nome","ordem","ativo") VALUES ('8cdd20c6-1380-4291-958b-b063701a5dc6','Alteração Contratual',5,true);
INSERT INTO "servicos" ("id","nome","ordem","ativo") VALUES ('5d2e8479-ac42-41d2-be5b-aab1c60d46c3','Encerramento de Empresa',6,true);
INSERT INTO "servicos" ("id","nome","ordem","ativo") VALUES ('61f53939-eadb-47c5-88cb-35fd1a829f05','Consultoria Tributária',7,true);
INSERT INTO "servicos" ("id","nome","ordem","ativo") VALUES ('4d777def-b323-4486-a138-b1092f2afaa5','Planejamento Tributário',8,true);
INSERT INTO "servicos" ("id","nome","ordem","ativo") VALUES ('f9b350d0-45b5-498f-a029-19f4b9bb033b','BPO Financeiro',9,true);
INSERT INTO "servicos" ("id","nome","ordem","ativo") VALUES ('a6645b6e-ad2e-4b60-9dd9-8fccd3866499','Regularização Fiscal',10,true);
INSERT INTO "servicos" ("id","nome","ordem","ativo") VALUES ('176ac9d2-2a22-4a17-8c36-28aabd4c2dba','Emissão de Certificados',11,true);
INSERT INTO "servicos" ("id","nome","ordem","ativo") VALUES ('88df7f74-62b3-4205-a12e-918d18da0854','Outros',12,true);

-- Disponibilidade de servicos por regime
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('9b707728-be2e-4850-afc4-133a5ecab779','b1d84cb0-dcf7-4a17-ba43-2bcc1a60f2c4');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('9b707728-be2e-4850-afc4-133a5ecab779','a9c69337-f24e-4b95-b47d-7371fb568cc1');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('9b707728-be2e-4850-afc4-133a5ecab779','5cfcd373-6e16-4fff-ab03-160147e1be03');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('9b707728-be2e-4850-afc4-133a5ecab779','44ed7a64-fdd3-45b6-bcd5-eacb1085c337');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('684932a9-1919-40fb-9e7a-77ec9c1d12d9','a9c69337-f24e-4b95-b47d-7371fb568cc1');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('684932a9-1919-40fb-9e7a-77ec9c1d12d9','5cfcd373-6e16-4fff-ab03-160147e1be03');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('684932a9-1919-40fb-9e7a-77ec9c1d12d9','44ed7a64-fdd3-45b6-bcd5-eacb1085c337');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('986c0126-6785-48d7-b785-3a24aa65441d','a9c69337-f24e-4b95-b47d-7371fb568cc1');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('986c0126-6785-48d7-b785-3a24aa65441d','5cfcd373-6e16-4fff-ab03-160147e1be03');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('986c0126-6785-48d7-b785-3a24aa65441d','44ed7a64-fdd3-45b6-bcd5-eacb1085c337');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('ff16cd20-4786-4c25-ac24-cff722e1f81b','b1d84cb0-dcf7-4a17-ba43-2bcc1a60f2c4');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('ff16cd20-4786-4c25-ac24-cff722e1f81b','a9c69337-f24e-4b95-b47d-7371fb568cc1');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('ff16cd20-4786-4c25-ac24-cff722e1f81b','5cfcd373-6e16-4fff-ab03-160147e1be03');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('ff16cd20-4786-4c25-ac24-cff722e1f81b','44ed7a64-fdd3-45b6-bcd5-eacb1085c337');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('8cdd20c6-1380-4291-958b-b063701a5dc6','a9c69337-f24e-4b95-b47d-7371fb568cc1');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('8cdd20c6-1380-4291-958b-b063701a5dc6','5cfcd373-6e16-4fff-ab03-160147e1be03');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('8cdd20c6-1380-4291-958b-b063701a5dc6','44ed7a64-fdd3-45b6-bcd5-eacb1085c337');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('5d2e8479-ac42-41d2-be5b-aab1c60d46c3','b1d84cb0-dcf7-4a17-ba43-2bcc1a60f2c4');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('5d2e8479-ac42-41d2-be5b-aab1c60d46c3','a9c69337-f24e-4b95-b47d-7371fb568cc1');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('5d2e8479-ac42-41d2-be5b-aab1c60d46c3','5cfcd373-6e16-4fff-ab03-160147e1be03');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('5d2e8479-ac42-41d2-be5b-aab1c60d46c3','44ed7a64-fdd3-45b6-bcd5-eacb1085c337');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('61f53939-eadb-47c5-88cb-35fd1a829f05','a9c69337-f24e-4b95-b47d-7371fb568cc1');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('61f53939-eadb-47c5-88cb-35fd1a829f05','5cfcd373-6e16-4fff-ab03-160147e1be03');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('61f53939-eadb-47c5-88cb-35fd1a829f05','44ed7a64-fdd3-45b6-bcd5-eacb1085c337');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('4d777def-b323-4486-a138-b1092f2afaa5','5cfcd373-6e16-4fff-ab03-160147e1be03');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('4d777def-b323-4486-a138-b1092f2afaa5','44ed7a64-fdd3-45b6-bcd5-eacb1085c337');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('f9b350d0-45b5-498f-a029-19f4b9bb033b','a9c69337-f24e-4b95-b47d-7371fb568cc1');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('f9b350d0-45b5-498f-a029-19f4b9bb033b','5cfcd373-6e16-4fff-ab03-160147e1be03');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('f9b350d0-45b5-498f-a029-19f4b9bb033b','44ed7a64-fdd3-45b6-bcd5-eacb1085c337');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('a6645b6e-ad2e-4b60-9dd9-8fccd3866499','b1d84cb0-dcf7-4a17-ba43-2bcc1a60f2c4');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('a6645b6e-ad2e-4b60-9dd9-8fccd3866499','a9c69337-f24e-4b95-b47d-7371fb568cc1');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('a6645b6e-ad2e-4b60-9dd9-8fccd3866499','5cfcd373-6e16-4fff-ab03-160147e1be03');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('a6645b6e-ad2e-4b60-9dd9-8fccd3866499','44ed7a64-fdd3-45b6-bcd5-eacb1085c337');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('176ac9d2-2a22-4a17-8c36-28aabd4c2dba','b1d84cb0-dcf7-4a17-ba43-2bcc1a60f2c4');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('176ac9d2-2a22-4a17-8c36-28aabd4c2dba','a9c69337-f24e-4b95-b47d-7371fb568cc1');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('176ac9d2-2a22-4a17-8c36-28aabd4c2dba','5cfcd373-6e16-4fff-ab03-160147e1be03');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('176ac9d2-2a22-4a17-8c36-28aabd4c2dba','44ed7a64-fdd3-45b6-bcd5-eacb1085c337');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('88df7f74-62b3-4205-a12e-918d18da0854','b1d84cb0-dcf7-4a17-ba43-2bcc1a60f2c4');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('88df7f74-62b3-4205-a12e-918d18da0854','a9c69337-f24e-4b95-b47d-7371fb568cc1');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('88df7f74-62b3-4205-a12e-918d18da0854','5cfcd373-6e16-4fff-ab03-160147e1be03');
INSERT INTO "servicos_regimes" ("servicoId","regimeTributarioId") VALUES ('88df7f74-62b3-4205-a12e-918d18da0854','44ed7a64-fdd3-45b6-bcd5-eacb1085c337');

-- Plano MEI
INSERT INTO "planos" ("id","servicoId","regimeTributarioId","nome","valor","vigenciaMeses","multaPercentual","multaDescricao","ordem","ativo") VALUES ('2525fdda-3be1-4774-b631-41702f18b012','9b707728-be2e-4850-afc4-133a5ecab779','b1d84cb0-dcf7-4a17-ba43-2bcc1a60f2c4','Contabilidade MEI — 12 meses',39.9,12,50,'50% do valor restante até o término do contrato',1,true);
INSERT INTO "planos_limites_uso" ("id","planoId","unidade","quantidade","tipoCobranca","valorPorUnidade") VALUES ('009e7563-9802-41bc-b8d6-b5d041fc565b','2525fdda-3be1-4774-b631-41702f18b012','lançamentos',50,'faixa',NULL);
INSERT INTO "planos_faixas_excedente" ("id","planoLimiteUsoId","percentualAte","valorAdicional","ordem") VALUES ('aff6eccb-0fd5-4d7c-9bee-0562ff298249','009e7563-9802-41bc-b8d6-b5d041fc565b',33,9.9,1);
INSERT INTO "planos_faixas_excedente" ("id","planoLimiteUsoId","percentualAte","valorAdicional","ordem") VALUES ('a13edcc8-4f24-4f52-b95e-34a2a9a33ce0','009e7563-9802-41bc-b8d6-b5d041fc565b',66,19.9,2);
INSERT INTO "planos_faixas_excedente" ("id","planoLimiteUsoId","percentualAte","valorAdicional","ordem") VALUES ('4c79d012-8d2e-496e-b013-36f1312037e3','009e7563-9802-41bc-b8d6-b5d041fc565b',999,29.9,3);
INSERT INTO "planos_limites_uso" ("id","planoId","unidade","quantidade","tipoCobranca","valorPorUnidade") VALUES ('06864718-1ba6-44ae-9f00-6bb2ad3bf89b','2525fdda-3be1-4774-b631-41702f18b012','notas fiscais',3,'por_unidade',5);

-- Planos do regime geral (Simples Nacional)
INSERT INTO "planos" ("id","servicoId","regimeTributarioId","nome","valor","vigenciaMeses","multaPercentual","multaDescricao","ordem","ativo") VALUES ('aff979bb-c841-44c6-ae1f-8c12c481b29f','9b707728-be2e-4850-afc4-133a5ecab779','a9c69337-f24e-4b95-b47d-7371fb568cc1','Contabilidade — 12 meses',199.9,12,50,'50% do valor das mensalidades vincendas, limitada ao prazo restante do contrato',1,true);
INSERT INTO "planos" ("id","servicoId","regimeTributarioId","nome","valor","vigenciaMeses","multaPercentual","multaDescricao","ordem","ativo") VALUES ('ffc6d14d-3d05-47f2-8762-7933ee6d7d97','9b707728-be2e-4850-afc4-133a5ecab779','a9c69337-f24e-4b95-b47d-7371fb568cc1','Contabilidade — Mensal (sem fidelidade)',299.9,1,NULL,'Não possui',2,true);

-- Contador para numeracao sequencial de contratos
INSERT INTO "contadores" ("chave","valor") VALUES ('contrato', 0) ON CONFLICT ("chave") DO NOTHING;

COMMIT;