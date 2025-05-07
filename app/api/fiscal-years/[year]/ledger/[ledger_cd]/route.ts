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
  { ctx }: { ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscal_year, ledger_cd } = await ctx.params
    const ledgers = await listLedgers(
      tx,
      {
        fiscal_year,
        ledger_cd,
        month: null,
      },
      {
        page: 1,
        perPage: 10,
      },
    )
    const count = await countLedgers(tx, {
      fiscal_year,
      ledger_cd,
      month: null,
    })
    return { count, ledgers }
  })
}

export const GET = createApiRoute(countByAccountHandler)
