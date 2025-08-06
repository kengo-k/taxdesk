-- AlterTable
ALTER TABLE "nendo_masters" ADD COLUMN     "consumption_tax_type" VARCHAR(15) NOT NULL DEFAULT 'EXEMPT',
ADD COLUMN     "statutory_tax_rate" DECIMAL(5,2);
