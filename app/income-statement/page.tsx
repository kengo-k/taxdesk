'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import { ArrowLeft } from 'lucide-react'

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
import {
  buildTaxParameters,
  calculateTax,
  getSteps,
} from '@/lib/client/tax-calculation'
import {
  fetchFiscalYears,
  selectAllFiscalYears,
  selectFiscalYearLoading,
} from '@/lib/redux/features/fiscalYearSlice'
import {
  fetchTaxCalculationParameters,
  selectTaxCalculationParameters,
} from '@/lib/redux/features/reportSlice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'

export default function IncomeStatementPage() {
  // Redux
  const dispatch = useAppDispatch()
  const fiscalYears = useAppSelector(selectAllFiscalYears)
  const fiscalYearsLoading = useAppSelector(selectFiscalYearLoading)
  const taxCalculationParameters = useAppSelector(
    selectTaxCalculationParameters,
  )

  // 年度選択の状態
  const [fiscalYear, setFiscalYear] = useState('none')
  const [incomeStatementData, setIncomeStatementData] = useState({
    revenue: [
      { name: '売上高', amount: 10000000 },
      { name: '営業外収益', amount: 0 },
      { name: '受取利息', amount: 50000 },
    ],
    expenses: [{ name: '販売費及び一般管理費', amount: 2500000 }],
    taxes: [{ name: '法人税、住民税及び事業税', amount: 0 }],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 年度データの取得
  useEffect(() => {
    // ストアに年度データがない場合のみ取得
    if (fiscalYears.length === 0 && !fiscalYearsLoading) {
      dispatch(fetchFiscalYears())
    }
  }, [dispatch, fiscalYears.length, fiscalYearsLoading])

  // 年度が取得できたら、初期値を設定
  useEffect(() => {
    if (fiscalYears.length > 0) {
      // 初期値は未選択状態のままにする
      setFiscalYear('none')
    }
  }, [fiscalYears])

  // 税額計算パラメータの取得
  useEffect(() => {
    if (fiscalYear !== 'none') {
      dispatch(fetchTaxCalculationParameters(fiscalYear))
    }
  }, [dispatch, fiscalYear])

  // 税額計算
  const taxCalculation = useMemo(() => {
    if (fiscalYear === 'none') return null
    try {
      const parameters = buildTaxParameters(
        taxCalculationParameters,
        fiscalYear,
      )
      const steps = getSteps(fiscalYear)
      return calculateTax(steps, parameters)
    } catch (error) {
      console.error('Tax calculation failed:', error)
      return null
    }
  }, [fiscalYear, taxCalculationParameters])

  // 税額計算結果を反映
  useEffect(() => {
    if (taxCalculation) {
      const result = taxCalculation.getResult()
      const totalTaxAmount = result.reduce(
        (sum: number, tax: { taxName: string; taxAmount: number }) => {
          // 消費税以外の税金を合計
          if (tax.taxName !== '消費税') {
            return sum + tax.taxAmount
          }
          return sum
        },
        0,
      )

      setIncomeStatementData((prev) => ({
        ...prev,
        taxes: [{ name: '法人税、住民税及び事業税', amount: totalTaxAmount }],
      }))
    }
  }, [taxCalculation])

  console.log(taxCalculation)

  // 合計金額の計算
  const totalRevenue = incomeStatementData.revenue.reduce(
    (sum, item) => sum + item.amount,
    0,
  )
  const totalExpenses = incomeStatementData.expenses.reduce(
    (sum, item) => sum + item.amount,
    0,
  )
  const operatingIncome = totalRevenue - totalExpenses
  const totalTaxes = incomeStatementData.taxes.reduce(
    (sum, item) => sum + item.amount,
    0,
  )
  const netIncome = operatingIncome - totalTaxes

  // 金額のフォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // データ読み込み中の表示
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <p className="text-lg mb-2">データを読み込み中...</p>
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // エラーの表示
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center print:hidden">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              戻る
            </Link>
            <h2 className="text-lg font-bold">損益計算書</h2>
          </div>
          <Card className="mb-6">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="text-red-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <h3 className="text-lg font-bold">エラーが発生しました</h3>
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                再読み込み
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // データがnullの場合、または年度が未選択の場合
  if (!incomeStatementData || fiscalYear === 'none') {
    return (
      <div className="container mx-auto px-4 py-6">
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center print:hidden">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              戻る
            </Link>
            <h2 className="text-lg font-bold">損益計算書</h2>
          </div>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    会計年度
                  </label>
                  <Select value={fiscalYear} onValueChange={setFiscalYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="会計年度を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">未設定</SelectItem>
                      {fiscalYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {fiscalYear === 'none' && (
                <div className="mt-6 text-center">
                  <div className="text-amber-500 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-auto mb-2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <p className="text-gray-600">
                    損益計算書を表示するには、会計年度を選択してください。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center print:hidden">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            戻る
          </Link>
          <h2 className="text-lg font-bold">損益計算書</h2>
        </div>

        {/* 年度選択と操作ボタン */}
        <Card className="mb-6 print:hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会計年度
                </label>
                <Select value={fiscalYear} onValueChange={setFiscalYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="会計年度を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">未設定</SelectItem>
                    {fiscalYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 損益計算書 */}
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="print:pb-2">
            <div className="text-center">
              <CardTitle className="text-xl">損益計算書</CardTitle>
              <CardDescription>
                {fiscalYears.find((year) => year.id === fiscalYear)?.label ||
                  fiscalYear}{' '}
                通期（4月1日〜3月31日）
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-w-3xl mx-auto">
              <table className="w-full">
                <tbody>
                  {/* 売上高 */}
                  <tr className="border-b border-gray-100">
                    <td className="py-2">
                      {incomeStatementData.revenue[0].name}
                    </td>
                    <td className="py-2 text-right">
                      {formatCurrency(incomeStatementData.revenue[0].amount)}
                    </td>
                  </tr>

                  {/* 販売費及び一般管理費 */}
                  {incomeStatementData.expenses
                    .filter((item: any) => item.name === '販売費及び一般管理費')
                    .map((item: any, index: any) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2 text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}

                  {/* その他の収益 */}
                  {incomeStatementData.revenue
                    .slice(1)
                    .map((item: any, index: any) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td
                          className={`py-2 ${item.name === '受取利息' ? 'pl-6' : ''}`}
                        >
                          {item.name}
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}

                  {/* 経常利益 */}
                  <tr className="border-b border-gray-100">
                    <td className="py-2">経常利益</td>
                    <td className="py-2 text-right">
                      {formatCurrency(operatingIncome)}
                    </td>
                  </tr>

                  {/* 税引き前当期純利益 */}
                  <tr className="border-b border-gray-100">
                    <td className="py-2">税引き前当期純利益</td>
                    <td className="py-2 text-right">
                      {formatCurrency(operatingIncome)}
                    </td>
                  </tr>

                  {/* 税金 */}
                  {incomeStatementData.taxes.map((item: any, index: any) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2">{item.name}</td>
                      <td className="py-2 text-right">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}

                  {/* 当期純利益 */}
                  <tr className="border-b border-gray-100">
                    <td className="py-2">当期純利益</td>
                    <td className="py-2 text-right">
                      {formatCurrency(netIncome)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 利益率 */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-md print:bg-white print:border">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    売上高
                  </h4>
                  <p className="text-lg">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md print:bg-white print:border">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    経常利益率
                  </h4>
                  <p className="text-lg">
                    {((operatingIncome / totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md print:bg-white print:border">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    純利益率
                  </h4>
                  <p className="text-lg">
                    {((netIncome / totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
