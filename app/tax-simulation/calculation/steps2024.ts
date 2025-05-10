import { CalculationStep, formatCurrency as f } from './calc'

// 基本情報関連の計算ステップ
export const basicInfoSteps: CalculationStep[] = [
  {
    id: 'taxable_income',
    name: '課税所得',
    category: '基本情報',
    formulaText: (context) =>
      `収入 ${f(context.sales)} - 支出 ${f(context.expenses)} - 前年度の事業税額 ${f(context.previousBusinessTax)} = ${f(context.taxable_income)}`,
    formula: (context) =>
      context.sales - context.expenses - context.previousBusinessTax,
  },
]

// 法人税関連の計算ステップ
export const corporateTaxSteps: CalculationStep[] = [
  {
    id: 'rounded_taxable_income',
    name: '課税所得（1000円未満切捨）',
    category: '法人税',
    formulaText: (context) =>
      `課税所得 ${f(context.taxable_income)} の1000円未満を切捨て = ${f(context.rounded_taxable_income)}`,
    formula: (context) => Math.floor(context.taxable_income / 1000) * 1000,
  },
  {
    id: 'corporate_tax_rate',
    name: '法人税率',
    category: '法人税',
    formulaText: (context) => {
      const rate = context.rounded_taxable_income > 8000000 ? 0.232 : 0.15
      return `課税所得 ${f(context.rounded_taxable_income)} は ${
        context.rounded_taxable_income > 8000000 ? '800万円超' : '800万円以下'
      } のため、税率 ${(rate * 100).toFixed(1)}%`
    },
    formula: (context) =>
      context.rounded_taxable_income > 8000000 ? 0.232 : 0.15,
  },
  {
    id: 'corporate_tax_base',
    name: '法人税（基本税額）',
    category: '法人税',
    formulaText: (context) =>
      `課税所得 ${f(context.rounded_taxable_income)} × 税率 ${(context.corporate_tax_rate * 100).toFixed(1)}% = ${f(context.corporate_tax_base)}`,
    formula: (context) =>
      Math.round(context.rounded_taxable_income * context.corporate_tax_rate),
  },
  {
    id: 'corporate_tax_deduction',
    name: '法人税控除額',
    category: '法人税',
    formulaText: (context) =>
      `法人税額から控除額 ${f(context.corporate_tax_deduction)} を控除`,
    formula: (context) => context.corporate_tax_deduction || 0,
  },
  {
    id: 'corporate_tax_after_deduction',
    name: '法人税（控除後）',
    category: '法人税',
    formulaText: (context) =>
      `法人税額 ${f(context.corporate_tax_base)} - 控除額 ${f(context.corporate_tax_deduction)} = ${f(context.corporate_tax_after_deduction)}`,
    formula: (context) =>
      Math.max(0, context.corporate_tax_base - context.corporate_tax_deduction),
  },
  {
    id: 'corporate_tax_final',
    name: '法人税（100円未満切捨）',
    category: '法人税',
    formulaText: (context) =>
      `法人税額 ${f(context.corporate_tax_after_deduction)} の100円未満を切捨て = ${f(context.corporate_tax_final)}`,
    formula: (context) =>
      Math.floor(context.corporate_tax_after_deduction / 100) * 100,
  },
]

// 地方法人税関連の計算ステップ
export const localCorporateTaxSteps: CalculationStep[] = [
  {
    id: 'local_corporate_tax_base',
    name: '地方法人税（基本税額）',
    category: '地方法人税',
    formulaText: (context) =>
      `法人税額 ${f(context.corporate_tax_base)} の1000円未満を切捨て = ${f(context.local_corporate_tax_base)}`,
    formula: (context) => Math.floor(context.corporate_tax_base / 1000) * 1000,
  },
  {
    id: 'local_corporate_tax_calc',
    name: '地方法人税（計算）',
    category: '地方法人税',
    formulaText: (context) =>
      `基本税額 ${f(context.local_corporate_tax_base)} × 税率 10.3% = ${f(context.local_corporate_tax_calc)}`,
    formula: (context) => Math.round(context.local_corporate_tax_base * 0.103),
  },
  {
    id: 'local_corporate_tax_final',
    name: '地方法人税（100円未満切捨）',
    category: '地方法人税',
    formulaText: (context) =>
      `地方法人税額 ${f(context.local_corporate_tax_calc)} の100円未満を切捨て = ${f(context.local_corporate_tax_final)}`,
    formula: (context) =>
      Math.floor(context.local_corporate_tax_calc / 100) * 100,
  },
]

