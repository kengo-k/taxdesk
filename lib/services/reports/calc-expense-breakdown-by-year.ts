import { Connection } from '@/lib/types'

import { calcExpenseBreakdownByMonth } from './calc-expense-breakdown-by-month'

export interface ExpenseBreakdownByYearRequest {
  fiscalYear: string
}

export interface ExpenseBreakdownByYearResponse {
  saimoku_cd: string
  value: number
  saimoku_full_name: string
  saimoku_ryaku_name: string
}

export async function calcExpenseBreakdownByYear(
  conn: Connection,
  input: ExpenseBreakdownByYearRequest,
): Promise<ExpenseBreakdownByYearResponse[]> {
  // 月別の集計を取得
  const monthlyData = await calcExpenseBreakdownByMonth(conn, {
    fiscalYear: input.fiscalYear,
  })

  // 年度内の集計を行う
  const yearlyTotals = new Map<string, ExpenseBreakdownByYearResponse>()

  monthlyData.forEach((item) => {
    if (!yearlyTotals.has(item.saimoku_cd)) {
      yearlyTotals.set(item.saimoku_cd, {
        saimoku_cd: item.saimoku_cd,
        value: 0,
        saimoku_full_name: item.saimoku_full_name,
        saimoku_ryaku_name: item.saimoku_ryaku_name,
      })
    }

    const total = yearlyTotals.get(item.saimoku_cd)!
    total.value += item.value
  })

  // 結果を配列に変換し、金額の大きい順にソート
  return Array.from(yearlyTotals.values()).sort((a, b) => b.value - a.value)
}
