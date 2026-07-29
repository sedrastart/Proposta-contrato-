-- CreateTable
CREATE TABLE "regimes_tributarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_clientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "clientes_regimeTributarioId_fkey" FOREIGN KEY ("regimeTributarioId") REFERENCES "regimes_tributarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_clientes" ("atualizadoEm", "cpfCnpj", "criadoEm", "email", "enderecoBairro", "enderecoCep", "enderecoCidade", "enderecoComplemento", "enderecoLogradouro", "enderecoNumero", "enderecoUf", "id", "inscricaoEstadual", "nomeFantasia", "razaoSocial", "responsavelCpf", "responsavelNome", "telefone", "tipoPessoa") SELECT "atualizadoEm", "cpfCnpj", "criadoEm", "email", "enderecoBairro", "enderecoCep", "enderecoCidade", "enderecoComplemento", "enderecoLogradouro", "enderecoNumero", "enderecoUf", "id", "inscricaoEstadual", "nomeFantasia", "razaoSocial", "responsavelCpf", "responsavelNome", "telefone", "tipoPessoa" FROM "clientes";
DROP TABLE "clientes";
ALTER TABLE "new_clientes" RENAME TO "clientes";
CREATE UNIQUE INDEX "clientes_cpfCnpj_key" ON "clientes"("cpfCnpj");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "regimes_tributarios_nome_key" ON "regimes_tributarios"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "regimes_tributarios_slug_key" ON "regimes_tributarios"("slug");
