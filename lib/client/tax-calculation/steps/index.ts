import { steps2023 } from '@/lib/client/tax-calculation/steps/steps2023'
import { steps2024 } from '@/lib/client/tax-calculation/steps/steps2024'
import { CalculationStep } from '@/lib/client/tax-calculation/types'

/**
 * 年度別の計算ステップマッピングを構築する
 * @returns 年度別の計算ステップマッピング
 */
export function buildStepMappings(): Record<string, CalculationStep<any>[]> {
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
export function getSteps(fiscalYear: string): CalculationStep<any>[] {
  const mappings = buildStepMappings()
  const steps = mappings[fiscalYear]

  if (!steps) {
    throw new Error(
      `Tax calculation steps for fiscal year ${fiscalYear} not found`,
    )
  }

  return steps
}

export interface BaseContext {
  // 法人税を取得する
  getResult(): { taxName: string; taxAmount: number }[]
}
