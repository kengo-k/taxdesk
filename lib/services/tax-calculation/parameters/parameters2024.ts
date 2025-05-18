import { RootState } from '@/lib/redux/store'

/**
 * 2024年度の税額計算パラメータを構築する
 *
 * 注: このファイルはReportSliceの構造改良後に更新する必要があります
 */
export const parameters2024Builder = (state: RootState, fiscalYear: string) => {
  // 現時点では仮のデータを返す
  // 実際の実装はReportSliceの構造改良後に行う
  return {
    sales: 0,
    interest_revenue: 0,
    expenses: 0,
    previous_business_tax: 0,
    national_withheld_tax: 0,
    local_withheld_tax: 0,
    corporate_tax_deduction: 1, // 2023年度と異なる値
    is_consumption_tax_exempt: true,
  }
}
