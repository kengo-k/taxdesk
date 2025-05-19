import { BaseContext } from '.'

import {
  floor as f,
  formatCurrency as fmt,
  roundDown100 as r100,
  roundDown1000 as r1000,
} from '@/lib/client/tax-calculation/calc'
import { CalculationStep } from '@/lib/client/tax-calculation/types'

export interface Context2023 extends BaseContext {
  // 計算に必要な初期パラメーター
  sales: number
  expenses: number
  previous_business_tax: number
  corporate_tax_after_deduction: number

  // 課税所得
  taxable_income: number

  // 法人税
  rounded_taxable_income: number
  corporate_tax_rate: number
  corporate_tax_base: number
  corporate_tax_deduction: number
  corporate_tax_final: number

  // 地方法人税
  local_corporate_tax_base: number
  local_corporate_tax_calc: number
  local_corporate_tax_final: number

  // 都民税
  tokyo_tax_base: number
  tokyo_tax_calc: number
  tokyo_tax_final: number
  tokyo_tax_equal_tax: number

  // 事業税
  business_tax_base: number
  business_tax: number
  business_tax_final: number

  // 特別法人事業税
  special_local_corporate_tax_calc: number
  special_local_corporate_tax_final: number

  // 消費税
  consumption_tax_status: number
}