// 住民税関連の計算ステップ
export const inhabitantTaxSteps: CalculationStep[] = [
  {
    id: 'tokyo_tax_base',
    name: '都民税（基本税額）',
    category: '都民税',
    formulaText: (context) =>
      `法人税額 ${f(context.corporate_tax_base)} の1000円未満を切捨て = ${f(context.tokyo_tax_base)}`,
    formula: (context) => Math.floor(context.corporate_tax_base / 1000) * 1000,
  },
  {
    id: 'tokyo_tax_calc',
    name: '都民税（計算）',
    category: '都民税',
    formulaText: (context) =>
      `基本税額 ${f(context.tokyo_tax_base)} × 税率 7.0% = ${f(context.tokyo_tax_calc)}`,
    formula: (context) => Math.round(context.tokyo_tax_base * 0.07),
  },
  {
    id: 'tokyo_tax_final',
    name: '都民税（100円未満切捨）',
    category: '都民税',
    formulaText: (context) =>
      `都民税額 ${f(context.tokyo_tax_calc)} の100円未満を切捨て = ${f(context.tokyo_tax_final)}`,
    formula: (context) => Math.floor(context.tokyo_tax_calc / 100) * 100,
  },
  {
    id: 'tokyo_tax_total',
    name: '都民税（均等割加算）',
    category: '都民税',
    formulaText: (context) =>
      `都民税額 ${f(context.tokyo_tax_final)} + 均等割 70,000円 = ${f(context.tokyo_tax_total)}`,
    formula: (context) => context.tokyo_tax_final + 70000,
  },
]

// 事業税関連の計算ステップ
export const businessTaxSteps: CalculationStep[] = [
  {
    id: 'business_tax_base',
    name: '事業税（基本税額）',
    category: '事業税',
    formulaText: (context) =>
      `課税所得 ${f(context.taxable_income)} の1000円未満を切捨て = ${f(context.business_tax_base)}`,
    formula: (context) => Math.floor(context.taxable_income / 1000) * 1000,
  },
  {
    id: 'business_tax_calc',
    name: '事業税（計算）',
    category: '事業税',
    formulaText: (context) =>
      `基本税額 ${f(context.business_tax_base)} × 税率 3.5% = ${f(context.business_tax_calc)}`,
    formula: (context) => Math.round(context.business_tax_base * 0.035),
  },
  {
    id: 'business_tax_final',
    name: '事業税（100円未満切捨）',
    category: '事業税',
    formulaText: (context) =>
      `事業税額 ${f(context.business_tax_calc)} の100円未満を切捨て = ${f(context.business_tax_final)}`,
    formula: (context) => Math.floor(context.business_tax_calc / 100) * 100,
  },
]

// 特別法人事業税関連の計算ステップ
export const specialLocalCorporateTaxSteps: CalculationStep[] = [
  {
    id: 'special_local_corporate_tax_calc',
    name: '特別法人事業税（計算）',
    category: '特別法人事業税',
    formulaText: (context) =>
      `事業税額 ${f(context.business_tax_final)} × 税率 37.0% = ${f(context.special_local_corporate_tax_calc)}`,
    formula: (context) => Math.round(context.business_tax_final * 0.37),
  },
  {
    id: 'special_local_corporate_tax_final',
    name: '特別法人事業税（100円未満切捨）',
    category: '特別法人事業税',
    formulaText: (context) =>
      `特別法人事業税額 ${f(context.special_local_corporate_tax_calc)} の100円未満を切捨て = ${f(context.special_local_corporate_tax_final)}`,
    formula: (context) =>
      Math.floor(context.special_local_corporate_tax_calc / 100) * 100,
  },
]

// 消費税関連の計算ステップ
export const consumptionTaxSteps: CalculationStep[] = [
  {
    id: 'consumption_tax_status',
    name: '消費税課税区分',
    category: '消費税',
    formulaText: (context) =>
      context.is_consumption_tax_exempt
        ? '免税事業者（消費税額 0円）'
        : '課税事業者',
    formula: (context) => (context.is_consumption_tax_exempt ? 0 : 1),
  },
  {
    id: 'consumption_tax_base',
    name: '消費税（国税）',
    category: '消費税',
    formulaText: (context) =>
      context.is_consumption_tax_exempt
        ? '免税事業者のため消費税額 0円'
        : `課税売上 ${f(context.sales)} × 税率 7.8% = ${f(context.consumption_tax_base)}`,
    formula: (context) =>
      context.is_consumption_tax_exempt ? 0 : Math.round(context.sales * 0.078),
  },
  {
    id: 'local_consumption_tax',
    name: '地方消費税',
    category: '消費税',
    formulaText: (context) =>
      context.is_consumption_tax_exempt
        ? '免税事業者のため地方消費税額 0円'
        : `課税売上 ${f(context.sales)} × 税率 2.2% = ${f(context.local_consumption_tax)}`,
    formula: (context) =>
      context.is_consumption_tax_exempt ? 0 : Math.round(context.sales * 0.022),
  },
]

// すべての計算ステップを結合
export const steps2024: CalculationStep[] = [
  ...basicInfoSteps,
  ...corporateTaxSteps,
  ...localCorporateTaxSteps,
  ...inhabitantTaxSteps,
  ...businessTaxSteps,
  ...specialLocalCorporateTaxSteps,
  ...consumptionTaxSteps,
]
