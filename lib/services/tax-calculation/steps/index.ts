import { TaxParameters } from '../parameters'

import { steps2023 } from './steps2023'
import { steps2024 } from './steps2024'

/**
 * 税額計算ステップの型定義
 * 元のCalculationStep型と互換性を持たせる
 */
export interface TaxCalculationStep {
  id: string
  name: string
  description: string
  formulaText: (context: Record<string, any>) => string
  calculate: (context: TaxCalculationContext) => number
  category?: string
}

/**
 * 税額計算コンテキストの型定義
 */
export interface TaxCalculationContext {
  parameters: TaxParameters
  results: Record<string, number>
}

/**
 * 年度別の計算ステップマッピングを構築する
 * @returns 年度別の計算ステップマッピング
 */
export function buildStepMappings(): Record<string, TaxCalculationStep[]> {
  return {
    '2023': steps2023,
    '2024': steps2024,
  }
}

/**
 * 指定された年度の計算ステップを取得する
 * @param fiscalYear 年度
 * @returns 計算ステップの配列
 */
export function getSteps(fiscalYear: string): TaxCalculationStep[] {
  const mappings = buildStepMappings()
  const steps = mappings[fiscalYear]

  if (!steps) {
    throw new Error(
      `Tax calculation steps for fiscal year ${fiscalYear} not found`,
    )
  }

  return steps
}
