/*
  Warnings:

  - You are about to drop the column `tipoPintura` on the `orcamentos` table. All the data in the column will be lost.
  - Added the required column `cep` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoMetragem` to the `orcamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoServico` to the `orcamentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "cep" TEXT NOT NULL,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "numero" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orcamentos" DROP COLUMN "tipoPintura",
ADD COLUMN     "ajudantes" JSONB,
ADD COLUMN     "diasPrincipal" INTEGER,
ADD COLUMN     "lucro" DOUBLE PRECISION,
ADD COLUMN     "tipoMetragem" TEXT NOT NULL,
ADD COLUMN     "tipoServico" TEXT NOT NULL,
ADD COLUMN     "valorDiariaPrincipal" DOUBLE PRECISION,
ADD COLUMN     "valorEmpreita" DOUBLE PRECISION;
