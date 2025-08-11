import { NextRequest } from 'next/server'

import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/backend/api-transaction'
import { getAllJournalCheckStatuses } from '@/lib/backend/services/payroll/get-all-journal-check-statuses'

export function getAllJournalCheckStatusesHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const params = await ctx.params
    const year = params.year

    const result = await getAllJournalCheckStatuses(tx, year)
    return result
  })
}

export const GET = createApiRoute(getAllJournalCheckStatusesHandler)
