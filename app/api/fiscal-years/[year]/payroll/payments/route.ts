import { NextRequest } from 'next/server'

import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/backend/api-transaction'
import { getPaymentStatuses } from '@/lib/backend/services/payroll/get-payment-statuses'

export function getPayrollPaymentStatusesHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const params = await ctx.params
    const year = params.year

    const result = await getPaymentStatuses(tx, year)
    return result
  })
}

export const GET = createApiRoute(getPayrollPaymentStatusesHandler)
