// 税額計算の算出ステップを定義するための型

export interface CalculationStep<T> {
  category: string
  subSteps: CalculationSubStep<T>[]
}

export interface CalculationSubStep<T> {
  id: keyof T
  name: string
  calculate: (context: T) => number
  statement: (context: T) => string
}

/**
 * 税額計算結果の型定義
 */
export interface TaxCalculationResult {
  // 各ステップのID => 計算結果
  [stepId: string]: number
}
