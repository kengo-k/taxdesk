import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/api-transaction'
import { calcIncomeBreakdownByYear } from '@/lib/services/reports/calc-income-breakdown-by-year'

export function calcIncomeBreakdownByYearHandler(
  conn: Connection,
  { ctx }: { ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscalYear } = await ctx.params
    return await calcIncomeBreakdownByYear(tx, { fiscalYear })
  })
}

export const GET = createApiRoute(calcIncomeBreakdownByYearHandler)
