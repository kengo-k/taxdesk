import { RootState } from '@/lib/redux/store'

import { TaxParameters } from './index'

/**
 * 2024年度の税額計算パラメータを構築する
 */
export const parameters2024Builder = (state: RootState): TaxParameters => {
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
