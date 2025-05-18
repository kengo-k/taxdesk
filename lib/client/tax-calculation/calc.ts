import { CalculationStep, TaxCalculationResult } from './types'

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
  // 計算結果を格納するオブジェクト
  const results: TaxCalculationResult = {}

  // 計算コンテキスト（パラメータと結果を含む）
  const context = { ...parameters, ...results }

  // 各ステップを順番に実行
  for (const step of steps) {
    try {
      // ステップの計算を実行
      const result = step.formula(context)

      // 結果を格納
      results[step.id] = result
      context[step.id] = result // コンテキストにも結果を追加（次のステップで参照できるように）
    } catch (error) {
      console.error(`Error calculating step ${step.id}:`, error)
      results[step.id] = 0 // エラー時はデフォルト値を設定
      context[step.id] = 0
    }
  }

  return results
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
