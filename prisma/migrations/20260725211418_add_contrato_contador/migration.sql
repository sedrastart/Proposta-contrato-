-- CreateTable
CREATE TABLE "contadores" (
    "chave" TEXT NOT NULL PRIMARY KEY,
    "valor" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "dataEmissao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contratos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "contratos_numeroSequencial_key" ON "contratos"("numeroSequencial");
