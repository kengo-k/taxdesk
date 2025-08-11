import { Connection } from '@/lib/backend/api-transaction'

export interface PaymentStatus {
  month: number
  isPaid: boolean
  createdAt: string
}

export async function getPaymentStatuses(
  conn: Connection,
  fiscalYear: string,
): Promise<PaymentStatus[]> {
  const paymentStatuses = await conn.payroll_payments.findMany({
    where: {
      fiscal_year: fiscalYear,
    },
    select: {
      month: true,
      is_paid: true,
      created_at: true,
    },
    orderBy: {
      month: 'asc',
    },
  })

  return paymentStatuses.map((status) => ({
    month: status.month,
    isPaid: status.is_paid,
    createdAt: status.created_at.toISOString(),
  }))
}
