import { CalculationStep } from './calc'

// 基本情報関連の計算ステップ
const basicInfoSteps: CalculationStep[] = [
  {
    id: 'taxable_income',
    name: '課税所得',
    category: '基本情報',
    formulaText: '収入 ${sales} - 支出 ${expenses}',
    formulaParams: ['sales', 'expenses'],
    formula: (context) => context.sales - context.expenses,
  },
]

// 法人税関連の計算ステップ
const corporateTaxSteps: CalculationStep[] = [
  {
    id: 'corporate_tax_base',
    name: '法人税（基本税額）',
    category: '法人税',
    formulaText: '課税所得 ${taxable_income} × 税率 23.2%',
    formulaParams: ['taxable_income'],
    formula: (context) => Math.round(context.taxable_income * 0.232),
  },
  {
    id: 'local_corporate_tax',
    name: '地方法人税',
    category: '法人税',
    formulaText: '法人税額 ${corporate_tax_base} × 税率 10.3%',
    formulaParams: ['corporate_tax_base'],
    formula: (context) => Math.round(context.corporate_tax_base * 0.103),
  },
]

// 住民税関連の計算ステップ
const inhabitantTaxSteps: CalculationStep[] = [
  {
    id: 'prefectural_tax',
    name: '都道府県民税（法人税割）',
    category: '住民税',
    formulaText: '法人税額 ${corporate_tax_base} × 税率 1.0%',
    formulaParams: ['corporate_tax_base'],
    formula: (context) => Math.round(context.corporate_tax_base * 0.01),
  },
  {
    id: 'municipal_tax',
    name: '市町村民税（法人税割）',
    category: '住民税',
    formulaText: '法人税額 ${corporate_tax_base} × 税率 6.0%',
    formulaParams: ['corporate_tax_base'],
    formula: (context) => Math.round(context.corporate_tax_base * 0.06),
  },
  {
    id: 'per_capita_tax',
    name: '均等割',
    category: '住民税',
    formulaText: '定額 70,000円',
    formulaParams: [],
    formula: () => 70000,
  },
]

// 事業税関連の計算ステップ
const businessTaxSteps: CalculationStep[] = [
  {
    id: 'business_tax_base',
    name: '法人事業税',
    category: '事業税',
    formulaText: '課税所得 ${taxable_income} × 税率 7.0%',
    formulaParams: ['taxable_income'],
    formula: (context) => Math.round(context.taxable_income * 0.07),
  },
  {
    id: 'special_local_corporate_tax',
    name: '特別法人事業税',
    category: '事業税',
    formulaText: '法人事業税額 ${business_tax_base} × 税率 43.2%',
    formulaParams: ['business_tax_base'],
    formula: (context) => Math.round(context.business_tax_base * 0.432),
  },
]

// 消費税関連の計算ステップ
const consumptionTaxSteps: CalculationStep[] = [
  {
    id: 'consumption_tax_base',
    name: '消費税（国税）',
    category: '消費税',
    formulaText: '課税売上 ${sales} × 税率 7.8%',
    formulaParams: ['sales'],
    formula: (context) => Math.round(context.sales * 0.078),
  },
  {
    id: 'local_consumption_tax',
    name: '地方消費税',
    category: '消費税',
    formulaText: '課税売上 ${sales} × 税率 2.2%',
    formulaParams: ['sales'],
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
