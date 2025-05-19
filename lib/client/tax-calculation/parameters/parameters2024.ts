import { RootState } from '@/lib/redux/store'

import { TaxParameters } from './index'

/**
 * 2024年度の税額計算パラメータを構築する
 */
export const parameters2024Builder = (state: RootState): TaxParameters => {
  return {
    sales: 100000000, // 売上高 1億円
    interest_revenue: 1000000, // 受取利息 100万円
    expenses: 80000000, // 費用 8000万円
    previous_business_tax: 500000, // 前年度事業税 50万円
    national_withheld_tax: 200000, // 源泉徴収税額（国税）20万円
    local_withheld_tax: 100000, // 源泉徴収税額（地方税）10万円
    corporate_tax_deduction: 0, // 法人税控除額 0円
    is_consumption_tax_exempt: false, // 消費税課税事業者
  }
}
