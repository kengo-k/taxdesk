import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/api-transaction'
import { calcIncomeBreakdownByMonth } from '@/lib/services/reports/calc-income-breakdown-by-month'

export function calcIncomeBreakdownByMonthHandler(
  conn: Connection,
  { ctx }: { ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscalYear } = await ctx.params
    return await calcIncomeBreakdownByMonth(tx, { fiscalYear })
  })
}

export const GET = createApiRoute(calcIncomeBreakdownByMonthHandler)
