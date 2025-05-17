import { NextRequest } from 'next/server'

import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/api-transaction'
import {
  BreakdownRequest,
  calculateBreakdown,
} from '@/lib/services/reports/calculate-breakdown'

export async function calculateBreakdownHandler(
  conn: Connection,
  { ctx, req }: { ctx: RouteContext; req: NextRequest },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscalYear } = await ctx.params

    // POSTリクエストのボディからパラメータを取得
    const body = await req.json()
    const requests = body.requests as BreakdownRequest[]

    // リクエストごとに会計年度を設定
    const requestsWithFiscalYear = requests.map((request) => ({
      ...request,
      fiscalYear,
    }))

    // calculateBreakdown関数を呼び出してデータを計算
    return await calculateBreakdown(tx, requestsWithFiscalYear)
  })
}

export const POST = createApiRoute(calculateBreakdownHandler)
