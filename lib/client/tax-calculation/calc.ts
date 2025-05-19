import {
  CalculationStep,
  TaxCalculationResult,
} from '@/lib/client/tax-calculation/types'

/**
 * 税額計算を実行する
 * @param steps 計算ステップの配列
 * @param parameters 計算パラメータ
 * @returns 計算結果
 */
export function calculateTax(
  steps: CalculationStep[],
  parameters: Record<string, any>,
): TaxCalculationResult {
  const context = { ...parameters }

  // 各ステップを順番に実行
  for (const step of steps) {
    try {
      context[step.id] = step.formula(context)
    } catch (error) {
      console.error(`Error calculating step ${step.id}:`, error)
      context[step.id] = 0
    }
  }

  return context
}

/**
 * 税額計算結果から特定のステップの結果を取得する
 * @param results 計算結果
 * @param stepId ステップID
 * @returns ステップの計算結果
 */
export function getStepResult(
  results: TaxCalculationResult,
  stepId: string,
): number {
  return results[stepId] || 0
}

/**
 * 税額計算結果から合計税額を取得する
 * @param results 計算結果
 * @returns 合計税額
 */
export function getTotalTax(results: TaxCalculationResult): number {
  return results.total_tax || 0
}

/**
 * カテゴリごとにステップをグループ化
 * @param steps 計算ステップの配列
 * @returns カテゴリごとにグループ化されたステップ
 */
export function groupByCategory(
  steps: CalculationStep[],
): Record<string, CalculationStep[]> {
  return steps.reduce(
    (acc, step) => {
      const category = step.category || 'その他'
      if (!acc[category]) acc[category] = []
      acc[category].push(step)
      return acc
    },
    {} as Record<string, CalculationStep[]>,
  )
}

/**
 * 金額のフォーマット
 * @param amount 金額
 * @returns フォーマットされた金額文字列
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount)
}
