-- CreateTable
CREATE TABLE "modelos_contrato" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "modelos_contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clausulas_modelo" (
    "id" TEXT NOT NULL,
    "modeloContratoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "clausulas_modelo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modelos_contrato_slug_key" ON "modelos_contrato"("slug");

-- AddForeignKey
ALTER TABLE "clausulas_modelo" ADD CONSTRAINT "clausulas_modelo_modeloContratoId_fkey" FOREIGN KEY ("modeloContratoId") REFERENCES "modelos_contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;
