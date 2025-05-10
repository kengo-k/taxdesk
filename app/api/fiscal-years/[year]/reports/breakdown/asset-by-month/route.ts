import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/api-transaction'
import { calcAssetBreakdownByMonth } from '@/lib/services/reports/calc-asset-breakdown-by-month'

export function calcAssetBreakdownByMonthHandler(
  conn: Connection,
  { ctx }: { ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscalYear } = await ctx.params
    return await calcAssetBreakdownByMonth(tx, { fiscalYear })
  })
}

export const GET = createApiRoute(calcAssetBreakdownByMonthHandler)
