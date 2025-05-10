import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/api-transaction'
import { calcExpenseBreakdownByYear } from '@/lib/services/reports/calc-expense-breakdown-by-year'

export function calcExpenseBreakdownByYearHandler(
  conn: Connection,
  { ctx }: { ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscalYear } = await ctx.params
    return await calcExpenseBreakdownByYear(tx, {
      fiscalYear,
    })
  })
}

export const GET = createApiRoute(calcExpenseBreakdownByYearHandler)