// 基本情報関連の計算ステップ
export const steps2023: CalculationStep<Context2023>[] = [
  {
    category: '課税所得',
    subSteps: [
      {
        id: 'taxable_income',
        name: '課税所得',
        calculate: (context) =>
          context.sales - context.expenses - context.previous_business_tax,
        statement: (context) =>
          `収入 ${fmt(context.sales)} - 支出 ${fmt(context.expenses)} - 前年度の事業税額 ${fmt(context.previous_business_tax)} = ${fmt(context.taxable_income)}`,
      },
    ],
  },
  {
    category: '法人税',
    subSteps: [
      {
        id: 'rounded_taxable_income',
        name: '計算基準',
        calculate: (context) => r1000(context.taxable_income),
        statement: (context) =>
          `課税所得（1000円未満切捨）= ${fmt(context.rounded_taxable_income)}`,
      },
      {
        id: 'corporate_tax_rate',
        name: '法人税率',
        calculate: (context) =>
          context.rounded_taxable_income > 8000000 ? 0.232 : 0.15,
        statement: (context) => {
          return `課税所得${
            context.rounded_taxable_income > 8000000
              ? '800万円超'
              : '800万円以下'
          } = ${(context.corporate_tax_rate * 100).toFixed(1)}%`
        },
      },
      {
        id: 'corporate_tax_base',
        name: '法人税',
        calculate: (context) =>
          f(context.rounded_taxable_income * context.corporate_tax_rate),
        statement: (context) =>
          `計算基準 ${fmt(context.rounded_taxable_income)} × 法人税率 ${(context.corporate_tax_rate * 100).toFixed(1)}% = ${fmt(context.corporate_tax_base)}`,
      },
      {
        id: 'corporate_tax_after_deduction',
        name: '法人税（控除後）',
        calculate: (context) =>
          context.corporate_tax_base - context.corporate_tax_deduction,
        statement: (context) =>
          `法人税 ${fmt(context.corporate_tax_base)} - 控除額 ${fmt(context.corporate_tax_deduction)} = ${fmt(context.corporate_tax_after_deduction)}`,
      },
      {
        id: 'corporate_tax_final',
        name: '法人税（確定）',
        calculate: (context) => r100(context.corporate_tax_after_deduction),
        statement: (context) =>
          `法人税（控除後）の100円未満を切捨て = ${fmt(context.corporate_tax_final)}`,
      },
    ],
  },
  {
    category: '地方法人税',
    subSteps: [
      {
        id: 'local_corporate_tax_base',
        name: '計算基準',
        calculate: (context) => r1000(context.corporate_tax_base),
        statement: (context) =>
          `法人税額（1000円未満切捨）= ${fmt(context.local_corporate_tax_base)}`,
      },
      {
        id: 'local_corporate_tax_calc',
        name: '地方法人税',
        calculate: (context) => f(context.local_corporate_tax_base * 0.103),
        statement: (context) =>
          `計算基準 ${fmt(context.local_corporate_tax_base)} × 税率 10.3% = ${fmt(context.local_corporate_tax_calc)}`,
      },
      {
        id: 'local_corporate_tax_final',
        name: '地方法人税（確定）',
        calculate: (context) => r100(context.local_corporate_tax_calc),
        statement: (context) =>
          `地方法人税 ${fmt(context.local_corporate_tax_calc)} の100円未満を切捨て = ${fmt(context.local_corporate_tax_final)}`,
      },
    ],
  },
  {
    category: '都民税(法人税割)',
    subSteps: [
      {
        id: 'tokyo_tax_base',
        name: '計算基準',
        calculate: (context) => r1000(context.corporate_tax_base),
        statement: (context) =>
          `法人税額 ${fmt(context.corporate_tax_base)} の1000円未満を切捨て = ${fmt(context.tokyo_tax_base)}`,
      },
      {
        id: 'tokyo_tax_calc',
        name: '都民税(法人税割)',
        calculate: (context) => f(context.tokyo_tax_base * 0.07),
        statement: (context) =>
          `計算基準 ${fmt(context.tokyo_tax_base)} × 税率 7.0% = ${fmt(context.tokyo_tax_calc)}`,
      },
      {
        id: 'tokyo_tax_final',
        name: '都民税(法人税割)(確定)',
        calculate: (context) => r100(context.tokyo_tax_calc),
        statement: (context) =>
          `都民税(法人税割) ${fmt(context.tokyo_tax_calc)} の100円未満を切捨て = ${fmt(context.tokyo_tax_final)}`,
      },
    ],
  },
  {
    category: '都民税(均等割)',
    subSteps: [
      {
        id: 'tokyo_tax_equal_tax',
        name: '都民税(均等割)',
        calculate: () => 70000,
        statement: (context) => `${fmt(context.tokyo_tax_equal_tax)}`,
      },
    ],
  },
  {
    category: '事業税',
    subSteps: [
      {
        id: 'business_tax_base',
        name: '計算基準',
        calculate: (context) => r1000(context.taxable_income),
        statement: (context) =>
          `課税所得 ${fmt(context.business_tax_base)}の1000円未満を切捨て = ${fmt(context.business_tax_base)}`,
      },
      {
        id: 'business_tax',
        name: '事業税',
        calculate: (context) => f(context.business_tax_base * 0.035),
        statement: (context) =>
          `計算基準 ${fmt(context.business_tax_base)} × 税率 3.5% = ${fmt(context.business_tax)}`,
      },
      {
        id: 'business_tax_final',
        name: '事業税(確定)',
        calculate: (context) => r100(context.business_tax),
        statement: (context) =>
          `事業税 ${fmt(context.business_tax)} の100円未満を切捨て = ${fmt(context.business_tax_final)}`,
      },
    ],
  },
  {
    category: '特別法人事業税',
    subSteps: [
      {
        id: 'special_local_corporate_tax_calc',
        name: '計算基準',
        calculate: (context) => f(context.business_tax_final * 0.37),
        statement: (context) =>
          `事業税額 ${fmt(context.business_tax_final)} × 税率 37.0% = ${fmt(context.special_local_corporate_tax_calc)}`,
      },
      {
        id: 'special_local_corporate_tax_final',
        name: '特別法人事業税(確定)',
        calculate: (context) => r100(context.special_local_corporate_tax_calc),
        statement: (context) =>
          `特別法人事業税額 ${fmt(context.special_local_corporate_tax_calc)} の100円未満を切捨て = ${fmt(context.special_local_corporate_tax_final)}`,
      },
    ],
  },
  {
    category: '消費税',
    subSteps: [
      {
        id: 'consumption_tax_status',
        name: '消費税',
        calculate: () => 0,
        statement: (context) =>
          `免税事業者のため ${fmt(context.consumption_tax_status)}`,
      },
    ],
  },
]
