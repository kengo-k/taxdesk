import { TaxParameters } from '@/lib/client/tax-calculation/parameters'
import { RootState } from '@/lib/redux/store'

/**
 * 2023年度の税額計算パラメータを構築する
 */
export const parameters2023Builder = (state: RootState): TaxParameters => {
  return {
    sales: 7362000,
    interest_revenue: 12,
    expenses: 7202571,
    previous_business_tax: 4500,
    national_withheld_tax: 1,
    local_withheld_tax: 0,
    corporate_tax_deduction: 1,
    is_consumption_tax_exempt: true,
  }
}
