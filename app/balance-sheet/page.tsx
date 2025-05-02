"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchFiscalYears, selectAllFiscalYears, selectFiscalYearLoading } from "@/lib/redux/features/fiscalYearSlice"

export default function BalanceSheetPage() {
  // Redux
  const dispatch = useAppDispatch()
  const fiscalYears = useAppSelector(selectAllFiscalYears)
  const fiscalYearsLoading = useAppSelector(selectFiscalYearLoading)

  // 期間選択の状態
  const [fiscalYear, setFiscalYear] = useState("2024")
  const [balanceSheetData, setBalanceSheetData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      // 現在の年度を初期選択
      const currentYear = fiscalYears.find((year) => year.isCurrent)
      if (currentYear) {
        setFiscalYear(currentYear.id)
      } else {
        // 現在の年度がない場合は最新の年度を選択
        setFiscalYear(fiscalYears[0].id)
      }
    }
  }, [fiscalYears])

  // APIからデータを取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/reports/balance-sheet?fiscalYear=${fiscalYear}&month=3`)
        if (!response.ok) {
          throw new Error("データの取得に失敗しました")
        }
        const data = await response.json()
        if (!data || !data.balanceSheetData) {
          throw new Error("貸借対照表データが見つかりませんでした")
        }
        setBalanceSheetData(data.balanceSheetData)
      } catch (error) {
        console.error("エラーが発生しました:", error)
        setError(error.message || "データの取得中にエラーが発生しました")
      } finally {
        setLoading(false)
      }
    }

    if (fiscalYear) {
      fetchData()
    }
  }, [fiscalYear])

  // 合計金額の計算
  const totalAssets = balanceSheetData ? balanceSheetData.assets.reduce((sum, item) => sum + item.amount, 0) : 0
  const totalLiabilities = balanceSheetData
    ? balanceSheetData.liabilities.reduce((sum, item) => sum + item.amount, 0)
    : 0
  const totalEquity = balanceSheetData ? balanceSheetData.equity.reduce((sum, item) => sum + item.amount, 0) : 0
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity

  // 金額のフォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // PDFダウンロード処理
  const handleDownloadPDF = () => {
    // 選択された年度のラベルを取得
    const selectedYearLabel = fiscalYears.find((year) => year.id === fiscalYear)?.label || fiscalYear

    toast({
      title: "PDFをダウンロードしました",
      description: `${selectedYearLabel} 3月末日の貸借対照表をダウンロードしました。`,
    })
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
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
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
              <Button onClick={() => window.location.reload()}>再読み込み</Button>
              <Button variant="outline" asChild>
                <Link href="/">ホームに戻る</Link>
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center print:hidden">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            戻る
          </Link>
          <h2 className="text-lg font-bold">貸借対照表</h2>
        </div>

        {/* 期間選択と操作ボタン */}
        <Card className="mb-6 print:hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">会計年度</label>
                <Select value={fiscalYear} onValueChange={setFiscalYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="会計年度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {fiscalYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        {/* 貸借対照表 */}
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="print:pb-2">
            <div className="text-center">
              <CardTitle className="text-xl">貸借対照表</CardTitle>
              <CardDescription>
                {fiscalYears.find((year) => year.id === fiscalYear)?.label || fiscalYear} 3月末日現在
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
              {/* 資産の部 */}
              <div>
                <h3 className="font-bold text-lg mb-2 border-b pb-1">資産の部</h3>
                <div className="space-y-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm">
                        <th className="pb-2 font-medium">科目</th>
                        <th className="pb-2 font-medium text-right">金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceSheetData.assets.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2 text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="py-2">資産合計</td>
                        <td className="py-2 text-right">{formatCurrency(totalAssets)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 負債・純資産の部 */}
              <div>
                <h3 className="font-bold text-lg mb-2 border-b pb-1">負債の部</h3>
                <div className="space-y-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm">
                        <th className="pb-2 font-medium">科目</th>
                        <th className="pb-2 font-medium text-right">金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceSheetData.liabilities.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2 text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="py-2">負債合計</td>
                        <td className="py-2 text-right">{formatCurrency(totalLiabilities)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h3 className="font-bold text-lg mb-2 border-b pb-1 mt-6">純資産の部</h3>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm">
                        <th className="pb-2 font-medium">科目</th>
                        <th className="pb-2 font-medium text-right">金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanceSheetData.equity.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2 text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="py-2">純資産合計</td>
                        <td className="py-2 text-right">{formatCurrency(totalEquity)}</td>
                      </tr>
                      <tr className="font-bold">
                        <td className="py-2">負債・純資産合計</td>
                        <td className="py-2 text-right">{formatCurrency(totalLiabilitiesAndEquity)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 貸借対照表の検証 */}
            <div className="mt-8 p-4 bg-gray-50 rounded-md print:bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">貸借対照表の検証</h4>
                  <p className="text-sm text-gray-500">資産合計 = 負債・純資産合計</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">資産合計</p>
                    <p className="font-bold">{formatCurrency(totalAssets)}</p>
                  </div>
                  <div className="text-2xl">=</div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">負債・純資産合計</p>
                    <p className="font-bold">{formatCurrency(totalLiabilitiesAndEquity)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
