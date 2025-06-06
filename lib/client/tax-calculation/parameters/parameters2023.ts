import {
  ParameterBuilder,
  ParameterSelector,
} from '@/lib/client/tax-calculation/parameters'
import { Context2023 } from '@/lib/client/tax-calculation/steps/steps2023'
import { KAMOKU_BUNRUI } from '@/lib/constants/kamoku-bunrui'
import { selectTaxCalculationParameters } from '@/lib/redux/features/reportSlice'

export const parameters2023Selector: ParameterSelector = () => {
  return [
    // 売上全体
    {
      kamokuBunruiCd: KAMOKU_BUNRUI.REVENUE,
      breakdownLevel: 'kamoku_bunrui',
      breakdownType: 'net',
      timeUnit: 'annual',
    },
    // 資産: 法人税額から控除する金額
    // - 受け取り利息から源泉徴収された金額
    // - 国税と地方税の区別が必要なため細目単位で取得する
    {
      kamokuBunruiCd: KAMOKU_BUNRUI.ASSET,
      breakdownLevel: 'saimoku',
      breakdownType: 'net',
      timeUnit: 'annual',
    },
    // 費用全体
    {
      kamokuBunruiCd: KAMOKU_BUNRUI.EXPENSE,
      breakdownLevel: 'kamoku_bunrui',
      breakdownType: 'net',
      timeUnit: 'annual',
    },
    // 費用: 経費から差し引く金額
    // - 事業税は租税公課の扱いだが支払うのは翌年となるため除外する必要がある
    // - 経費全体から事業税だけを抽出するため細目単位で取得する
    {
      kamokuBunruiCd: KAMOKU_BUNRUI.EXPENSE,
      breakdownLevel: 'saimoku',
      breakdownType: 'net',
      timeUnit: 'annual',
    },
    // 負債: 前年度事業税
    // - 前年度事業税は期首に未払事業税として負債に計上されている
    {
      kamokuBunruiCd: KAMOKU_BUNRUI.LIABILITY,
      breakdownLevel: 'kamoku',
      breakdownType: 'kasikata',
      timeUnit: 'annual',
    },
  ]
}

/**
 * 2023年度の税額計算パラメータを構築する
 */
export const parameters2023Builder: ParameterBuilder = (
  state: ReturnType<typeof selectTaxCalculationParameters>,
): Context2023 => {
  return {
    sales: state[0][0].value,
    expenses: 7202571,
    previous_business_tax: 4500,
    corporate_tax_deduction: 1,
    taxable_income: 0,

    // 法人税関連
    rounded_taxable_income: 0,
    corporate_tax_rate: 0,
    corporate_tax_base: 0,
    corporate_tax_after_deduction: 0,
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
