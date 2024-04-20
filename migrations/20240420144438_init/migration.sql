-- CreateTable
CREATE TABLE "journals" (
    "id" SERIAL NOT NULL,
    "nendo" VARCHAR(4) NOT NULL,
    "date" VARCHAR(8) NOT NULL,
    "karikata_cd" VARCHAR(5) NOT NULL,
    "karikata_value" INTEGER NOT NULL,
    "kasikata_cd" VARCHAR(5) NOT NULL,
    "kasikata_value" INTEGER NOT NULL,
    "note" TEXT,
    "checked" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kamoku_bunrui_masters" (
    "id" SERIAL NOT NULL,
    "kamoku_bunrui_cd" VARCHAR(1) NOT NULL,
    "kamoku_bunrui_name" VARCHAR(8) NOT NULL,
    "kamoku_bunrui_type" VARCHAR(1) NOT NULL,
    "kurikoshi_flg" VARCHAR(1) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "kamoku_bunrui_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kamoku_masters" (
    "id" SERIAL NOT NULL,
    "kamoku_cd" VARCHAR(2) NOT NULL,
    "kamoku_full_name" TEXT NOT NULL,
    "kamoku_ryaku_name" TEXT NOT NULL,
    "kamoku_kana_name" TEXT NOT NULL,
    "kamoku_bunrui_cd" VARCHAR(1) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "kamoku_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nendo_masters" (
    "id" SERIAL NOT NULL,
    "nendo" VARCHAR(4) NOT NULL,
    "start_date" VARCHAR(8) NOT NULL,
    "end_date" VARCHAR(8) NOT NULL,
    "fixed" VARCHAR(1) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "nendo_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saimoku_masters" (
    "id" SERIAL NOT NULL,
    "kamoku_cd" VARCHAR(2) NOT NULL,
    "saimoku_cd" VARCHAR(3) NOT NULL,
    "saimoku_full_name" TEXT NOT NULL,
    "saimoku_ryaku_name" TEXT NOT NULL,
    "saimoku_kana_name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "saimoku_masters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "journals_checked_index" ON "journals"("nendo", "checked", "date");

-- CreateIndex
CREATE INDEX "journals_code_index" ON "journals"("nendo", "karikata_cd", "kasikata_cd", "date");

-- CreateIndex
CREATE INDEX "journals_default_index" ON "journals"("nendo", "date");
