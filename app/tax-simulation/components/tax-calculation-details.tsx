import { Calculator } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CalculationStep } from '@/lib/client/tax-calculation'

interface TaxCalculationDetailsProps<T> {
  steps: CalculationStep<T>[]
  context: T
}

export function TaxCalculationDetails<T>({
  steps,
  context,
}: TaxCalculationDetailsProps<T>) {
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
              {steps.map((step, index) => (
                <div key={index} className="pt-4">
                  <h4 className="font-medium mb-2">{step.category}</h4>
                  <div className="bg-white p-3 rounded border mb-2 space-y-4">
                    {step.subSteps.map((subStep, subIndex) => (
                      <div key={subIndex}>
                        <p className="text-sm font-bold">{subStep.name}</p>
                        <p className="text-sm mt-1 ml-8">
                          {subStep.statement(context)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
