import {
  KAMOKU_BUNRUI,
  KAMOKU_BUNRUI_TYPE,
} from '@/lib/constants/kamoku-bunrui'
import { Connection } from '@/lib/types'

import {
  BreakdownByMonthRequest,
  calcBreakdownByYear,
} from './calc-breakdown-by-year'

export type ExpenseBreakdownByYearRequest = Omit<
  BreakdownByMonthRequest,
  'kamokuBunruiCd' | 'kamokuBunruiType'
>
export type ExpenseBreakdownByYearResponse = Awaited<
  ReturnType<typeof calcBreakdownByYear>
>[number]

export async function calcExpenseBreakdownByYear(
  conn: Connection,
  input: ExpenseBreakdownByYearRequest,
): Promise<ExpenseBreakdownByYearResponse[]> {
  return calcBreakdownByYear(conn, {
    ...input,
    kamokuBunruiCd: KAMOKU_BUNRUI.EXPENSE,
    kamokuBunruiType: KAMOKU_BUNRUI_TYPE.LEFT,
  })
}
