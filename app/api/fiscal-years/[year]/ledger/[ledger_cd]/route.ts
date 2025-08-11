import { NextRequest } from 'next/server'

import { ApiError, ApiErrorType } from '@/lib/backend/api-error'
import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/backend/api-transaction'
import { countLedgers } from '@/lib/backend/services/ledger/count-ledgers'
import { createLedger } from '@/lib/backend/services/ledger/create-ledger'
import { listLedgers } from '@/lib/backend/services/ledger/list-ledgers'
import { updateLedger } from '@/lib/backend/services/ledger/update-ledger'
import { checkPaymentStatusByDate } from '@/lib/backend/services/payroll/check-payment-status-by-date'

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

    // 支払い済み期間かチェック
    const paymentStatus = await checkPaymentStatusByDate(
      tx,
      nendo,
      createLedgerData.date,
    )
    if (paymentStatus.isPaid) {
      throw new ApiError(
        `${paymentStatus.month}月は既に給与支払いが完了しているため、取引の追加はできません`,
        ApiErrorType.VALIDATION,
        [
          {
            code: 'PAYROLL_PERIOD_LOCKED',
            message: `${paymentStatus.month}月は既に給与支払いが完了しているため、取引の追加はできません`,
          },
        ],
      )
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
    const updateLedgerData = {
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

    // 支払い済み期間かチェック (新しい日付に対して)
    const paymentStatus = await checkPaymentStatusByDate(
      tx,
      nendo,
      updateLedgerData.date,
    )
    if (paymentStatus.isPaid) {
      throw new ApiError(
        `${paymentStatus.month}月は既に給与支払いが完了しているため、取引の更新はできません`,
        ApiErrorType.VALIDATION,
        [
          {
            code: 'PAYROLL_PERIOD_LOCKED',
            message: `${paymentStatus.month}月は既に給与支払いが完了しているため、取引の更新はできません`,
          },
        ],
      )
    }

    // 既存の取引の日付もチェック
    const existingLedger = await tx.journals.findFirst({
      where: {
        id: updateLedgerData.id,
        nendo: nendo,
      },
      select: {
        date: true,
      },
    })

    if (existingLedger) {
      const existingPaymentStatus = await checkPaymentStatusByDate(
        tx,
        nendo,
        existingLedger.date,
      )
      if (existingPaymentStatus.isPaid) {
        throw new ApiError(
          `${existingPaymentStatus.month}月は既に給与支払いが完了しているため、取引の更新はできません`,
          ApiErrorType.VALIDATION,
          [
            {
              code: 'PAYROLL_PERIOD_LOCKED',
              message: `${existingPaymentStatus.month}月は既に給与支払いが完了しているため、取引の更新はできません`,
            },
          ],
        )
      }
    }

    await updateLedger(tx, updateLedgerData)

    return { success: true, message: '取引が正常に更新されました' }
  })
}

export const GET = createApiRoute(listLedgersHandler)
export const POST = createApiRoute(createLedgerHandler)
export const PUT = createApiRoute(updateLedgerHandler)
