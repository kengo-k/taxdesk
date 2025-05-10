import { steps2024 } from './steps2024'

// 計算ステップの定義
export interface CalculationStep {
  id: string // 一意の識別子（結果をcontextに保存する際のキー名）
  name: string // 表示名（「事業税」など）
  formulaText: (
    context: Record<string, any>,
    formatFunc: (val: number) => string,
  ) => string // 数式の表示テキストを生成する関数
  formula: (context: Record<string, any>) => number // 実際の計算処理
  formulaParams: string[] // 計算に必要なパラメータ（contextから取得）
  category?: string // カテゴリ（「法人税」「住民税」など）
}

// 入力データの型定義
export interface TaxInputData {
  sales: number
  expenses: number
  previousBusinessTax: number
}

// 計算処理を行う関数
export function calc(
  steps: CalculationStep[],
  initialContext: Record<string, any> = {},
): Record<string, any> {
  const context = { ...initialContext }
  context.taxable_income =
    context.sales - context.expenses - context.previousBusinessTax

  // 各ステップを順に処理
  for (const step of steps) {
    try {
      // 計算実行
      const value = step.formula(context)

      // 結果を格納
      context[step.id] = value

      // コンテキストに結果を追加（次のステップで参照可能に）
      context[step.id] = value
    } catch (error) {
      console.error(`Error calculating step ${step.id}:`, error)
      context[step.id] = 0 // エラー時はデフォルト値を設定
    }
  }

  return context
}

// 数式テキストを生成する関数（後方互換性のために残す）
export function formatFormulaText(
  formulaText: string,
  context: Record<string, any>,
  formatFunc: (val: number) => string,
): string {
  return formulaText.replace(/\${(\w+)}/g, (_, paramName) => {
    return formatFunc(context[paramName])
  })
}

// カテゴリごとにステップをグループ化
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

export const stepMappings: Record<string, CalculationStep[]> = {
  '2024': steps2024,
}
