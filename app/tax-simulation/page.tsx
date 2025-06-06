'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { ArrowLeft, Download } from 'lucide-react'

import { TaxCalculationDetails } from '@/app/tax-simulation/components/tax-calculation-details'
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
import { calculateTax, formatCurrency } from '@/lib/client/tax-calculation/calc'
import { buildTaxParameters } from '@/lib/client/tax-calculation/parameters'
import { getSteps } from '@/lib/client/tax-calculation/steps'
import {
  fetchTaxCalculationParameters,
  selectTaxCalculationParameters,
} from '@/lib/redux/features/reportSlice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'

export default function TaxSimulationPage() {
  const dispatch = useAppDispatch()

  const searchParams = useSearchParams()
  const yearParam = searchParams.get('year') || '2024'
  const { data: taxCalculationParameters } = useAppSelector(
    selectTaxCalculationParameters,
  )

  // 状態管理
  const [selectedYear, setSelectedYear] = useState(yearParam)

  useEffect(() => {
    if (selectedYear) {
      dispatch(fetchTaxCalculationParameters(selectedYear))
    }
  }, [dispatch, selectedYear])

  const [result, steps, context] = useMemo(() => {
    if (taxCalculationParameters.length === 0) {
      return [[], [], null]
    }
    const parameters = buildTaxParameters(
      taxCalculationParameters,
      selectedYear,
    )
    const steps = getSteps(selectedYear)
    const context = calculateTax(steps, parameters)
    const result = context.getResult() as {
      taxName: string
      taxAmount: number
    }[]
    return [result, steps, context]
  }, [taxCalculationParameters, selectedYear])

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
                      <SelectItem value="2023">2023年度</SelectItem>
                      <SelectItem value="2024">2024年度</SelectItem>
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

        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card>
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
              {/* 各種税額とその合計額をカード形式で表示 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {result.map((tax, index) => {
                  const isLast = index === result.length - 1
                  return (
                    <div
                      key={tax.taxName}
                      className={`border rounded-lg p-4 shadow-sm ${
                        isLast
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <h3
                        className={`text-sm font-medium mb-1 ${
                          isLast ? 'text-blue-800' : 'text-gray-800'
                        }`}
                      >
                        {tax.taxName}
                      </h3>
                      <p
                        className={`text-lg font-bold ${
                          isLast ? 'text-blue-900' : 'text-gray-900'
                        }`}
                      >
                        {formatCurrency(tax.taxAmount)}
                      </p>
                    </div>
                  )
                })}
              </div>

              <TaxCalculationDetails steps={steps} context={context} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
