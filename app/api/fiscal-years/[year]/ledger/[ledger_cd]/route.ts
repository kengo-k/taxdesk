import { NextRequest } from 'next/server'

import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/api-transaction'
import { countLedgers } from '@/lib/services/ledger/count-ledgers'
import { listLedgers } from '@/lib/services/ledger/list-ledgers'

// 取引データの型定義
interface Transaction {
  id: string
  date: string
  accountCode: string
  accountName: string
  counterpartyAccount: string
  description: string
  debit: number
  credit: number
  summary: string
  balance: number
}

// 勘定科目別レコード件数の型定義（counts/by-account APIと同じ）
interface AccountCount {
  accountCode: string
  accountName: string
  count: number
}

export function countByAccountHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscal_year, ledger_cd } = await ctx.params
    const searchParams = req.nextUrl.searchParams
    const month = searchParams.get('month')
    const pageno = searchParams.get('pageno')
    const pagesize = searchParams.get('pagesize')

    const ledgers = await listLedgers(
      tx,
      {
        fiscal_year,
        ledger_cd,
        month: month || null,
      },
      {
        pageNo: pageno ? Number.parseInt(pageno, 10) : 1,
        pageSize: pagesize ? Number.parseInt(pagesize, 10) : 10,
      },
    )
    const all_count = await countLedgers(tx, {
      fiscal_year,
      ledger_cd,
      month: month || null,
    })
    return { all_count, ledgers }
  })
}

export const GET = createApiRoute(countByAccountHandler)
