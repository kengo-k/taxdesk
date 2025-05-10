import { KAMOKU_BUNRUI } from '@/lib/constants/kamoku-bunrui'
import { Connection } from '@/lib/types'

import {
  BreakdownByMonthRequest,
  calcBreakdownByYear,
} from './calc-breakdown-by-year'

export type AssetBreakdownByYearRequest = Omit<
  BreakdownByMonthRequest,
  'kamokuBunruiCd'
>
export type AssetBreakdownByYearResponse = Awaited<
  ReturnType<typeof calcBreakdownByYear>
>[number]

export async function calcAssetBreakdownByYear(
  conn: Connection,
  input: AssetBreakdownByYearRequest,
): Promise<AssetBreakdownByYearResponse[]> {
  return calcBreakdownByYear(conn, {
    ...input,
    kamokuBunruiCd: KAMOKU_BUNRUI.ASSET,
  })
}
