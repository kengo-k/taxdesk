import { CalculationStep } from '../calculation/calc'
import { Calculator } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface TaxCalculationDetailsProps {
  steps: CalculationStep[]
  context: Record<string, any>
}

// 金額のフォーマット
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function TaxCalculationDetails({
  steps,
  context,
}: TaxCalculationDetailsProps) {
  // カテゴリごとにグループ化
  const stepsByCategory = steps.reduce(
    (acc, step) => {
      const category = step.category || 'その他'
      if (!acc[category]) acc[category] = []
      acc[category].push(step)
      return acc
    },
    {} as Record<string, CalculationStep[]>,
  )

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
              {/* カテゴリごとに表示 */}
              {Object.entries(stepsByCategory).map(([category, steps]) => (
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
                        {step.formulaText(context, formatCurrency)} ={' '}
                        {formatCurrency(context[step.id])}
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
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
