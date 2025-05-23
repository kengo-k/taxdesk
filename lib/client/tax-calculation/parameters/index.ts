import { BreakdownRequest } from '@/lib/backend/services/reports/calculate-breakdown'
import {
  parameters2023Builder,
  parameters2023Selector,
} from '@/lib/client/tax-calculation/parameters/parameters2023'
import { selectTaxCalculationParameters } from '@/lib/redux/features/reportSlice'

import { parameters2024Builder, parameters2024Selector } from './parameters2024'

/**
 * 年度別のパラメータビルダー関数の型定義
 */
export type ParameterBuilder = (
  state: ReturnType<typeof selectTaxCalculationParameters>,
) => any
export type ParameterSelector = () => Omit<BreakdownRequest, 'fiscalYear'>[]

/**
 * 年度別のパラメータビルダーマッピングを構築する
 * @returns 年度別のパラメータビルダーマッピング
 */
export function buildParameterMappings(): Record<
  string,
  { selector: ParameterSelector; builder: ParameterBuilder }
> {
  return {
    '2023': {
      selector: parameters2023Selector,
      builder: parameters2023Builder,
    },
    '2024': {
      selector: parameters2024Selector,
      builder: parameters2024Builder,
    },
  }
}

/**
 * 指定された年度のパラメータを構築する
 * @param state Reduxストアの状態
 * @param fiscalYear 年度
 * @returns 税額計算パラメータ
 */
export function buildTaxParameters(
  state: ReturnType<typeof selectTaxCalculationParameters>,
  fiscalYear: string,
): any {
  const mappings = buildParameterMappings()
  const builder = mappings[fiscalYear]

  if (!builder) {
    throw new Error(
      `Tax parameter builder for fiscal year ${fiscalYear} not found`,
    )
  }

  return builder.builder(state)
}

export function selectTaxParameters(fiscalYear: string): any {
  const mappings = buildParameterMappings()
  const selector = mappings[fiscalYear]

  if (!selector) {
    throw new Error(
      `Tax parameter selector for fiscal year ${fiscalYear} not found`,
    )
  }

  return selector.selector()
}
