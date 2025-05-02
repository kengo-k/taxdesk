"use client"

import { useState, useEffect } from "react"
import { BarChart3, BookOpen, Database, FileSpreadsheet, Scale, Calculator, Calendar } from "lucide-react"
import Link from "next/link"
import { DonutChart } from "@/components/donut-chart"
import { StackedBarChart } from "@/components/stacked-bar-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import {
  fetchFiscalYears,
  selectFiscalYear,
  selectAllFiscalYears,
  selectSelectedFiscalYearId,
  selectFiscalYearLoading,
  selectFiscalYearError,
} from "@/lib/redux/features/fiscalYearSlice"

// 税額シミュレーションデータの型定義
type TaxSimulationData = {
  yearData: {
    income: number
    expense: number
    profit: number
    taxEstimates: {
      corporateTax: number
      localCorporateTax: number
      totalCorporateTax: number
      prefecturalTax: number
      municipalTax: number
      corporateInhabitantTaxPerCapita: number
      totalInhabitantTax: number
      businessTax: number
      specialLocalCorporateTax: number
      totalBusinessTax: number
      consumptionTax: number
      localConsumptionTax: number
      totalConsumptionTax: number
      total: number
    }
    paymentSchedule: Array<{
      period: string
      dueDate: string
      taxType: string
      amount: number
      status: string
    }>
  }
  taxRates: {
    corporateTaxRate: number
    localCorporateTaxRate: number
    prefecturalTaxRate: number
    municipalTaxRate: number
    corporateInhabitantTaxPerCapita: number
    businessTaxRate: number
    specialLocalCorporateTaxRate: number
    consumptionTaxRate: number
    localConsumptionTaxRate: number
  }
}

