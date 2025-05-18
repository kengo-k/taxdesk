/**
 * 税額計算に関連する型定義
 */

/**
 * 計算ステップの定義
 */
export interface CalculationStep {
  id: string // 一意の識別子（結果をcontextに保存する際のキー名）
  name: string // 表示名（「事業税」など）
  formulaText: (context: Record<string, any>) => string // 数式の表示テキストを生成する関数
  formula: (context: Record<string, any>) => number // 実際の計算処理
  category?: string // カテゴリ（「法人税」「住民税」など）
}

/**
 * 入力データの型定義
 */
export interface TaxInputData {
  sales: number
  expenses: number
  previousBusinessTax: number
}

/**
 * 税額計算結果の型定義
 */
export interface TaxCalculationResult {
  // 各ステップのID => 計算結果
  [stepId: string]: number
}
