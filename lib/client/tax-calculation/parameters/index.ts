import { parameters2023Builder } from '@/lib/client/tax-calculation/parameters/parameters2023'
import { parameters2024Builder } from '@/lib/client/tax-calculation/parameters/parameters2024'
import { RootState } from '@/lib/redux/store'

/**
 * 年度別のパラメータビルダー関数の型定義
 */
export type ParameterBuilder = (state: RootState) => any

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
export function buildTaxParameters(state: RootState, fiscalYear: string): any {
  const mappings = buildParameterMappings()
  const builder = mappings[fiscalYear]

  if (!builder) {
    throw new Error(
      `Tax parameter builder for fiscal year ${fiscalYear} not found`,
    )
  }

  return builder(state)
}
