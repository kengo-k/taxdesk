import { Connection } from '@/lib/types'

import {
  BreakdownByMonthRequest,
  calcBreakdownByMonth,
} from './calc-breakdown-by-month'

export type { BreakdownByMonthRequest }

export interface BreakdownByYearResponse {
  saimoku_cd: string
  value: number
  saimoku_full_name: string
  saimoku_ryaku_name: string
}

export async function calcBreakdownByYear(
  conn: Connection,
  input: BreakdownByMonthRequest,
): Promise<BreakdownByYearResponse[]> {
  // 月別の集計を取得
  const monthlyBreakdown = await calcBreakdownByMonth(conn, input)

  // 年別に集計
  const yearlyBreakdown = new Map<string, BreakdownByYearResponse>()

  monthlyBreakdown.forEach((item) => {
    if (!yearlyBreakdown.has(item.saimoku_cd)) {
      yearlyBreakdown.set(item.saimoku_cd, {
        saimoku_cd: item.saimoku_cd,
        value: 0,
        saimoku_full_name: item.saimoku_full_name,
        saimoku_ryaku_name: item.saimoku_ryaku_name,
      })
    }

    const breakdown = yearlyBreakdown.get(item.saimoku_cd)!
    breakdown.value += item.value
  })

  // 配列に変換してソート
  return Array.from(yearlyBreakdown.values()).sort((a, b) =>
    a.saimoku_cd.localeCompare(b.saimoku_cd),
  )
}
