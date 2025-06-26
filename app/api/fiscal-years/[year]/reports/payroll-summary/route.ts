import { NextRequest } from 'next/server'

import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/backend/api-transaction'
import { getPayrollSummary } from '@/lib/backend/services/reports/payroll-summary'

export async function getPayrollSummaryHandler(
  conn: Connection,
  { ctx }: { ctx: RouteContext; req: NextRequest },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscalYear } = await ctx.params

    return await getPayrollSummary(tx, fiscalYear)
  })
}

export const GET = createApiRoute(getPayrollSummaryHandler)