export default function Home() {
  const dispatch = useAppDispatch()

  // Reduxから年度データを取得
  const fiscalYears = useAppSelector(selectAllFiscalYears)
  const selectedYearId = useAppSelector(selectSelectedFiscalYearId)
  const loading = useAppSelector(selectFiscalYearLoading)
  const error = useAppSelector(selectFiscalYearError)

  const [yearData, setYearData] = useState(null)
  const [taxSimulationData, setTaxSimulationData] = useState<TaxSimulationData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  // コンポーネントマウント時に年度一覧を取得
  useEffect(() => {
    dispatch(fetchFiscalYears())
  }, [dispatch])

  // APIからデータを取得
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedYearId) return // 年度が選択されていない場合は何もしない

      setDataLoading(true)
      setDataError(null)

      try {
        // 財務サマリーデータの取得
        const financialResponse = await fetch(`/api/reports/summary?year=${selectedYearId}`)
        if (!financialResponse.ok) {
          throw new Error(`財務データの取得に失敗しました: ${financialResponse.status}`)
        }
        const financialData = await financialResponse.json()
        setYearData(financialData)

        // 税額シミュレーションデータの取得
        const taxResponse = await fetch(`/api/reports/tax/${selectedYearId}`)
        if (!taxResponse.ok) {
          throw new Error(`税額データの取得に失敗しました: ${taxResponse.status}`)
        }
        const taxData = await taxResponse.json()
        setTaxSimulationData(taxData)
      } catch (error) {
        console.error("エラーが発生しました:", error)
        setDataError("データの取得中にエラーが発生しました")
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [selectedYearId])

  // 金額のフォーマット
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // 年度選択ハンドラー
  const handleYearChange = (value: string) => {
    dispatch(selectFiscalYear(value))
  }

  // データ読み込み中の表示
  if (loading || dataLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-full">
        <div className="text-center">
          <p className="text-lg mb-2">データを読み込み中...</p>
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  // エラー表示
  if (error || dataError) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-full">
        <div className="text-center">
          <p className="text-lg mb-2 text-red-500">{error || dataError}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            再読み込み
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 主要機能セクション（先に表示） */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">主要機能</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/ledger" className="block">
            <div className="bg-white rounded-lg p-6 shadow-sm border transition-all hover:shadow-md hover:border-blue-200 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center mr-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium">元帳</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                日々の取引を記録し、収入と支出を管理します。各取引の詳細情報も入力できます。
              </p>
            </div>
          </Link>

          <Link href="/balance-sheet" className="block">
            <div className="bg-white rounded-lg p-6 shadow-sm border transition-all hover:shadow-md hover:border-blue-200 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center mr-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium">貸借対照表</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                資産、負債、純資産の状況を確認し、財務状態を把握します。特定時点での財政状態を表示します。
              </p>
            </div>
          </Link>

          <Link href="/income-statement" className="block">
            <div className="bg-white rounded-lg p-6 shadow-sm border transition-all hover:shadow-md hover:border-green-200 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center mr-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-medium">損益計算書</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                指定期間の収益と費用を集計し、事業の収益性を分析します。月次・四半期・年次の報告書を生成できます。
              </p>
            </div>
          </Link>

          <Link href="/master" className="block">
            <div className="bg-white rounded-lg p-6 shadow-sm border transition-all hover:shadow-md hover:border-purple-200 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-md bg-purple-100 flex items-center justify-center mr-2">
                  <FileSpreadsheet className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium">マスタ管理</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                勘定科目・細目・消費税区分などのマスタデータを管理します。各種コードや設定を自由にカスタマイズできます。
              </p>
            </div>
          </Link>

          <Link href="/fiscal-year-transition" className="block">
            <div className="bg-white rounded-lg p-6 shadow-sm border transition-all hover:shadow-md hover:border-blue-200 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center mr-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium">年度移行</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                会計年度を切り替え、貸借対照表の残高を新年度に繰り越します。過去年度は読み取り専用になります。
              </p>
            </div>
          </Link>

          <Link href="/backup" className="block">
            <div className="bg-white rounded-lg p-6 shadow-sm border transition-all hover:shadow-md hover:border-amber-200 cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-md bg-amber-100 flex items-center justify-center mr-2">
                  <Database className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-medium">バックアップ設定</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                データのバックアップと復元を管理します。定期的なバックアップスケジュールを設定できます。
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 財務サマリーセクション（後に表示） */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">財務サマリー</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">年度：</span>
            <Select value={selectedYearId || ""} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="年度を選択" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.id}年度
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 税額見込みカード - 財務サマリーの一番上に移動 */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-lg">{selectedYearId === "2024" ? "税額見込み" : "確定税額"}</h3>
                <span className="font-bold text-lg">
                  {taxSimulationData ? formatCurrency(taxSimulationData.yearData.taxEstimates.total) : "Loading..."}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4 md:mb-0">
                {selectedYearId === "2024" ? "現在の収支に基づく年間税額見込み" : `${selectedYearId}年度の確定税額`}
              </p>
            </div>

            <div className="md:w-2/3 md:pl-6 md:border-l">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-md">
                  <div className="text-sm text-gray-600">{selectedYearId === "2024" ? "法人税" : "法人税（確定）"}</div>
                  <div className="font-medium">
                    {taxSimulationData
                      ? formatCurrency(taxSimulationData.yearData.taxEstimates.totalCorporateTax)
                      : "Loading..."}
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-md">
                  <div className="text-sm text-gray-600">{selectedYearId === "2024" ? "住民税" : "住民税（確定）"}</div>
                  <div className="font-medium">
                    {taxSimulationData
                      ? formatCurrency(taxSimulationData.yearData.taxEstimates.totalInhabitantTax)
                      : "Loading..."}
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-md">
                  <div className="text-sm text-gray-600">{selectedYearId === "2024" ? "事業税" : "事業税（確定）"}</div>
                  <div className="font-medium">
                    {taxSimulationData
                      ? formatCurrency(taxSimulationData.yearData.taxEstimates.totalBusinessTax)
                      : "Loading..."}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-md">
                  <div className="text-sm text-gray-600">{selectedYearId === "2024" ? "消費税" : "消費税（確定）"}</div>
                  <div className="font-medium">
                    {taxSimulationData
                      ? formatCurrency(taxSimulationData.yearData.taxEstimates.totalConsumptionTax)
                      : "Loading..."}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link href={`/tax-simulation?year=${selectedYearId}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Calculator className="h-4 w-4" />
                    {selectedYearId === "2024" ? "詳細シミュレーション" : "詳細表示"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <DonutChart
              title="現金残高"
              value={yearData ? formatCurrency(yearData.cashBalanceTotal) : "Loading..."}
              data={yearData ? yearData.cashBalanceData : []}
              labels={yearData ? yearData.cashBalanceLabels : []}
              colors={yearData ? yearData.cashBalanceColors : []}
              amounts={yearData ? yearData.cashBalanceAmounts : []}
            />
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <DonutChart
              title="本年度の収入"
              value={yearData ? formatCurrency(yearData.incomeTotal) : "Loading..."}
              data={yearData ? yearData.incomeData : []}
              labels={yearData ? yearData.incomeLabels : []}
              colors={yearData ? yearData.incomeColors : []}
              amounts={yearData ? yearData.incomeAmounts : []}
            />
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <DonutChart
              title="本年度の支出"
              value={yearData ? formatCurrency(yearData.expenseTotal) : "Loading..."}
              data={yearData ? yearData.expenseData : []}
              labels={yearData ? yearData.expenseLabels : []}
              colors={yearData ? yearData.expenseColors : []}
              amounts={yearData ? yearData.expenseAmounts : []}
            />
          </div>
        </div>

        {/* 月別収入グラフ */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <StackedBarChart
            title={`月別収入（${selectedYearId}年度）`}
            data={yearData ? yearData.monthlyIncomeData : []}
          />
        </div>

        {/* 月別支出グラフ */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <StackedBarChart
            title={`月別支出（${selectedYearId}年度）`}
            data={yearData ? yearData.monthlyExpenseData : []}
          />
        </div>
      </section>
    </div>
  )
}
