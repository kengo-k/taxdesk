/*
  Warnings:

  - You are about to alter the column `checked` on the `journals` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(1)`.

*/
-- AlterTable
ALTER TABLE "journals" ADD COLUMN     "deleted" VARCHAR(1) NOT NULL DEFAULT '0',
ALTER COLUMN "checked" SET DEFAULT '0',
ALTER COLUMN "checked" SET DATA TYPE VARCHAR(1);
