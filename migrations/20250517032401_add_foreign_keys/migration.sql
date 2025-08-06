/*
  Warnings:

  - A unique constraint covering the columns `[kamoku_bunrui_cd]` on the table `kamoku_bunrui_masters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[kamoku_cd]` on the table `kamoku_masters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nendo]` on the table `nendo_masters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[saimoku_cd]` on the table `saimoku_masters` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "kamoku_bunrui_masters_kamoku_bunrui_cd_key" ON "kamoku_bunrui_masters"("kamoku_bunrui_cd");

-- CreateIndex
CREATE UNIQUE INDEX "kamoku_masters_kamoku_cd_key" ON "kamoku_masters"("kamoku_cd");

-- CreateIndex
CREATE UNIQUE INDEX "nendo_masters_nendo_key" ON "nendo_masters"("nendo");

-- CreateIndex
CREATE UNIQUE INDEX "saimoku_masters_saimoku_cd_key" ON "saimoku_masters"("saimoku_cd");

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_nendo_fkey" FOREIGN KEY ("nendo") REFERENCES "nendo_masters"("nendo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_karikata_cd_fkey" FOREIGN KEY ("karikata_cd") REFERENCES "saimoku_masters"("saimoku_cd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_kasikata_cd_fkey" FOREIGN KEY ("kasikata_cd") REFERENCES "saimoku_masters"("saimoku_cd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kamoku_masters" ADD CONSTRAINT "kamoku_masters_kamoku_bunrui_cd_fkey" FOREIGN KEY ("kamoku_bunrui_cd") REFERENCES "kamoku_bunrui_masters"("kamoku_bunrui_cd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saimoku_masters" ADD CONSTRAINT "saimoku_masters_kamoku_cd_fkey" FOREIGN KEY ("kamoku_cd") REFERENCES "kamoku_masters"("kamoku_cd") ON DELETE RESTRICT ON UPDATE CASCADE;
