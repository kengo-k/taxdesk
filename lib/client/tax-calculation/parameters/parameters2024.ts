import { Context2024 } from '../steps/steps2024'

import { RootState } from '@/lib/redux/store'

/**
 * 2024年度の税額計算パラメータを構築する
 */
export const parameters2024Builder = (state: RootState): Context2024 => {
  return {
    sales: 0,
    expenses: 0,
    previous_business_tax: 0,
    corporate_tax_after_deduction: 0,
    taxable_income: 0,

    // 法人税関連
    rounded_taxable_income: 0,
    corporate_tax_rate: 0,
    corporate_tax_base: 0,
    corporate_tax_deduction: 0,
    corporate_tax_final: 0,

    // 地方法人税関連
    local_corporate_tax_base: 0,
    local_corporate_tax_calc: 0,
    local_corporate_tax_final: 0,

    // 都民税関連
    tokyo_tax_base: 0,
    tokyo_tax_calc: 0,
    tokyo_tax_final: 0,
    tokyo_tax_equal_tax: 0,

    // 事業税関連
    business_tax_base: 0,
    business_tax: 0,
    business_tax_final: 0,

    // 特別法人事業税関連
    special_local_corporate_tax_calc: 0,
    special_local_corporate_tax_final: 0,

    // 消費税関連
    consumption_tax_status: 0,

    getResult: function () {
      return [
        {
          taxName: '法人税(+地方法人税)',
          taxAmount: this.corporate_tax_final + this.local_corporate_tax_final,
        },
        {
          taxName: '都民税(法人税割+均等割)',
          taxAmount: this.tokyo_tax_final + this.tokyo_tax_equal_tax,
        },
        {
          taxName: '事業税(+特別法人事業税)',
          taxAmount:
            this.business_tax_final + this.special_local_corporate_tax_final,
        },
        {
          taxName: '消費税',
          taxAmount: this.consumption_tax_status,
        },
        {
          taxName: '合計',
          taxAmount:
            this.corporate_tax_final +
            this.local_corporate_tax_final +
            this.tokyo_tax_final +
            this.tokyo_tax_equal_tax +
            this.business_tax_final +
            this.special_local_corporate_tax_final +
            this.consumption_tax_status,
        },
      ]
    },
  }
}
