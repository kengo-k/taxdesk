import {
  KAMOKU_BUNRUI,
  KAMOKU_BUNRUI_TYPE,
} from '@/lib/constants/kamoku-bunrui'
import { Connection } from '@/lib/types'

import {
  BreakdownByMonthRequest,
  calcBreakdownByMonth,
} from './calc-breakdown-by-month'

export type IncomeBreakdownByMonthRequest = Omit<
  BreakdownByMonthRequest,
  'kamokuBunruiCd' | 'kamokuBunruiType'
>
export type IncomeBreakdownByMonthResponse = Awaited<
  ReturnType<typeof calcBreakdownByMonth>
>[number]

export async function calcIncomeBreakdownByMonth(
  conn: Connection,
  input: IncomeBreakdownByMonthRequest,
): Promise<IncomeBreakdownByMonthResponse[]> {
  return calcBreakdownByMonth(conn, {
    ...input,
    kamokuBunruiCd: KAMOKU_BUNRUI.REVENUE,
    kamokuBunruiType: KAMOKU_BUNRUI_TYPE.RIGHT,
  })
}
