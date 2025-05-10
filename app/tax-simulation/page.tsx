'use client'

import { useCallback, useState } from 'react'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { ArrowLeft, Download } from 'lucide-react'

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

import { calc, stepMappings } from './calculation/calc'
import { TaxCalculationDetails } from './components/tax-calculation-details'

export default function TaxSimulationPage() {
  const searchParams = useSearchParams()
  const yearParam = searchParams.get('year') || '2024'

  // 状態管理
  const [selectedYear, setSelectedYear] = useState(yearParam)
  const steps = stepMappings[selectedYear]
  const context = calc(steps, {
    sales: 7362012,
    expenses: 7202571,
    previousBusinessTax: 4500,
  })

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
              <TaxCalculationDetails steps={steps} context={context} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
