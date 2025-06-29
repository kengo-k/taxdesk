import { NextRequest } from 'next/server'

import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/backend/api-transaction'
import { updateJournal } from '@/lib/backend/services/journal/update-journal'

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

    await updateJournal(tx, updateJournalData)

    return { success: true, message: '仕訳が正常に更新されました' }
  })
}

export const PUT = createApiRoute(updateJournalHandler)
