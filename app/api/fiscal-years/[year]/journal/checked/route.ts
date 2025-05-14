import { NextRequest } from 'next/server'

import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/api-transaction'
import { updateJournalChecked } from '@/lib/services/journal/update-journal-checked'

export function updateJournalCheckedHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscal_year } = await ctx.params
    const requestData = await req.json()

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
