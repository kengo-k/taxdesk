import { NextRequest } from 'next/server'

import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/backend/api-transaction'
import { deleteJournals } from '@/lib/backend/services/journal/delete-journals'

export function deleteLedgersHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: nendo } = await ctx.params
    const requestData = await req.json()
    const deletedCount = await deleteJournals(tx, {
      fiscal_year: nendo,
      ids: requestData.ids,
    })

    return {
      success: true,
      message: `${deletedCount}件の取引が正常に削除されました`,
    }
  })
}

export const DELETE = createApiRoute(deleteLedgersHandler)
