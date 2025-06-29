import { NextRequest } from 'next/server'

import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/backend/api-transaction'
import { countJournals } from '@/lib/backend/services/journal/count-journals'
import { createJournal } from '@/lib/backend/services/journal/create-journal'
import { deleteJournals } from '@/lib/backend/services/journal/delete-journals'
import { listJournals } from '@/lib/backend/services/journal/list-journals'

export function listJournalsHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscal_year } = await ctx.params
    const searchParams = req.nextUrl.searchParams
    const account = searchParams.get('account')
    const month = searchParams.get('month')
    const accountSide = searchParams.get('accountSide')
    const note = searchParams.get('note')
    const amount = searchParams.get('amount')
    const amountCondition = searchParams.get('amountCondition')
    const checked = searchParams.get('checked')
    const pageno = searchParams.get('pageno')
    const pagesize = searchParams.get('pagesize')

    const requestParams = {
      fiscal_year,
      account: account || null,
      month: month || null,
      accountSide: accountSide as any,
      note: note || null,
      amount: amount || null,
      amountCondition: amountCondition as any,
      checked: checked as any,
    }

    const journals = await listJournals(tx, requestParams, {
      pageNo: pageno ? Number.parseInt(pageno, 10) : 1,
      pageSize: pagesize ? Number.parseInt(pagesize, 10) : 10,
    })

    const all_count = await countJournals(tx, requestParams)

    return { all_count, journals }
  })
}

export function createJournalHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: nendo } = await ctx.params
    const requestData = await req.json()

    // リクエストデータとURLパラメータを結合
    const createJournalData = {
      nendo, // URLパスから取得した年度
      date: requestData.date,
      debitAccount: requestData.debitAccount || requestData.karikata_cd,
      debitAmount: requestData.debitAmount || requestData.karikata_value,
      creditAccount: requestData.creditAccount || requestData.kasikata_cd,
      creditAmount: requestData.creditAmount || requestData.kasikata_value,
      description: requestData.description || requestData.note || '',
    }

    await createJournal(tx, createJournalData)

    return { success: true, message: '仕訳が正常に登録されました' }
  })
}

export function deleteJournalsHandler(
  conn: Connection,
  { req, ctx }: { req: NextRequest; ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: nendo } = await ctx.params
    const requestData = await req.json()
    const deletedCount = await deleteJournals(tx, {
      fiscal_year: nendo,
      ids: requestData.ids,
    })

    return {
      success: true,
      message: `${deletedCount}件の取引が正常に削除されました`,
    }
  })
}

export const GET = createApiRoute(listJournalsHandler)
export const POST = createApiRoute(createJournalHandler)
export const DELETE = createApiRoute(deleteJournalsHandler)
