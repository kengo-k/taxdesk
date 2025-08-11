import { NextRequest, NextResponse } from 'next/server'

import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/backend/api-transaction'
import { markPayrollAsPaid } from '@/lib/backend/services/payroll/mark-as-paid'

export function markPayrollAsPaidHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const params = await ctx.params
    const year = params.year
    const body = await req.json()
    const { month } = body

    if (!month || isNaN(parseInt(month))) {
      return NextResponse.json(
        { success: false, message: 'Valid month parameter is required' },
        { status: 400 },
      )
    }

    const monthInt = parseInt(month)
    if (monthInt < 1 || monthInt > 12) {
      return NextResponse.json(
        { success: false, message: 'Month must be between 1 and 12' },
        { status: 400 },
      )
    }

    const result = await markPayrollAsPaid(tx, {
      fiscalYear: year,
      month: monthInt,
    })

    return result
  })
}

export const POST = createApiRoute(markPayrollAsPaidHandler)
