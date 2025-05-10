import { KAMOKU_BUNRUI } from '@/lib/constants/kamoku-bunrui'
import { Connection } from '@/lib/types'

import {
  BreakdownByMonthRequest,
  calcBreakdownByYear,
} from './calc-breakdown-by-year'

export type IncomeBreakdownByYearRequest = Omit<
  BreakdownByMonthRequest,
  'kamokuBunruiCd'
>
export type IncomeBreakdownByYearResponse = Awaited<
  ReturnType<typeof calcBreakdownByYear>
>[number]

export async function calcIncomeBreakdownByYear(
  conn: Connection,
  input: IncomeBreakdownByYearRequest,
): Promise<IncomeBreakdownByYearResponse[]> {
  return calcBreakdownByYear(conn, {
    ...input,
    kamokuBunruiCd: KAMOKU_BUNRUI.REVENUE,
  })
}
