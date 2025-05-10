import {
  KAMOKU_BUNRUI,
  KAMOKU_BUNRUI_TYPE,
} from '@/lib/constants/kamoku-bunrui'
import { Connection } from '@/lib/types'

import {
  BreakdownByMonthRequest,
  calcBreakdownByMonth,
} from './calc-breakdown-by-month'

export type ExpenseBreakdownByMonthRequest = Omit<
  BreakdownByMonthRequest,
  'kamokuBunruiCd' | 'kamokuBunruiType'
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
    kamokuBunruiType: KAMOKU_BUNRUI_TYPE.LEFT,
  })
}
