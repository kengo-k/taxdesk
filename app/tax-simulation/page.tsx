'use client'

import { useCallback, useState } from 'react'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { ArrowLeft, Calculator, Download } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

// 計算ステップの定義
interface CalculationStep {
  id: string // 一意の識別子（結果をcontextに保存する際のキー名）
  name: string // 表示名（「事業税」など）
  formulaText: string // 数式の表示テキスト（${paramName}で変数を埋め込み可能）
  formula: (context: Record<string, any>) => number // 実際の計算処理
  formulaParams: string[] // 計算に必要なパラメータ（contextから取得）
  category?: string // カテゴリ（「法人税」「住民税」など）
}

// 税率設定の型定義
interface TaxRates {
  // 法人税関連
  corporateTaxRate: number
  localCorporateTaxRate: number

  // 住民税関連
  prefecturalTaxRate: number
  municipalTaxRate: number
  corporateInhabitantTaxPerCapita: number

  // 事業税関連
  businessTaxRate: number
  specialLocalCorporateTaxRate: number

  // 消費税
  consumptionTaxRate: number
  localConsumptionTaxRate: number
}

// 入力データの型定義
interface TaxInputData {
  sales: number // 売上
  expenses: number // 経費
  previousBusinessTax?: number // 前年の事業税（任意）
}

// 納付予定データの型定義
interface TaxPaymentSchedule {
  period: string
  dueDate: string
  taxType: string
  amount: number
  status: 'upcoming' | 'paid' | 'overdue'
}

// 税額データの型定義
interface TaxEstimates {
  // 法人税関連
  corporateTax: number
  localCorporateTax: number
  totalCorporateTax: number

  // 住民税関連
  prefecturalTax: number
  municipalTax: number
  corporateInhabitantTaxPerCapita: number
  totalInhabitantTax: number

  // 事業税関連
  businessTax: number
  specialLocalCorporateTax: number
  totalBusinessTax: number

  // 消費税関連
  consumptionTax: number
  localConsumptionTax: number
  totalConsumptionTax: number

  // 合計
  total: number
}

// 年度データの型定義
interface YearData {
  income: number
  expense: number
  profit: number
  taxEstimates: TaxEstimates
  paymentSchedule: TaxPaymentSchedule[]
}

