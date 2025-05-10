import { CalculationStep, formatCurrency as f } from './calc'

// 基本情報関連の計算ステップ
export const basicInfoSteps: CalculationStep[] = [
  {
    id: 'taxable_income',
    name: '課税所得',
    category: '基本情報',
    formulaText: (context) =>
      `収入 ${f(context.sales)} - 支出 ${f(context.expenses)} = ${f(context.taxable_income)}`,
    formula: (context) => context.sales - context.expenses,
  },
]

// 法人税関連の計算ステップ
export const corporateTaxSteps: CalculationStep[] = [
  {
    id: 'corporate_tax_rate',
    name: '法人税率',
    category: '法人税',
    formulaText: (context) => {
      const rate = context.taxable_income > 8000000 ? 0.232 : 0.15
      return `課税所得 ${f(context.taxable_income)} は ${
        context.taxable_income > 8000000 ? '800万円超' : '800万円以下'
      } のため、税率 ${(rate * 100).toFixed(1)}%`
    },
    formula: (context) => (context.taxable_income > 8000000 ? 0.232 : 0.15),
  },
  {
    id: 'corporate_tax_base',
    name: '法人税（基本税額）',
    category: '法人税',
    formulaText: (context) =>
      `課税所得 ${f(context.taxable_income)} × 税率 ${(context.corporate_tax_rate * 100).toFixed(1)}% = ${f(context.corporate_tax_base)}`,
    formula: (context) =>
      Math.round(context.taxable_income * context.corporate_tax_rate),
  },
  {
    id: 'local_corporate_tax',
    name: '地方法人税',
    category: '法人税',
    formulaText: (context) =>
      `法人税額 ${f(context.corporate_tax_base)} × 税率 10.3%`,
    formula: (context) => Math.round(context.corporate_tax_base * 0.103),
  },
]

// 住民税関連の計算ステップ
export const inhabitantTaxSteps: CalculationStep[] = [
  {
    id: 'prefectural_tax',
    name: '都道府県民税（法人税割）',
    category: '住民税',
    formulaText: (context) =>
      `法人税額 ${f(context.corporate_tax_base)} × 税率 1.0%`,
    formula: (context) => Math.round(context.corporate_tax_base * 0.01),
  },
  {
    id: 'municipal_tax',
    name: '市町村民税（法人税割）',
    category: '住民税',
    formulaText: (context) =>
      `法人税額 ${f(context.corporate_tax_base)} × 税率 6.0%`,
    formula: (context) => Math.round(context.corporate_tax_base * 0.06),
  },
  {
    id: 'per_capita_tax',
    name: '均等割',
    category: '住民税',
    formulaText: () => '定額 70,000円',
    formula: () => 70000,
  },
]

// 事業税関連の計算ステップ
export const businessTaxSteps: CalculationStep[] = [
  {
    id: 'business_tax_base',
    name: '法人事業税',
    category: '事業税',
    formulaText: (context) =>
      `課税所得 ${f(context.taxable_income)} × 税率 7.0%`,
    formula: (context) => Math.round(context.taxable_income * 0.07),
  },
  {
    id: 'special_local_corporate_tax',
    name: '特別法人事業税',
    category: '事業税',
    formulaText: (context) =>
      `法人事業税額 ${f(context.business_tax_base)} × 税率 43.2%`,
    formula: (context) => Math.round(context.business_tax_base * 0.432),
  },
]

// 消費税関連の計算ステップ
export const consumptionTaxSteps: CalculationStep[] = [
  {
    id: 'consumption_tax_base',
    name: '消費税（国税）',
    category: '消費税',
    formulaText: (context) => `課税売上 ${f(context.sales)} × 税率 7.8%`,
    formula: (context) => Math.round(context.sales * 0.078),
  },
  {
    id: 'local_consumption_tax',
    name: '地方消費税',
    category: '消費税',
    formulaText: (context) => `課税売上 ${f(context.sales)} × 税率 2.2%`,
    formula: (context) => Math.round(context.sales * 0.022),
  },
]

// すべての計算ステップを結合
export const steps2024: CalculationStep[] = [
  ...basicInfoSteps,
  ...corporateTaxSteps,
  ...inhabitantTaxSteps,
  ...businessTaxSteps,
  ...consumptionTaxSteps,
]
