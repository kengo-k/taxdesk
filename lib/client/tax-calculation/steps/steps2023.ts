import { CalculationStep } from '../types'

/**
 * 2023年度の税額計算ステップを定義
 */
export const steps2023: CalculationStep[] = [
  {
    id: 'income',
    name: '課税所得',
    formulaText: (context) => {
      return '収入 - 費用 - 前年度事業税'
    },
    formula: (context) => {
      // 収入 - 費用 - 前年度事業税
      const income =
        context.sales +
        (context.interest_revenue || 0) -
        context.expenses -
        context.previous_business_tax

      // 負の値にならないようにする
      return Math.max(0, income)
    },
    category: '所得計算',
  },
  {
    id: 'business_tax',
    name: '事業税',
    formulaText: (context) => {
      return '課税所得 × 7%'
    },
    formula: (context) => {
      const income = context.income

      // 事業税率（例: 7%）
      const businessTaxRate = 0.07

      return income * businessTaxRate
    },
    category: '事業税',
  },
  {
    id: 'corporate_tax',
    name: '法人税',
    formulaText: (context) => {
      return '課税所得 × 15% - 源泉徴収税額（国税）'
    },
    formula: (context) => {
      const income = context.income

      // 法人税率（例: 15%）
      const corporateTaxRate = 0.15

      // 法人税額
      const corporateTax = income * corporateTaxRate

      // 源泉徴収税額（国税）を控除
      const deduction = context.national_withheld_tax || 0

      // 控除後の法人税額（負の値にならないようにする）
      return Math.max(0, corporateTax - deduction)
    },
    category: '法人税',
  },
  {
    id: 'local_corporate_tax',
    name: '地方法人税',
    formulaText: (context) => {
      return '法人税 × 10.3%'
    },
    formula: (context) => {
      const corporateTax = context.corporate_tax

      // 地方法人税率（例: 10.3%）
      const localCorporateTaxRate = 0.103

      return corporateTax * localCorporateTaxRate
    },
    category: '法人税',
  },
  {
    id: 'inhabitant_tax',
    name: '住民税',
    formulaText: (context) => {
      return '法人税 × 16.3% - 源泉徴収税額（地方税）'
    },
    formula: (context) => {
      const corporateTax = context.corporate_tax

      // 住民税率（例: 16.3%）
      const inhabitantTaxRate = 0.163

      // 住民税額
      const inhabitantTax = corporateTax * inhabitantTaxRate

      // 源泉徴収税額（地方税）を控除
      const deduction = context.local_withheld_tax || 0

      // 控除後の住民税額（負の値にならないようにする）
      return Math.max(0, inhabitantTax - deduction)
    },
    category: '住民税',
  },
  {
    id: 'total_tax',
    name: '税額合計',
    formulaText: (context) => {
      return '事業税 + 法人税 + 地方法人税 + 住民税'
    },
    formula: (context) => {
      // 事業税 + 法人税 + 地方法人税 + 住民税
      return (
        context.business_tax +
        context.corporate_tax +
        context.local_corporate_tax +
        context.inhabitant_tax
      )
    },
    category: '合計',
  },
]
