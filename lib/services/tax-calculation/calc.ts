import { TaxParameters } from './parameters'
import { TaxCalculationContext, TaxCalculationStep } from './steps'

/**
 * 税額計算結果の型定義
 */
export interface TaxCalculationResult {
  // 各ステップのID => 計算結果
  [stepId: string]: number
}

/**
 * 税額計算を実行する
 * @param steps 計算ステップの配列
 * @param parameters 計算パラメータ
 * @returns 計算結果
 */
export function calculateTax(
  steps: TaxCalculationStep[],
  parameters: TaxParameters,
): TaxCalculationResult {
  // 計算結果を格納するオブジェクト
  const results: TaxCalculationResult = {}

  // 計算コンテキスト
  const context: TaxCalculationContext = {
    parameters,
    results,
  }

  // 各ステップを順番に実行
  for (const step of steps) {
    // ステップの計算を実行
    const result = step.calculate(context)

    // 結果を格納
    results[step.id] = result
  }

  return results
}

/**
 * 元のCalculationStep型と互換性を持たせるためのアダプター関数
 * @param taxStep TaxCalculationStep型のステップ
 * @returns CalculationStep型のステップ
 */
export function adaptToCalculationStep(taxStep: TaxCalculationStep): any {
  return {
    id: taxStep.id,
    name: taxStep.name,
    formulaText: taxStep.formulaText,
    formula: (context: Record<string, any>) => {
      // TaxCalculationContextに変換
      const taxContext: TaxCalculationContext = {
        parameters: context,
        results: context,
      }
      return taxStep.calculate(taxContext)
    },
    category: taxStep.category,
  }
}

/**
 * 年度別の計算ステップをCalculationStep型に変換する
 * @param fiscalYear 年度
 * @param steps TaxCalculationStep型のステップ配列
 * @returns CalculationStep型のステップ配列
 */
export function adaptStepsForYear(
  fiscalYear: string,
  steps: TaxCalculationStep[],
): any[] {
  return steps.map(adaptToCalculationStep)
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
