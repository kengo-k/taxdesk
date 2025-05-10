import {
  TaxInputData,
  calc,
  formatFormulaText,
  groupByCategory,
} from '../calculation/calc'
import { steps } from '../calculation/steps2024'
import { Calculator } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

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
                const { results, context } = calc(steps, inputData)

                // カテゴリごとにグループ化
                const stepsByCategory = groupByCategory(steps)

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
