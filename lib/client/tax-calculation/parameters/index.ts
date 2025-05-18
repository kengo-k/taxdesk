import { RootState } from '@/lib/redux/store'

import { parameters2023Builder } from './parameters2023'
import { parameters2024Builder } from './parameters2024'

/**
 * 税額計算パラメータの型定義
 * 年度によって必要なパラメータが異なる可能性があるため、
 * 柔軟な型定義としています。
 */
export type TaxParameters = Record<string, any>

/**
 * 年度別のパラメータビルダー関数の型定義
 */
export type ParameterBuilder = (state: RootState) => TaxParameters

/**
 * 年度別のパラメータビルダーマッピングを構築する
 * @returns 年度別のパラメータビルダーマッピング
 */
export function buildParameterMappings(): Record<string, ParameterBuilder> {
  return {
    '2023': parameters2023Builder,
    '2024': parameters2024Builder,
  }
}

/**
 * 指定された年度のパラメータを構築する
 * @param state Reduxストアの状態
 * @param fiscalYear 年度
 * @returns 税額計算パラメータ
 */
export function buildTaxParameters(
  state: RootState,
  fiscalYear: string,
): TaxParameters {
  const mappings = buildParameterMappings()
  const builder = mappings[fiscalYear]

  if (!builder) {
    throw new Error(
      `Tax parameter builder for fiscal year ${fiscalYear} not found`,
    )
  }

  return builder(state)
}
