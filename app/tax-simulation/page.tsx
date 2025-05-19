'use client'

import { useCallback, useState } from 'react'

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
import { useAppSelector } from '@/lib/redux/hooks'

export default function TaxSimulationPage() {
  const searchParams = useSearchParams()
  const yearParam = searchParams.get('year') || '2024'
  const state = useAppSelector((state) => state)

  // 状態管理
  const [selectedYear, setSelectedYear] = useState(yearParam)

  // 税額計算
  const parameters = buildTaxParameters(state, selectedYear)
  const steps = getSteps(selectedYear)
  const context = calculateTax(steps, parameters)
  const result = context.getResult() as { taxName: string; taxAmount: number }[]

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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {result.map((tax) => {
                  // 税種ごとの色を定義
                  const colorMap: Record<
                    string,
                    { bg: string; border: string; text: string; value: string }
                  > = {
                    法人税: {
                      bg: 'bg-blue-50',
                      border: 'border-blue-200',
                      text: 'text-blue-800',
                      value: 'text-blue-900',
                    },
                    地方法人税: {
                      bg: 'bg-green-50',
                      border: 'border-green-200',
                      text: 'text-green-800',
                      value: 'text-green-900',
                    },
                    住民税: {
                      bg: 'bg-purple-50',
                      border: 'border-purple-200',
                      text: 'text-purple-800',
                      value: 'text-purple-900',
                    },
                    事業税: {
                      bg: 'bg-amber-50',
                      border: 'border-amber-200',
                      text: 'text-amber-800',
                      value: 'text-amber-900',
                    },
                    消費税: {
                      bg: 'bg-teal-50',
                      border: 'border-teal-200',
                      text: 'text-teal-800',
                      value: 'text-teal-900',
                    },
                  }

                  // デフォルトの色（合計税額用）
                  const colors = colorMap[tax.taxName] || {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    text: 'text-gray-800',
                    value: 'text-gray-900',
                  }

                  return (
                    <div
                      key={tax.taxName}
                      className={`${colors.bg} border ${colors.border} rounded-lg p-4 shadow-sm`}
                    >
                      <h3 className={`text-sm font-medium ${colors.text} mb-1`}>
                        {tax.taxName}
                      </h3>
                      <p className={`text-lg font-bold ${colors.value}`}>
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
