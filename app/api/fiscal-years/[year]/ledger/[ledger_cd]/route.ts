import { NextRequest } from 'next/server'

import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/api-transaction'
import { countLedgers } from '@/lib/services/ledger/count-ledgers'
import { createLedger } from '@/lib/services/ledger/create-ledger'
import { listLedgers } from '@/lib/services/ledger/list-ledgers'
import { updateLedger } from '@/lib/services/ledger/update-ledger'

export function listLedgersHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscal_year, ledger_cd } = await ctx.params
    const searchParams = req.nextUrl.searchParams
    const month = searchParams.get('month')
    const checked = searchParams.get('checked')
    const note = searchParams.get('note')
    const pageno = searchParams.get('pageno')
    const pagesize = searchParams.get('pagesize')

    const ledgers = await listLedgers(
      tx,
      {
        fiscal_year,
        ledger_cd,
        month: month || null,
        checked: checked || null,
        note: note || null,
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
      checked: checked || null,
      note: note || null,
    })
    return { all_count, ledgers }
  })
}

export function createLedgerHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: nendo, ledger_cd } = await ctx.params
    const requestData = await req.json()

    // リクエストデータとURLパラメータを結合
    const createLedgerData = {
      nendo, // URLパスから取得した年度
      ledger_cd, // URLパスから取得した元帳科目コード
      date: requestData.date,
      counter_cd: requestData.other_cd || requestData.counter_cd, // other_cdまたはcounter_cdをcounter_cdとして使用
      karikata_value:
        requestData.karikata_value > 0 ? requestData.karikata_value : undefined,
      kasikata_value:
        requestData.kasikata_value > 0 ? requestData.kasikata_value : undefined,
      note: requestData.note || null,
      checked: '0',
    }

    await createLedger(tx, createLedgerData)

    return { success: true, message: '取引が正常に登録されました' }
  })
}

export function updateLedgerHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: nendo, ledger_cd } = await ctx.params
    const requestData = await req.json()

    // リクエストデータとURLパラメータを結合
    const createLedgerData = {
      id: requestData.id,
      nendo, // URLパスから取得した年度
      ledger_cd, // URLパスから取得した元帳科目コード
      date: requestData.date,
      counter_cd: requestData.other_cd || requestData.counter_cd, // other_cdまたはcounter_cdをcounter_cdとして使用
      karikata_value:
        requestData.karikata_value > 0 ? requestData.karikata_value : undefined,
      kasikata_value:
        requestData.kasikata_value > 0 ? requestData.kasikata_value : undefined,
      note: requestData.note || null,
      checked: '0',
    }

    await updateLedger(tx, createLedgerData)

    return { success: true, message: '取引が正常に登録されました' }
  })
}

export const GET = createApiRoute(listLedgersHandler)
export const POST = createApiRoute(createLedgerHandler)
export const PUT = createApiRoute(updateLedgerHandler)
