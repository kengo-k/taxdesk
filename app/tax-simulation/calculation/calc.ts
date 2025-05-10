// 計算ステップの定義
export interface CalculationStep {
  id: string // 一意の識別子（結果をcontextに保存する際のキー名）
  name: string // 表示名（「事業税」など）
  formulaText: string // 数式の表示テキスト（${paramName}で変数を埋め込み可能）
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
  inputData: TaxInputData,
  context: Record<string, any> = {},
): { results: Record<string, number>; context: Record<string, any> } {
  // 入力データをコンテキストに設定
  context.sales = inputData.sales
  context.expenses = inputData.expenses
  context.previousBusinessTax = inputData.previousBusinessTax || 0

  // 初期コンテキストの設定（課税所得など基本値の計算）
  if (!context.taxable_income) {
    context.taxable_income =
      inputData.sales -
      inputData.expenses -
      (inputData.previousBusinessTax || 0)
  }

  const results: Record<string, number> = {}

  // 各ステップを順に処理
  for (const step of steps) {
    try {
      // 計算実行
      const value = step.formula(context)

      // 結果を格納
      results[step.id] = value

      // コンテキストに結果を追加（次のステップで参照可能に）
      context[step.id] = value
    } catch (error) {
      console.error(`Error calculating step ${step.id}:`, error)
      results[step.id] = 0 // エラー時はデフォルト値を設定
    }
  }

  return { results, context }
}

// 数式テキスト内の変数を実際の値に置換して表示
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
