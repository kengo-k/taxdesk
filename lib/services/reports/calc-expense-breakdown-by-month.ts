import { KAMOKU_BUNRUI } from '@/lib/constants/kamoku-bunrui'
import { Connection } from '@/lib/types'

import {
  BreakdownByMonthRequest,
  calcBreakdownByMonth,
} from './calc-breakdown-by-month'

export type ExpenseBreakdownByMonthRequest = Omit<
  BreakdownByMonthRequest,
  'kamokuBunruiCd'
>
export type ExpenseBreakdownByMonthResponse = Awaited<
  ReturnType<typeof calcBreakdownByMonth>
>[number]

export async function calcExpenseBreakdownByMonth(
  conn: Connection,
  input: ExpenseBreakdownByMonthRequest,
): Promise<ExpenseBreakdownByMonthResponse[]> {
  return calcBreakdownByMonth(conn, {
    ...input,
    kamokuBunruiCd: KAMOKU_BUNRUI.EXPENSE,
  })
}
