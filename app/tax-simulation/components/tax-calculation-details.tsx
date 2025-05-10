import { Calculator } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// 計算ステップの定義
interface CalculationStep {
  id: string // 一意の識別子（結果をcontextに保存する際のキー名）
  name: string // 表示名（「事業税」など）
  formulaText: string // 数式の表示テキスト（${paramName}で変数を埋め込み可能）
  formula: (context: Record<string, any>) => number // 実際の計算処理
  formulaParams: string[] // 計算に必要なパラメータ（contextから取得）
  category?: string // カテゴリ（「法人税」「住民税」など）
}

// 入力データの型定義
interface TaxInputData {
  sales: number
  expenses: number
  previousBusinessTax: number
}

// 計算処理を行う関数
function calc(
  steps: CalculationStep[],
  inputData: TaxInputData,
  context: Record<string, any> = {},
): { results: Record<string, number>; context: Record<string, any> } {
  // 入力データをコンテキストに設定
  context.sales = inputData.sales
  context.expenses = inputData.expenses
  context.previousBusinessTax = inputData.previousBusinessTax || 0

  // 初期コンテキストの設定（課税所得など基本値の計算）
  if (!context.taxable_income) {
    context.taxable_income =
      inputData.sales -
      inputData.expenses -
      (inputData.previousBusinessTax || 0)
  }

  const results: Record<string, number> = {}

  // 各ステップを順に処理
  for (const step of steps) {
    try {
      // 計算実行
      const value = step.formula(context)

      // 結果を格納
      results[step.id] = value

      // コンテキストに結果を追加（次のステップで参照可能に）
      context[step.id] = value
    } catch (error) {
      console.error(`Error calculating step ${step.id}:`, error)
      results[step.id] = 0 // エラー時はデフォルト値を設定
    }
  }

  return { results, context }
}

// 数式テキスト内の変数を実際の値に置換して表示
function formatFormulaText(
  formulaText: string,
  context: Record<string, any>,
  formatFunc: (val: number) => string,
): string {
  return formulaText.replace(/\${(\w+)}/g, (_, paramName) => {
    return formatFunc(context[paramName])
  })
}

// カテゴリごとにステップをグループ化
function groupByCategory(
  steps: CalculationStep[],
): Record<string, CalculationStep[]> {
  return steps.reduce(
    (acc, step) => {
      const category = step.category || 'その他'
      if (!acc[category]) acc[category] = []
      acc[category].push(step)
      return acc
    },
    {} as Record<string, CalculationStep[]>,
  )
}

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

// すべての計算ステップを結合
const allTaxSteps: CalculationStep[] = [
  ...basicInfoSteps,
  ...corporateTaxSteps,
  ...inhabitantTaxSteps,
  ...businessTaxSteps,
  ...consumptionTaxSteps,
]

interface TaxCalculationDetailsProps {
  loading: boolean
}

export function TaxCalculationDetails({ loading }: TaxCalculationDetailsProps) {
  // 金額のフォーマット
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <Accordion type="single" collapsible defaultValue="calculation">
        <AccordionItem value="calculation">
          <AccordionTrigger>
            <span className="flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              税額計算の詳細
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
              {/* 計算ステップベースの表示 */}
              {(() => {
                // 計算に必要な入力データを準備
                const inputData: TaxInputData = {
                  sales: 7362012,
                  expenses: 7202571,
                  previousBusinessTax: 4500,
                }

                // 計算実行
                const { results, context } = calc(allTaxSteps, inputData)

                // カテゴリごとにグループ化
                const stepsByCategory = groupByCategory(allTaxSteps)

                // カテゴリごとに表示
                return Object.entries(stepsByCategory).map(
                  ([category, steps]) => (
                    <div key={category} className="pt-4 border-t">
                      <h4 className="font-medium mb-2">{category}計算</h4>

                      {/* 各ステップの表示 */}
                      {steps.map((step) => (
                        <div
                          key={step.id}
                          className="bg-white p-3 rounded border mb-2"
                        >
                          <p className="text-sm font-medium">{step.name}</p>
                          <p className="text-sm mt-1">
                            {formatFormulaText(
                              step.formulaText,
                              context,
                              formatCurrency,
                            )}{' '}
                            = {formatCurrency(results[step.id])}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ※
                            {step.formulaParams.length > 0
                              ? `${step.formulaParams.join(', ')}をベースに計算`
                              : '定額計算'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ),
                )
              })()}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
