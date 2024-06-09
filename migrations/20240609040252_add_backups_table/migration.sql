-- CreateTable
CREATE TABLE "backups" (
    "id" SERIAL NOT NULL,
    "backup_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);
