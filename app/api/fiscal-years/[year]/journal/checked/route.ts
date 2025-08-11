import { NextRequest } from 'next/server'

import { ApiError, ApiErrorType } from '@/lib/backend/api-error'
import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/backend/api-transaction'
import { updateJournalChecked } from '@/lib/backend/services/journal/update-journal-checked'
import { checkPaymentStatusByDate } from '@/lib/backend/services/payroll/check-payment-status-by-date'

export function updateJournalCheckedHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscal_year } = await ctx.params
    const requestData = await req.json()

    // 既存の仕訳の日付を取得してバリデーション
    const existingJournal = await tx.journals.findFirst({
      where: {
        id: requestData.id,
        nendo: fiscal_year,
        deleted: '0',
      },
      select: {
        date: true,
      },
    })

    if (existingJournal) {
      const paymentStatus = await checkPaymentStatusByDate(
        tx,
        fiscal_year,
        existingJournal.date,
      )
      if (paymentStatus.isPaid) {
        throw new ApiError(
          `${paymentStatus.month}月は既に給与支払いが完了しているため、仕訳の確認状態を変更できません`,
          ApiErrorType.VALIDATION,
          [
            {
              code: 'PAYROLL_PERIOD_LOCKED',
              message: `${paymentStatus.month}月は既に給与支払いが完了しているため、仕訳の確認状態を変更できません`,
            },
          ],
        )
      }
    }

    await updateJournalChecked(tx, {
      id: requestData.id,
      fiscal_year,
      checked: requestData.checked,
    })

    return {
      success: true,
      message: '取引の確認状態が正常に更新されました',
    }
  })
}

export const PUT = createApiRoute(updateJournalCheckedHandler)
