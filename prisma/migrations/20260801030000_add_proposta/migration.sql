-- CreateTable
CREATE TABLE "propostas" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "numeroSequencial" INTEGER NOT NULL,
    "contratanteNomeSnapshot" TEXT NOT NULL,
    "contratanteCpfCnpjSnapshot" TEXT NOT NULL,
    "enderecoSnapshot" TEXT NOT NULL,
    "valorFinal" TEXT NOT NULL,
    "vigenciaMeses" INTEGER NOT NULL,
    "multaTexto" TEXT NOT NULL,
    "servicosSnapshot" TEXT NOT NULL,
    "textoCompleto" TEXT NOT NULL,
    "arquivoPdf" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "propostas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "propostas_numeroSequencial_key" ON "propostas"("numeroSequencial");

-- AddForeignKey
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
