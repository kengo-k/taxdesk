import { z } from 'zod'

import { ApiError, ApiErrorType } from '@/lib/backend/api-error'
import { Connection } from '@/lib/backend/api-transaction'

const markAsPaidRequestSchema = z.object({
  fiscalYear: z.string().min(1),
  month: z.number().int().min(1).max(12),
})

export interface MarkAsPaidRequest {
  fiscalYear: string
  month: number
}

export interface MarkAsPaidResponse {
  fiscalYear: string
  month: number
  isPaid: boolean
  createdAt: string
}

export async function markPayrollAsPaid(
  conn: Connection,
  input: MarkAsPaidRequest,
): Promise<MarkAsPaidResponse> {
  const validationResult = markAsPaidRequestSchema.safeParse(input)
  if (!validationResult.success) {
    throw new ApiError(
      'バリデーションエラーが発生しました',
      ApiErrorType.VALIDATION,
    )
  }

  const { fiscalYear, month } = input

  // Check if already marked as paid
  const existingPayment = await conn.payroll_payments.findFirst({
    where: {
      fiscal_year: fiscalYear,
      month: month,
    },
  })

  if (existingPayment?.is_paid) {
    throw new ApiError('この月は既に支払い済みです', ApiErrorType.VALIDATION, [
      {
        code: 'ALREADY_PAID',
        message: 'この月は既に支払い済みです',
      },
    ])
  }

  // Validate that all journals for the month are checked
  const monthStr = month.toString().padStart(2, '0')
  const yearMonth = `${fiscalYear}${monthStr}`

  const uncheckedJournals = await conn.journals.count({
    where: {
      nendo: fiscalYear,
      date: {
        startsWith: yearMonth,
      },
      deleted: '0',
      checked: '0',
    },
  })

  if (uncheckedJournals > 0) {
    throw new ApiError(
      `未確認の仕訳データが${uncheckedJournals}件あります。先に確認を完了してください。`,
      ApiErrorType.VALIDATION,
      [
        {
          code: 'UNCHECKED_JOURNALS_EXIST',
          message: `未確認の仕訳データが${uncheckedJournals}件あります。先に確認を完了してください。`,
        },
      ],
    )
  }

  // Create or update payment status
  const paymentRecord = await conn.payroll_payments.upsert({
    where: {
      fiscal_year_month: {
        fiscal_year: fiscalYear,
        month: month,
      },
    },
    update: {
      is_paid: true,
      created_at: new Date(),
    },
    create: {
      fiscal_year: fiscalYear,
      month: month,
      is_paid: true,
      created_at: new Date(),
    },
  })

  return {
    fiscalYear,
    month,
    isPaid: paymentRecord.is_paid,
    createdAt: paymentRecord.created_at.toISOString(),
  }
}
