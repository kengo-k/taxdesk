'use client'

import { useEffect, useState } from 'react'

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
  fetchFiscalYears,
  selectAllFiscalYears,
  selectFiscalYearLoading,
} from '@/lib/redux/features/fiscalYearSlice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'

export default function IncomeStatementPage() {
  // Redux
  const dispatch = useAppDispatch()
  const fiscalYears = useAppSelector(selectAllFiscalYears)
  const fiscalYearsLoading = useAppSelector(selectFiscalYearLoading)

  // 年度選択の状態
  const [fiscalYear, setFiscalYear] = useState('none')
  const [incomeStatementData, setIncomeStatementData] = useState({
    revenue: [
      { name: '売上高', amount: 10000000 },
      { name: '受取利息', amount: 50000 },
      { name: '雑収入', amount: 100000 },
    ],
    expenses: [
      { name: '売上原価', amount: 6000000 },
      { name: '販売費及び一般管理費', amount: 2500000 },
      { name: '人件費', amount: 1500000 },
      { name: '地代家賃', amount: 500000 },
      { name: '水道光熱費', amount: 200000 },
      { name: '通信費', amount: 100000 },
      { name: '旅費交通費', amount: 150000 },
    ],
    taxes: [
      { name: '法人税等', amount: 500000 },
      { name: '住民税', amount: 100000 },
    ],
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
              {/* 収益の部 */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2 border-b pb-1">
                  収益の部
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm">
                      <th className="pb-2 font-medium">科目</th>
                      <th className="pb-2 font-medium text-right">金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeStatementData.revenue.map(
                      (item: any, index: any) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2 text-right">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ),
                    )}
                    <tr className="font-bold">
                      <td className="py-2">収益合計</td>
                      <td className="py-2 text-right">
                        {formatCurrency(totalRevenue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 費用の部 */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2 border-b pb-1">
                  費用の部
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm">
                      <th className="pb-2 font-medium">科目</th>
                      <th className="pb-2 font-medium text-right">金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeStatementData.expenses.map(
                      (item: any, index: any) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2 text-right">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ),
                    )}
                    <tr className="font-bold">
                      <td className="py-2">費用合計</td>
                      <td className="py-2 text-right">
                        {formatCurrency(totalExpenses)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 営業利益 */}
              <div className="mb-6 p-3 bg-blue-50 rounded-md print:bg-white print:border print:border-blue-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">営業利益</h3>
                  <p className="font-bold text-lg">
                    {formatCurrency(operatingIncome)}
                  </p>
                </div>
              </div>

              {/* 税金 */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2 border-b pb-1">税金</h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm">
                      <th className="pb-2 font-medium">科目</th>
                      <th className="pb-2 font-medium text-right">金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeStatementData.taxes.map((item: any, index: any) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2 text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="py-2">税金合計</td>
                      <td className="py-2 text-right">
                        {formatCurrency(totalTaxes)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 当期純利益 */}
              <div className="p-4 bg-green-50 rounded-md print:bg-white print:border print:border-green-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">当期純利益</h3>
                  <p className="font-bold text-xl">
                    {formatCurrency(netIncome)}
                  </p>
                </div>
              </div>

              {/* 利益率 */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-md print:bg-white print:border">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    売上高
                  </h4>
                  <p className="font-bold text-lg">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md print:bg-white print:border">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    営業利益率
                  </h4>
                  <p className="font-bold text-lg">
                    {((operatingIncome / totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md print:bg-white print:border">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    純利益率
                  </h4>
                  <p className="font-bold text-lg">
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
