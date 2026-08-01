-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "tipoPessoa" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cpfCnpj" TEXT NOT NULL,
    "inscricaoEstadual" TEXT,
    "enderecoLogradouro" TEXT NOT NULL,
    "enderecoNumero" TEXT NOT NULL,
    "enderecoComplemento" TEXT,
    "enderecoBairro" TEXT NOT NULL,
    "enderecoCidade" TEXT NOT NULL,
    "enderecoUf" TEXT NOT NULL,
    "enderecoCep" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "responsavelNome" TEXT,
    "responsavelCpf" TEXT,
    "regimeTributarioId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regimes_tributarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "regimes_tributarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos_regimes" (
    "servicoId" TEXT NOT NULL,
    "regimeTributarioId" TEXT NOT NULL,

    CONSTRAINT "servicos_regimes_pkey" PRIMARY KEY ("servicoId","regimeTributarioId")
);

-- CreateTable
CREATE TABLE "clientes_servicos" (
    "clienteId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "planoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_servicos_pkey" PRIMARY KEY ("clienteId","servicoId")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "regimeTributarioId" TEXT,
    "nome" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "vigenciaMeses" INTEGER NOT NULL,
    "multaPercentual" DOUBLE PRECISION,
    "multaDescricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos_limites_uso" (
    "id" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "tipoCobranca" TEXT NOT NULL,
    "valorPorUnidade" DOUBLE PRECISION,

    CONSTRAINT "planos_limites_uso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos_faixas_excedente" (
    "id" TEXT NOT NULL,
    "planoLimiteUsoId" TEXT NOT NULL,
    "percentualAte" DOUBLE PRECISION NOT NULL,
    "valorAdicional" DOUBLE PRECISION NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "planos_faixas_excedente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contadores" (
    "chave" TEXT NOT NULL,
    "valor" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "contadores_pkey" PRIMARY KEY ("chave")
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "numeroSequencial" INTEGER NOT NULL,
    "regimeSlug" TEXT NOT NULL,
    "contratanteNomeSnapshot" TEXT NOT NULL,
    "contratanteCpfCnpjSnapshot" TEXT NOT NULL,
    "enderecoSnapshot" TEXT NOT NULL,
    "valorFinal" TEXT NOT NULL,
    "vigenciaMeses" INTEGER NOT NULL,
    "multaTexto" TEXT NOT NULL,
    "servicosSnapshot" TEXT NOT NULL,
    "textoCompleto" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'emitido',
    "arquivoPdf" TEXT,
    "arquivoDocx" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpfCnpj_key" ON "clientes"("cpfCnpj");

-- CreateIndex
CREATE UNIQUE INDEX "regimes_tributarios_nome_key" ON "regimes_tributarios"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "regimes_tributarios_slug_key" ON "regimes_tributarios"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "servicos_nome_key" ON "servicos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_numeroSequencial_key" ON "contratos"("numeroSequencial");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_regimeTributarioId_fkey" FOREIGN KEY ("regimeTributarioId") REFERENCES "regimes_tributarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos_regimes" ADD CONSTRAINT "servicos_regimes_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos_regimes" ADD CONSTRAINT "servicos_regimes_regimeTributarioId_fkey" FOREIGN KEY ("regimeTributarioId") REFERENCES "regimes_tributarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_servicos" ADD CONSTRAINT "clientes_servicos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_servicos" ADD CONSTRAINT "clientes_servicos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_servicos" ADD CONSTRAINT "clientes_servicos_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos" ADD CONSTRAINT "planos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos" ADD CONSTRAINT "planos_regimeTributarioId_fkey" FOREIGN KEY ("regimeTributarioId") REFERENCES "regimes_tributarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos_limites_uso" ADD CONSTRAINT "planos_limites_uso_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos_faixas_excedente" ADD CONSTRAINT "planos_faixas_excedente_planoLimiteUsoId_fkey" FOREIGN KEY ("planoLimiteUsoId") REFERENCES "planos_limites_uso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

