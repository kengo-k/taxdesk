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

export default function BalanceSheetPage() {
  // Redux
  const dispatch = useAppDispatch()
  const fiscalYears = useAppSelector(selectAllFiscalYears)
  const fiscalYearsLoading = useAppSelector(selectFiscalYearLoading)
  const taxCalculationParameters = useAppSelector(
    selectTaxCalculationParameters,
  )

  // 期間選択の状態
  const [fiscalYear, setFiscalYear] = useState('none')
  const [balanceSheetData, setBalanceSheetData] = useState({
    assets: [] as { name: string; amount: number }[],
    liabilities: [] as { name: string; amount: number }[],
    equity: [] as { name: string; amount: number }[],
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
    if (taxCalculation && taxCalculationParameters.length > 0) {
      const taxes = taxCalculation.getResult()
      const totalAmount = taxes[taxes.length - 1].taxAmount
      setBalanceSheetData((prev) => ({
        ...prev,
        assets: taxCalculationParameters[1].response.flatMap((item) => {
          if (item.custom_fields?.category === 'deductible_from_tax') {
            return []
          }
          if (item.value === 0) {
            return []
          }
          return [{ name: item.name, amount: item.value }]
        }),
        liabilities: taxCalculationParameters[5].response.flatMap((item) => {
          if (item.value === 0) {
            return []
          }
          return [{ name: item.name, amount: item.value }]
        }),
        equity: prev.equity.map((item) => {
          if (item.name === '利益剰余金') {
            return {
              ...item,
              amount:
                taxCalculationParameters[0].response.reduce((acc, item) => {
                  if (item.custom_fields?.category === 'business_revenue') {
                    return acc + item.value
                  }
                  return acc
                }, 0) - totalAmount,
            }
          }
          return item
        }),
      }))
    }
  }, [taxCalculation, taxCalculationParameters])

  // 合計金額の計算
  const totalAssets = balanceSheetData.assets.reduce(
    (sum, item) => sum + item.amount,
    0,
  )
  const totalLiabilities = balanceSheetData.liabilities.reduce(
    (sum, item) => sum + item.amount,
    0,
  )
  const totalEquity = balanceSheetData.equity.reduce(
    (sum, item) => sum + item.amount,
    0,
  )
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity

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

  // エラー発生時の表示
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
            <h2 className="text-lg font-bold">貸借対照表</h2>
          </div>
          <Card className="text-center p-8">
            <div className="text-red-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-xl font-bold mt-2">エラーが発生しました</h3>
              <p className="mt-2">{error}</p>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={() => window.location.reload()}>
                再読み込み
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">ホームに戻る</Link>
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  // データがnullの場合、または年度が未選択の場合
  if (!balanceSheetData || fiscalYear === 'none') {
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
            <h2 className="text-lg font-bold">貸借対照表</h2>
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
                    貸借対照表を表示するには、会計年度を選択してください。
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
          <h2 className="text-lg font-bold">貸借対照表</h2>
        </div>

        {/* 期間選択と操作ボタン */}
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

        {/* 貸借対照表 */}
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="print:pb-2">
            <div className="text-center">
              <CardTitle className="text-xl">貸借対照表</CardTitle>
              <CardDescription>
                {fiscalYears.find((year) => year.id === fiscalYear)?.label ||
                  fiscalYear}{' '}
                3月末日現在
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
              {/* 資産の部 */}
              <div>
                <h3 className="font-bold text-lg mb-2 border-b pb-1">
                  資産の部
                </h3>
                <div className="space-y-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm">
                        <th className="pb-2"></th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceSheetData.assets.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2 text-right">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="py-2">資産合計</td>
                        <td className="py-2 text-right">
                          {formatCurrency(totalAssets)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 負債・純資産の部 */}
              <div>
                <h3 className="font-bold text-lg mb-2 border-b pb-1">
                  負債の部
                </h3>
                <div className="space-y-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm">
                        <th className="pb-2"></th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceSheetData.liabilities.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2 text-right">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="py-2">負債合計</td>
                        <td className="py-2 text-right">
                          {formatCurrency(totalLiabilities)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <h3 className="font-bold text-lg mb-2 border-b pb-1 mt-6">
                    純資産の部
                  </h3>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm">
                        <th className="pb-2"></th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceSheetData.equity.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2 text-right">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="py-2">純資産合計</td>
                        <td className="py-2 text-right">
                          {formatCurrency(totalEquity)}
                        </td>
                      </tr>
                      <tr className="font-bold">
                        <td className="py-2">負債・純資産合計</td>
                        <td className="py-2 text-right">
                          {formatCurrency(totalLiabilitiesAndEquity)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
