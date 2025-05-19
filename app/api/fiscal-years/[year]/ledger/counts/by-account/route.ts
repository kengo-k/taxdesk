import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/backend/api-transaction'
import { countByAccount } from '@/lib/backend/services/ledger/count-by-account'

export function countByAccountHandler(
  conn: Connection,
  { ctx }: { ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscalYear } = await ctx.params
    return await countByAccount(tx, { fiscalYear })
  })
}

export const GET = createApiRoute(countByAccountHandler)
