-- CreateTable
CREATE TABLE "payroll_payments" (
    "id" SERIAL NOT NULL,
    "fiscal_year" VARCHAR(4) NOT NULL,
    "month" INTEGER NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payroll_payments_fiscal_year_month_key" ON "payroll_payments"("fiscal_year", "month");

-- AddForeignKey
ALTER TABLE "payroll_payments" ADD CONSTRAINT "payroll_payments_fiscal_year_fkey" FOREIGN KEY ("fiscal_year") REFERENCES "nendo_masters"("nendo") ON DELETE RESTRICT ON UPDATE CASCADE;
