/*
  Warnings:

  - You are about to drop the column `split_ratio` on the `saimoku_masters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "saimoku_masters" DROP COLUMN "split_ratio",
ADD COLUMN     "custom_fields" JSONB;
