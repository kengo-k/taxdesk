import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/api-transaction'
import { calcExpenseBreakdownByMonth } from '@/lib/services/reports/calc-expense-breakdown-by-month'

export function calcExpenseBreakdownByMonthHandler(
  conn: Connection,
  { ctx }: { ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscalYear } = await ctx.params
    return await calcExpenseBreakdownByMonth(tx, {
      fiscalYear,
    })
  })
}

export const GET = createApiRoute(calcExpenseBreakdownByMonthHandler)
