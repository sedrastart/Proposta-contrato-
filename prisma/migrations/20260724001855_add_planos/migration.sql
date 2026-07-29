-- CreateTable
CREATE TABLE "planos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "servicoId" TEXT NOT NULL,
    "regimeTributarioId" TEXT,
    "nome" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "vigenciaMeses" INTEGER NOT NULL,
    "multaPercentual" REAL,
    "multaDescricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "planos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "planos_regimeTributarioId_fkey" FOREIGN KEY ("regimeTributarioId") REFERENCES "regimes_tributarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "planos_limites_uso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planoId" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "tipoCobranca" TEXT NOT NULL,
    "valorPorUnidade" REAL,
    CONSTRAINT "planos_limites_uso_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "planos_faixas_excedente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planoLimiteUsoId" TEXT NOT NULL,
    "percentualAte" REAL NOT NULL,
    "valorAdicional" REAL NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "planos_faixas_excedente_planoLimiteUsoId_fkey" FOREIGN KEY ("planoLimiteUsoId") REFERENCES "planos_limites_uso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_clientes_servicos" (
    "clienteId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "planoId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("clienteId", "servicoId"),
    CONSTRAINT "clientes_servicos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "clientes_servicos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "clientes_servicos_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_clientes_servicos" ("clienteId", "criadoEm", "servicoId") SELECT "clienteId", "criadoEm", "servicoId" FROM "clientes_servicos";
DROP TABLE "clientes_servicos";
ALTER TABLE "new_clientes_servicos" RENAME TO "clientes_servicos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
