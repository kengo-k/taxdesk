-- DropIndex
DROP INDEX "journals_checked_index";

-- DropIndex
DROP INDEX "journals_code_index";

-- DropIndex
DROP INDEX "journals_default_index";

-- CreateIndex
CREATE INDEX "journals_base_index" ON "journals"("nendo", "deleted", "date", "created_at");

-- CreateIndex
CREATE INDEX "journals_karikata_index" ON "journals"("nendo", "deleted", "karikata_cd", "date", "created_at");

-- CreateIndex
CREATE INDEX "journals_kasikata_index" ON "journals"("nendo", "deleted", "kasikata_cd", "date", "created_at");

-- CreateIndex
CREATE INDEX "journals_checked_index" ON "journals"("nendo", "deleted", "checked", "date", "created_at");

-- CreateIndex
CREATE INDEX "journals_codes_index" ON "journals"("nendo", "deleted", "karikata_cd", "kasikata_cd", "date", "created_at");

-- CreateIndex
CREATE INDEX "journals_karikata_sum_index" ON "journals"("nendo", "deleted", "karikata_cd", "karikata_value", "date");

-- CreateIndex
CREATE INDEX "journals_kasikata_sum_index" ON "journals"("nendo", "deleted", "kasikata_cd", "kasikata_value", "date");
