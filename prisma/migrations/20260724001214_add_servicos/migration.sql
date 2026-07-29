-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "servicos_regimes" (
    "servicoId" TEXT NOT NULL,
    "regimeTributarioId" TEXT NOT NULL,

    PRIMARY KEY ("servicoId", "regimeTributarioId"),
    CONSTRAINT "servicos_regimes_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "servicos_regimes_regimeTributarioId_fkey" FOREIGN KEY ("regimeTributarioId") REFERENCES "regimes_tributarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clientes_servicos" (
    "clienteId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("clienteId", "servicoId"),
    CONSTRAINT "clientes_servicos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "clientes_servicos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "servicos_nome_key" ON "servicos"("nome");
