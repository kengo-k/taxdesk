import { KAMOKU_BUNRUI } from '@/lib/constants/kamoku-bunrui'
import { Connection } from '@/lib/types'

import {
  BreakdownByMonthRequest,
  calcBreakdownByMonth,
} from './calc-breakdown-by-month'

export type AssetBreakdownByMonthRequest = Omit<
  BreakdownByMonthRequest,
  'kamokuBunruiCd'
>
export type AssetBreakdownByMonthResponse = Awaited<
  ReturnType<typeof calcBreakdownByMonth>
>[number]

export async function calcAssetBreakdownByMonth(
  conn: Connection,
  input: AssetBreakdownByMonthRequest,
): Promise<AssetBreakdownByMonthResponse[]> {
  return calcBreakdownByMonth(conn, {
    ...input,
    kamokuBunruiCd: KAMOKU_BUNRUI.ASSET,
  })
}
