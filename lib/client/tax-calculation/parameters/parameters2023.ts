import { selectTaxCalculationData } from '@/lib/redux/features/reportSlice'
import { RootState } from '@/lib/redux/store'

import { TaxParameters } from './index'

/**
 * 2023年度の税額計算パラメータを構築する
 */
export const parameters2023Builder = (state: RootState): TaxParameters => {
  // ReportSliceから税額計算データを取得
  const taxCalculationData = selectTaxCalculationData(state)

  // データが存在する場合はそれを使用し、存在しない場合はデフォルト値を使用
  if (taxCalculationData) {
    return {
      sales: taxCalculationData.sales,
      interest_revenue: taxCalculationData.interest_revenue,
      expenses: taxCalculationData.expenses,
      previous_business_tax: taxCalculationData.previous_business_tax,
      national_withheld_tax: taxCalculationData.national_withheld_tax,
      local_withheld_tax: taxCalculationData.local_withheld_tax,
      corporate_tax_deduction: taxCalculationData.corporate_tax_deduction,
      is_consumption_tax_exempt: taxCalculationData.is_consumption_tax_exempt,
    }
  }

  // データが存在しない場合はデフォルト値を返す
  return {
    sales: 0,
    interest_revenue: 0,
    expenses: 0,
    previous_business_tax: 0,
    national_withheld_tax: 0,
    local_withheld_tax: 0,
    corporate_tax_deduction: 0,
    is_consumption_tax_exempt: true,
  }
}
