import { NextRequest } from 'next/server'

import { ApiError, ApiErrorType } from '@/lib/backend/api-error'
import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/backend/api-transaction'
import { updateJournal } from '@/lib/backend/services/journal/update-journal'
import { checkPaymentStatusByDate } from '@/lib/backend/services/payroll/check-payment-status-by-date'

export function updateJournalHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: nendo, id } = await ctx.params
    const requestData = await req.json()

    // リクエストデータとURLパラメータを結合
    const updateJournalData = {
      id, // URLパスから取得したID
      nendo, // URLパスから取得した年度
      date: requestData.date,
      debitAccount: requestData.debitAccount || requestData.karikata_cd,
      debitAmount: requestData.debitAmount || requestData.karikata_value,
      creditAccount: requestData.creditAccount || requestData.kasikata_cd,
      creditAmount: requestData.creditAmount || requestData.kasikata_value,
      description: requestData.description || requestData.note,
    }

    // 支払い済み期間かチェック (新しい日付に対して)
    const paymentStatus = await checkPaymentStatusByDate(
      tx,
      nendo,
      updateJournalData.date,
    )
    if (paymentStatus.isPaid) {
      throw new ApiError(
        `${paymentStatus.month}月は既に給与支払いが完了しているため、仕訳の更新はできません`,
        ApiErrorType.VALIDATION,
        [
          {
            code: 'PAYROLL_PERIOD_LOCKED',
            message: `${paymentStatus.month}月は既に給与支払いが完了しているため、仕訳の更新はできません`,
          },
        ],
      )
    }

    // 既存の仕訳の日付もチェック
    const existingJournal = await tx.journals.findFirst({
      where: {
        id: parseInt(id),
        nendo: nendo,
        deleted: '0',
      },
      select: {
        date: true,
      },
    })

    if (existingJournal) {
      const existingPaymentStatus = await checkPaymentStatusByDate(
        tx,
        nendo,
        existingJournal.date,
      )
      if (existingPaymentStatus.isPaid) {
        throw new ApiError(
          `${existingPaymentStatus.month}月は既に給与支払いが完了しているため、仕訳の更新はできません`,
          ApiErrorType.VALIDATION,
          [
            {
              code: 'PAYROLL_PERIOD_LOCKED',
              message: `${existingPaymentStatus.month}月は既に給与支払いが完了しているため、仕訳の更新はできません`,
            },
          ],
        )
      }
    }

    await updateJournal(tx, updateJournalData)

    return { success: true, message: '仕訳が正常に更新されました' }
  })
}

export const PUT = createApiRoute(updateJournalHandler)
