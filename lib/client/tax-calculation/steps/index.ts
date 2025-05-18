import { CalculationStep } from '../types'

import { steps2023 } from './steps2023'
import { steps2024 } from './steps2024'

/**
 * 年度別の計算ステップマッピングを構築する
 * @returns 年度別の計算ステップマッピング
 */
export function buildStepMappings(): Record<string, CalculationStep[]> {
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
export function getSteps(fiscalYear: string): CalculationStep[] {
  const mappings = buildStepMappings()
  const steps = mappings[fiscalYear]

  if (!steps) {
    throw new Error(
      `Tax calculation steps for fiscal year ${fiscalYear} not found`,
    )
  }

  return steps
}
