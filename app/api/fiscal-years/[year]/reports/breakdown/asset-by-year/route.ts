import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/api-transaction'
import { calcAssetBreakdownByYear } from '@/lib/services/reports/calc-asset-breakdown-by-year'

export function calcAssetBreakdownByYearHandler(
  conn: Connection,
  { ctx }: { ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscalYear } = await ctx.params
    return await calcAssetBreakdownByYear(tx, { fiscalYear })
  })
}

export const GET = createApiRoute(calcAssetBreakdownByYearHandler)