// 計算処理を行う関数
function calc(
  steps: CalculationStep[],
  inputData: TaxInputData,
  context: Record<string, any> = {},
): { results: Record<string, number>; context: Record<string, any> } {
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
    // 計算実行
    const value = step.formula(context)

    // 結果を格納
    results[step.id] = value

    // コンテキストに結果を追加（次のステップで参照可能に）
    context[step.id] = value
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

// カテゴリごとの合計を計算
function getCategoryTotal(
  category: string,
  steps: CalculationStep[],
  results: Record<string, number>,
): number {
  return steps
    .filter((step) => step.category === category)
    .reduce((total, step) => total + results[step.id], 0)
}

// カテゴリに応じた背景色を取得
function getCategoryColor(category: string): string {
  switch (category) {
    case '法人税':
      return 'blue'
    case '住民税':
      return 'green'
    case '事業税':
      return 'amber'
    case '消費税':
      return 'purple'
    default:
      return 'gray'
  }
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

// 納付予定データを生成する関数
function generatePaymentSchedule(
  year: number,
  results: Record<string, number>,
): TaxPaymentSchedule[] {
  const schedule: TaxPaymentSchedule[] = []
  const nextYear = year + 1

  // 法人税関連の合計
  const corporateTaxTotal = corporateTaxSteps.reduce(
    (sum, step) => sum + (results[step.id] || 0),
    0,
  )

  // 住民税関連の合計
  const inhabitantTaxTotal = inhabitantTaxSteps.reduce(
    (sum, step) => sum + (results[step.id] || 0),
    0,
  )

  // 事業税関連の合計
  const businessTaxTotal = businessTaxSteps.reduce(
    (sum, step) => sum + (results[step.id] || 0),
    0,
  )

  // 消費税関連の合計
  const consumptionTaxTotal = consumptionTaxSteps.reduce(
    (sum, step) => sum + (results[step.id] || 0),
    0,
  )

  // 法人税（確定申告と中間申告）
  schedule.push({
    period: `${year}年度確定申告`,
    dueDate: `${nextYear}/3/15`,
    taxType: '法人税',
    amount: corporateTaxTotal,
    status: year < 2024 ? 'paid' : 'upcoming',
  })

  // 中間申告（前年度の半額を納付）
  if (corporateTaxTotal > 100000) {
    schedule.push({
      period: `${year}年度中間申告`,
      dueDate: `${year}/9/15`,
      taxType: '法人税（中間）',
      amount: Math.floor(corporateTaxTotal / 2),
      status: year < 2024 ? 'paid' : 'upcoming',
    })
  }

  // 住民税（法人税確定申告後）
  schedule.push({
    period: `${year}年度確定申告`,
    dueDate: `${nextYear}/3/31`,
    taxType: '住民税',
    amount: inhabitantTaxTotal,
    status: year < 2024 ? 'paid' : 'upcoming',
  })

  // 事業税（法人税確定申告後）
  schedule.push({
    period: `${year}年度確定申告`,
    dueDate: `${nextYear}/3/31`,
    taxType: '事業税',
    amount: businessTaxTotal,
    status: year < 2024 ? 'paid' : 'upcoming',
  })

  // 消費税（確定申告）
  schedule.push({
    period: `${year}年度確定申告`,
    dueDate: `${nextYear}/3/31`,
    taxType: '消費税',
    amount: consumptionTaxTotal,
    status: year < 2024 ? 'paid' : 'upcoming',
  })

  // 消費税（中間申告）- 前年度の実績が一定以上の場合
  if (consumptionTaxTotal > 100000) {
    schedule.push({
      period: `${year}年度中間申告`,
      dueDate: `${year}/11/30`,
      taxType: '消費税（中間）',
      amount: Math.floor(consumptionTaxTotal / 2),
      status: year < 2024 ? 'paid' : 'upcoming',
    })
  }

  // 日付順にソート
  return schedule.sort((a, b) => {
    const dateA = new Date(a.dueDate.replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3'))
    const dateB = new Date(b.dueDate.replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3'))
    return dateA.getTime() - dateB.getTime()
  })
}

export default function TaxSimulationPage() {
  const searchParams = useSearchParams()
  const yearParam = searchParams.get('year') || '2024'

  // 状態管理
  const [selectedYear, setSelectedYear] = useState(yearParam)

  const [loading, setLoading] = useState(false)

  // シミュレーション結果の計算
  const simulatedIncome = 0
  const simulatedExpense = 0

  // 金額のフォーマット
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // PDFダウンロード処理
  const handleDownloadPDF = useCallback(() => {
    toast({
      title: 'PDFをダウンロードしました',
      description: `${selectedYear}年度の税額シミュレーション結果をダウンロードしました。`,
    })
  }, [selectedYear])

  return (
    <div className="container mx-auto px-4 py-6">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            戻る
          </Link>
          <h2 className="text-lg font-bold">
            {selectedYear === '2024' ? '税額シミュレーション' : '確定税額詳細'}
          </h2>
        </div>

        {/* 年度選択と操作ボタン */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    会計年度
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="会計年度を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2021">2021年度</SelectItem>
                      <SelectItem value="2022">2022年度</SelectItem>
                      <SelectItem value="2023">2023年度</SelectItem>
                      <SelectItem value="2024">2024年度</SelectItem>
                      <SelectItem value="2025">2025年度</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  PDFダウンロード
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedYear}年度{' '}
                {selectedYear === '2024' ? '税額見込み' : '確定税額'}
              </CardTitle>
              <CardDescription>
                {selectedYear === '2024'
                  ? '現在の収支に基づく年間税額見込み'
                  : `${selectedYear}年度の確定税額`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                //   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                //     <div className="p-4 bg-blue-50 rounded-lg">
                //       <h3 className="text-sm text-gray-600 flex items-center">
                //         法人税関連
                //         <TooltipProvider>
                //           <Tooltip
                //             open={isTooltipOpen}
                //             onOpenChange={setIsTooltipOpen}
                //           >
                //             <TooltipTrigger asChild>
                //               <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                //             </TooltipTrigger>
                //             <TooltipContent>
                //               <p>
                //                 法人税と地方法人税の合計です。
                //                 <br />
                //                 法人税率: {taxRates.corporateTaxRate}%
                //                 <br />
                //                 地方法人税率: {taxRates.localCorporateTaxRate}%
                //               </p>
                //             </TooltipContent>
                //           </Tooltip>
                //         </TooltipProvider>
                //       </h3>
                //       <p className="text-xl font-bold mt-1">
                //         {formatCurrency(displayTaxData.totalCorporateTax)}
                //       </p>
                //     </div>
                //     <div className="p-4 bg-green-50 rounded-lg">
                //       <h3 className="text-sm text-gray-600 flex items-center">
                //         住民税関連
                //         <TooltipProvider>
                //           <Tooltip
                //             open={isTooltipOpen}
                //             onOpenChange={setIsTooltipOpen}
                //           >
                //             <TooltipTrigger asChild>
                //               <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                //             </TooltipTrigger>
                //             <TooltipContent>
                //               <p>
                //                 都道府県民税、市町村民税、均等割の合計です。
                //                 <br />
                //                 都道府県民税率: {taxRates.prefecturalTaxRate}%
                //                 <br />
                //                 市町村民税率: {taxRates.municipalTaxRate}%
                //               </p>
                //             </TooltipContent>
                //           </Tooltip>
                //         </TooltipProvider>
                //       </h3>
                //       <p className="text-xl font-bold mt-1">
                //         {formatCurrency(displayTaxData.totalInhabitantTax)}
                //       </p>
                //     </div>
                //     <div className="p-4 bg-amber-50 rounded-lg">
                //       <h3 className="text-sm text-gray-600 flex items-center">
                //         事業税関連
                //         <TooltipProvider>
                //           <Tooltip
                //             open={isTooltipOpen}
                //             onOpenChange={setIsTooltipOpen}
                //           >
                //             <TooltipTrigger asChild>
                //               <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                //             </TooltipTrigger>
                //             <TooltipContent>
                //               <p>
                //                 法人事業税と特別法人事業税の合計です。
                //                 <br />
                //                 法人事業税率: {taxRates.businessTaxRate}%
                //                 <br />
                //                 特別法人事業税率:{' '}
                //                 {taxRates.specialLocalCorporateTaxRate}%
                //               </p>
                //             </TooltipContent>
                //           </Tooltip>
                //         </TooltipProvider>
                //       </h3>
                //       <p className="text-xl font-bold mt-1">
                //         {formatCurrency(displayTaxData.totalBusinessTax)}
                //       </p>
                //     </div>
                //     <div className="p-4 bg-purple-50 rounded-lg">
                //       <h3 className="text-sm text-gray-600 flex items-center">
                //         消費税関連
                //         <TooltipProvider>
                //           <Tooltip
                //             open={isTooltipOpen}
                //             onOpenChange={setIsTooltipOpen}
                //           >
                //             <TooltipTrigger asChild>
                //               <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                //             </TooltipTrigger>
                //             <TooltipContent>
                //               <p>
                //                 消費税と地方消費税の合計です。
                //                 <br />
                //                 消費税率: {taxRates.consumptionTaxRate}%
                //                 <br />
                //                 地方消費税率: {taxRates.localConsumptionTaxRate}%
                //               </p>
                //             </TooltipContent>
                //           </Tooltip>
                //         </TooltipProvider>
                //       </h3>
                //       <p className="text-xl font-bold mt-1">
                //         {formatCurrency(displayTaxData.totalConsumptionTax)}
                //       </p>
                //     </div>
                //   </div>
                //
                <br />
              )}

              {/* <div className="p-6 bg-gray-50 rounded-lg border flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">合計税額</h3>
                  <p className="text-sm text-gray-500">
                    {selectedYear}年度の総税額
                  </p>
                </div>
                <div className="text-3xl font-bold text-blue-600 mt-4 md:mt-0">
                  {formatCurrency(displayTaxData.total)}
                </div>
              </div> */}

              {/* 税額計算の詳細 */}
              {!loading && (
                <div className="mt-6">
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="calculation"
                  >
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
                              sales: simulatedIncome,
                              expenses: simulatedExpense,
                              previousBusinessTax: 0, // 前年の事業税（サンプルとして0を設定）
                            }

                            // 計算実行
                            const { results, context } = calc(
                              allTaxSteps,
                              inputData,
                            )

                            // カテゴリごとにグループ化
                            const stepsByCategory = groupByCategory(allTaxSteps)

                            // カテゴリごとに表示
                            return Object.entries(stepsByCategory).map(
                              ([category, steps]) => (
                                <div key={category} className="pt-4 border-t">
                                  <h4 className="font-medium mb-2">
                                    {category}計算
                                  </h4>

                                  {/* 各ステップの表示 */}
                                  {steps.map((step) => (
                                    <div
                                      key={step.id}
                                      className="bg-white p-3 rounded border mb-2"
                                    >
                                      <p className="text-sm font-medium">
                                        {step.name}
                                      </p>
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

                                  {/* カテゴリ小計 */}
                                  <div
                                    className={`bg-${getCategoryColor(category)}-50 p-3 rounded border`}
                                  >
                                    <p className="text-sm font-medium">
                                      {category}合計
                                    </p>
                                    <p className="text-sm mt-1">
                                      {steps.map((step, index) => (
                                        <span key={step.id}>
                                          {index > 0 && ' + '}
                                          {step.name}{' '}
                                          {formatCurrency(results[step.id])}
                                        </span>
                                      ))}{' '}
                                      ={' '}
                                      {formatCurrency(
                                        getCategoryTotal(
                                          category,
                                          allTaxSteps,
                                          results,
                                        ),
                                      )}
                                    </p>
                                  </div>
                                </div>
                              ),
                            )
                          })()}

                          {/* 総合計
                          <div className="pt-4 border-t">
                            <div className="bg-blue-100 p-4 rounded border">
                              <p className="font-medium">税金総合計</p>
                              <p className="mt-1">
                                法人税合計{' '}
                                {formatCurrency(
                                  displayTaxData.totalCorporateTax,
                                )}{' '}
                                + 住民税合計{' '}
                                {formatCurrency(
                                  displayTaxData.totalInhabitantTax,
                                )}{' '}
                                + 事業税合計{' '}
                                {formatCurrency(
                                  displayTaxData.totalBusinessTax,
                                )}{' '}
                                + 消費税合計{' '}
                                {formatCurrency(
                                  displayTaxData.totalConsumptionTax,
                                )}{' '}
                                = {formatCurrency(displayTaxData.total)}
                              </p>
                            </div>
                          </div> */}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
