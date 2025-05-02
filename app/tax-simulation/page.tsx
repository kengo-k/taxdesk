"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Download, Calculator, HelpCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// 納付予定データの型定義
interface TaxPaymentSchedule {
  period: string
  dueDate: string
  taxType: string
  amount: number
  status: "upcoming" | "paid" | "overdue"
}

// 税額データの型定義
interface TaxEstimates {
  // 法人税関連
  corporateTax: number
  localCorporateTax: number
  totalCorporateTax: number

  // 住民税関連
  prefecturalTax: number
  municipalTax: number
  corporateInhabitantTaxPerCapita: number
  totalInhabitantTax: number

  // 事業税関連
  businessTax: number
  specialLocalCorporateTax: number
  totalBusinessTax: number

  // 消費税関連
  consumptionTax: number
  localConsumptionTax: number
  totalConsumptionTax: number

  // 合計
  total: number
}

// 税率設定の型定義
interface TaxRates {
  // 法人税関連
  corporateTaxRate: number
  localCorporateTaxRate: number

  // 住民税関連
  prefecturalTaxRate: number
  municipalTaxRate: number
  corporateInhabitantTaxPerCapita: number

  // 事業税関連
  businessTaxRate: number
  specialLocalCorporateTaxRate: number

  // 消費税
  consumptionTaxRate: number
  localConsumptionTaxRate: number
}

// 年度データの型定義
interface YearData {
  income: number
  expense: number
  profit: number
  taxEstimates: TaxEstimates
  paymentSchedule: TaxPaymentSchedule[]
}

// デフォルトの空の年度データ
const emptyYearData: YearData = {
  income: 0,
  expense: 0,
  profit: 0,
  taxEstimates: {
    corporateTax: 0,
    localCorporateTax: 0,
    totalCorporateTax: 0,
    prefecturalTax: 0,
    municipalTax: 0,
    corporateInhabitantTaxPerCapita: 0,
    totalInhabitantTax: 0,
    businessTax: 0,
    specialLocalCorporateTax: 0,
    totalBusinessTax: 0,
    consumptionTax: 0,
    localConsumptionTax: 0,
    totalConsumptionTax: 0,
    total: 0,
  },
  paymentSchedule: [],
}

// 納付予定データを生成する関数
function generatePaymentSchedule(
  year: number,
  corporateTax: number,
  localTax: number,
  businessTax: number,
  consumptionTax: number,
): TaxPaymentSchedule[] {
  const schedule: TaxPaymentSchedule[] = []
  const nextYear = year + 1

  // 法人税（確定申告と中間申告）
  schedule.push({
    period: `${year}年度確定申告`,
    dueDate: `${nextYear}/3/15`,
    taxType: "法人税",
    amount: corporateTax,
    status: year < 2024 ? "paid" : "upcoming",
  })

  // 中間申告（前年度の半額を納付）
  if (corporateTax > 100000) {
    schedule.push({
      period: `${year}年度中間申告`,
      dueDate: `${year}/9/15`,
      taxType: "法人税（中間）",
      amount: Math.floor(corporateTax / 2),
      status: year < 2024 ? "paid" : "upcoming",
    })
  }

  // 住民税（法人税確定申告後）
  schedule.push({
    period: `${year}年度確定申告`,
    dueDate: `${nextYear}/3/31`,
    taxType: "住民税",
    amount: localTax,
    status: year < 2024 ? "paid" : "upcoming",
  })

  // 事業税（法人税確定申告後）
  schedule.push({
    period: `${year}年度確定申告`,
    dueDate: `${nextYear}/3/31`,
    taxType: "事業税",
    amount: businessTax,
    status: year < 2024 ? "paid" : "upcoming",
  })

  // 消費税（確定申告）
  schedule.push({
    period: `${year}年度確定申告`,
    dueDate: `${nextYear}/3/31`,
    taxType: "消費税",
    amount: consumptionTax,
    status: year < 2024 ? "paid" : "upcoming",
  })

  // 消費税（中間申告）- 前年度の実績が一定以上の場合
  if (consumptionTax > 100000) {
    schedule.push({
      period: `${year}年度中間申告`,
      dueDate: `${year}/11/30`,
      taxType: "消費税（中間）",
      amount: Math.floor(consumptionTax / 2),
      status: year < 2024 ? "paid" : "upcoming",
    })
  }

  // 日付順にソート
  return schedule.sort((a, b) => {
    const dateA = new Date(a.dueDate.replace(/(\d+)\/(\d+)\/(\d+)/, "$1-$2-$3"))
    const dateB = new Date(b.dueDate.replace(/(\d+)\/(\d+)\/(\d+)/, "$1-$2-$3"))
    return dateA.getTime() - dateB.getTime()
  })
}

export default function TaxSimulationPage() {
  const searchParams = useSearchParams()
  const yearParam = searchParams.get("year") || "2024"

  // 状態管理
  const [selectedYear, setSelectedYear] = useState(yearParam)
  const [isSimulationMode, setIsSimulationMode] = useState(selectedYear === "2024")
  const [incomeAdjustment, setIncomeAdjustment] = useState(0)
  const [expenseAdjustment, setExpenseAdjustment] = useState(0)
  const [loading, setLoading] = useState(true)
  const [yearData, setYearData] = useState<Record<string, YearData>>({
    "2021": { ...emptyYearData },
    "2022": { ...emptyYearData },
    "2023": { ...emptyYearData },
    "2024": { ...emptyYearData },
    "2025": { ...emptyYearData },
  })
  const [taxRates, setTaxRates] = useState<TaxRates>({
    // 法人税関連
    corporateTaxRate: 23.2, // 基本税率
    localCorporateTaxRate: 10.3, // 地方法人税率

    // 住民税関連
    prefecturalTaxRate: 1.0, // 都道府県民税
    municipalTaxRate: 6.0, // 市町村民税
    corporateInhabitantTaxPerCapita: 70000, // 均等割額

    // 事業税関連
    businessTaxRate: 7.0, // 基本税率
    specialLocalCorporateTaxRate: 43.2, // 特別法人事業税率

    // 消費税
    consumptionTaxRate: 10.0, // 消費税率
    localConsumptionTaxRate: 2.2, // 地方消費税率
  })

  // Tooltipの状態を管理
  // const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  // APIからデータを取得する関数
  const fetchTaxData = useCallback(async (year: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports/tax/${year}`)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      // 取得したデータを状態に反映
      setYearData((prevData) => ({
        ...prevData,
        [year]: data.yearData,
      }))

      // 税率も更新
      setTaxRates(data.taxRates)
    } catch (error) {
      console.error("データの取得に失敗しました:", error)
      toast({
        title: "エラー",
        description: "税額データの取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // 年度が変更されたときにデータを取得
  useEffect(() => {
    fetchTaxData(selectedYear)
    setIsSimulationMode(selectedYear === "2024")
    setIncomeAdjustment(0)
    setExpenseAdjustment(0)
  }, [selectedYear, fetchTaxData])

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    fetchTaxData(selectedYear)
  }, [fetchTaxData, selectedYear])

  // 選択された年度のデータを取得
  const baseYearData = yearData[selectedYear] || emptyYearData

  // シミュレーション結果の計算
  const simulatedIncome = baseYearData.income + incomeAdjustment
  const simulatedExpense = baseYearData.expense + expenseAdjustment
  const simulatedProfit = simulatedIncome - simulatedExpense

  // 税額の再計算
  const simulatedTaxes = {
    // 法人税計算
    corporateTax: Math.round(simulatedProfit * (taxRates.corporateTaxRate / 100)),
    localCorporateTax: Math.round(
      Math.round(simulatedProfit * (taxRates.corporateTaxRate / 100)) * (taxRates.localCorporateTaxRate / 100),
    ),

    // 住民税計算
    prefecturalTax: Math.round(
      Math.round(simulatedProfit * (taxRates.corporateTaxRate / 100)) * (taxRates.prefecturalTaxRate / 100),
    ),
    municipalTax: Math.round(
      Math.round(simulatedProfit * (taxRates.corporateTaxRate / 100)) * (taxRates.municipalTaxRate / 100),
    ),
    corporateInhabitantTaxPerCapita: taxRates.corporateInhabitantTaxPerCapita,

    // 事業税計算
    businessTax: Math.round(simulatedProfit * (taxRates.businessTaxRate / 100)),
    specialLocalCorporateTax: Math.round(
      Math.round(simulatedProfit * (taxRates.businessTaxRate / 100)) * (taxRates.specialLocalCorporateTaxRate / 100),
    ),

    // 消費税計算
    consumptionTax: Math.round(simulatedIncome * (taxRates.consumptionTaxRate / 100)),
    localConsumptionTax: Math.round(simulatedIncome * (taxRates.localConsumptionTaxRate / 100)),

    // 合計
    get totalCorporateTax() {
      return this.corporateTax + this.localCorporateTax
    },
    get totalInhabitantTax() {
      return this.prefecturalTax + this.municipalTax + this.corporateInhabitantTaxPerCapita
    },
    get totalBusinessTax() {
      return this.businessTax + this.specialLocalCorporateTax
    },
    get totalConsumptionTax() {
      return this.consumptionTax + this.localConsumptionTax
    },
    get total() {
      return this.totalCorporateTax + this.totalInhabitantTax + this.totalBusinessTax + this.totalConsumptionTax
    },
  }

  // 表示する税額データ（シミュレーションモードかどうかで切り替え）
  const displayTaxData = isSimulationMode ? simulatedTaxes : baseYearData.taxEstimates

  // 金額のフォーマット
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // パーセントのフォーマット
  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  // PDFダウンロード処理
  const handleDownloadPDF = useCallback(() => {
    toast({
      title: "PDFをダウンロードしました",
      description: `${selectedYear}年度の税額シミュレーション結果をダウンロードしました。`,
    })
  }, [selectedYear])

  return (
    <div className="container mx-auto px-4 py-6">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            戻る
          </Link>
          <h2 className="text-lg font-bold">{selectedYear === "2024" ? "税額シミュレーション" : "確定税額詳細"}</h2>
        </div>

        {/* 年度選択と操作ボタン */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">会計年度</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="会計年度を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2021">2021年度</SelectItem>
                      <SelectItem value="2022">2022年度</SelectItem>
                      <SelectItem value="2023">2023年度</SelectItem>
                      <SelectItem value="2024">2024年度</SelectItem>
                      <SelectItem value="2025">2025年度</SelectItem>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedYear}年度 {selectedYear === "2024" ? "税額見込み" : "確定税額"}
              </CardTitle>
              <CardDescription>
                {selectedYear === "2024" ? "現在の収支に基づく年間税額見込み" : `${selectedYear}年度の確定税額`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm text-gray-600 flex items-center">
                      法人税関連
                      <TooltipProvider>
                        <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              法人税と地方法人税の合計です。
                              <br />
                              法人税率: {taxRates.corporateTaxRate}%
                              <br />
                              地方法人税率: {taxRates.localCorporateTaxRate}%
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <p className="text-xl font-bold mt-1">{formatCurrency(displayTaxData.totalCorporateTax)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="text-sm text-gray-600 flex items-center">
                      住民税関連
                      <TooltipProvider>
                        <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              都道府県民税、市町村民税、均等割の合計です。
                              <br />
                              都道府県民税率: {taxRates.prefecturalTaxRate}%
                              <br />
                              市町村民税率: {taxRates.municipalTaxRate}%
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <p className="text-xl font-bold mt-1">{formatCurrency(displayTaxData.totalInhabitantTax)}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h3 className="text-sm text-gray-600 flex items-center">
                      事業税関連
                      <TooltipProvider>
                        <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              法人事業税と特別法人事業税の合計です。
                              <br />
                              法人事業税率: {taxRates.businessTaxRate}%
                              <br />
                              特別法人事業税率: {taxRates.specialLocalCorporateTaxRate}%
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <p className="text-xl font-bold mt-1">{formatCurrency(displayTaxData.totalBusinessTax)}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-sm text-gray-600 flex items-center">
                      消費税関連
                      <TooltipProvider>
                        <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              消費税と地方消費税の合計です。
                              <br />
                              消費税率: {taxRates.consumptionTaxRate}%
                              <br />
                              地方消費税率: {taxRates.localConsumptionTaxRate}%
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <p className="text-xl font-bold mt-1">{formatCurrency(displayTaxData.totalConsumptionTax)}</p>
                  </div>
                </div>
              )}

              <div className="p-6 bg-gray-50 rounded-lg border flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">合計税額</h3>
                  <p className="text-sm text-gray-500">{selectedYear}年度の総税額</p>
                </div>
                <div className="text-3xl font-bold text-blue-600 mt-4 md:mt-0">
                  {formatCurrency(displayTaxData.total)}
                </div>
              </div>

              {/* 税額計算の詳細 */}
              {!loading && (
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
                          {/* 基本情報 */}
                          <div>
                            <h4 className="font-medium mb-2">基本情報</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">収入</p>
                                <p className="font-medium">{formatCurrency(baseYearData.income)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">支出</p>
                                <p className="font-medium">{formatCurrency(baseYearData.expense)}</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">課税所得</p>
                              <p className="font-medium">{formatCurrency(baseYearData.profit)}</p>
                              <p className="text-xs text-gray-500 mt-1">※課税所得 = 収入 - 支出</p>
                            </div>
                          </div>

                          {/* 法人税計算 */}
                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2">法人税計算</h4>
                            <div className="bg-white p-3 rounded border mb-2">
                              <p className="text-sm font-medium">法人税（国税）</p>
                              <p className="text-sm mt-1">
                                課税所得 {formatCurrency(baseYearData.profit)} × 税率{" "}
                                {formatPercent(taxRates.corporateTaxRate)} ={" "}
                                {formatCurrency(displayTaxData.corporateTax)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">※課税所得をベースに計算</p>
                            </div>

                            <div className="bg-white p-3 rounded border mb-2">
                              <p className="text-sm font-medium">地方法人税（国税）</p>
                              <p className="text-sm mt-1">
                                法人税額 {formatCurrency(displayTaxData.corporateTax)} × 税率{" "}
                                {formatPercent(taxRates.localCorporateTaxRate)} ={" "}
                                {formatCurrency(displayTaxData.localCorporateTax)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">※法人税額をベースに計算</p>
                            </div>

                            <div className="bg-blue-50 p-3 rounded border">
                              <p className="text-sm font-medium">法人税合計</p>
                              <p className="text-sm mt-1">
                                法人税 {formatCurrency(displayTaxData.corporateTax)} + 地方法人税{" "}
                                {formatCurrency(displayTaxData.localCorporateTax)} ={" "}
                                {formatCurrency(displayTaxData.totalCorporateTax)}
                              </p>
                            </div>
                          </div>

                          {/* 住民税計算 */}
                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2">住民税計算</h4>
                            <div className="bg-white p-3 rounded border mb-2">
                              <p className="text-sm font-medium">都道府県民税（法人税割）</p>
                              <p className="text-sm mt-1">
                                法人税額 {formatCurrency(displayTaxData.corporateTax)} × 税率{" "}
                                {formatPercent(taxRates.prefecturalTaxRate)} ={" "}
                                {formatCurrency(displayTaxData.prefecturalTax)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">※法人税額をベースに計算</p>
                            </div>

                            <div className="bg-white p-3 rounded border mb-2">
                              <p className="text-sm font-medium">市町村民税（法人税割）</p>
                              <p className="text-sm mt-1">
                                法人税額 {formatCurrency(displayTaxData.corporateTax)} × 税率{" "}
                                {formatPercent(taxRates.municipalTaxRate)} ={" "}
                                {formatCurrency(displayTaxData.municipalTax)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">※法人税額をベースに計算</p>
                            </div>

                            <div className="bg-white p-3 rounded border mb-2">
                              <p className="text-sm font-medium">均等割</p>
                              <p className="text-sm mt-1">
                                定額 = {formatCurrency(displayTaxData.corporateInhabitantTaxPerCapita)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">※資本金等の額と従業員数に応じた定額</p>
                            </div>

                            <div className="bg-green-50 p-3 rounded border">
                              <p className="text-sm font-medium">住民税合計</p>
                              <p className="text-sm mt-1">
                                都道府県民税 {formatCurrency(displayTaxData.prefecturalTax)} + 市町村民税{" "}
                                {formatCurrency(displayTaxData.municipalTax)} + 均等割{" "}
                                {formatCurrency(displayTaxData.corporateInhabitantTaxPerCapita)} ={" "}
                                {formatCurrency(displayTaxData.totalInhabitantTax)}
                              </p>
                            </div>
                          </div>

                          {/* 事業税計算 */}
                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2">事業税計算</h4>
                            <div className="bg-white p-3 rounded border mb-2">
                              <p className="text-sm font-medium">法人事業税</p>
                              <p className="text-sm mt-1">
                                課税所得 {formatCurrency(baseYearData.profit)} × 税率{" "}
                                {formatPercent(taxRates.businessTaxRate)} = {formatCurrency(displayTaxData.businessTax)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">※課税所得をベースに計算</p>
                            </div>

                            <div className="bg-white p-3 rounded border mb-2">
                              <p className="text-sm font-medium">特別法人事業税</p>
                              <p className="text-sm mt-1">
                                法人事業税額 {formatCurrency(displayTaxData.businessTax)} × 税率{" "}
                                {formatPercent(taxRates.specialLocalCorporateTaxRate)} ={" "}
                                {formatCurrency(displayTaxData.specialLocalCorporateTax)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">※法人事業税額をベースに計算</p>
                            </div>

                            <div className="bg-amber-50 p-3 rounded border">
                              <p className="text-sm font-medium">事業税合計</p>
                              <p className="text-sm mt-1">
                                法人事業税 {formatCurrency(displayTaxData.businessTax)} + 特別法人事業税{" "}
                                {formatCurrency(displayTaxData.specialLocalCorporateTax)} ={" "}
                                {formatCurrency(displayTaxData.totalBusinessTax)}
                              </p>
                            </div>
                          </div>

                          {/* 消費税計算 */}
                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2">消費税計算</h4>
                            <div className="bg-white p-3 rounded border mb-2">
                              <p className="text-sm font-medium">消費税（国税）</p>
                              <p className="text-sm mt-1">
                                課税売上 {formatCurrency(baseYearData.income)} × 税率{" "}
                                {formatPercent(taxRates.consumptionTaxRate)} ={" "}
                                {formatCurrency(displayTaxData.consumptionTax)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">※簡易計算方式（課税売上高をベースに計算）</p>
                            </div>

                            <div className="bg-white p-3 rounded border mb-2">
                              <p className="text-sm font-medium">地方消費税</p>
                              <p className="text-sm mt-1">
                                課税売上 {formatCurrency(baseYearData.income)} × 税率{" "}
                                {formatPercent(taxRates.localConsumptionTaxRate)} ={" "}
                                {formatCurrency(displayTaxData.localConsumptionTax)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">※消費税額の22/78相当額</p>
                            </div>

                            <div className="bg-purple-50 p-3 rounded border">
                              <p className="text-sm font-medium">消費税合計</p>
                              <p className="text-sm mt-1">
                                消費税 {formatCurrency(displayTaxData.consumptionTax)} + 地方消費税{" "}
                                {formatCurrency(displayTaxData.localConsumptionTax)} ={" "}
                                {formatCurrency(displayTaxData.totalConsumptionTax)}
                              </p>
                            </div>
                          </div>

                          {/* 総合計 */}
                          <div className="pt-4 border-t">
                            <div className="bg-blue-100 p-4 rounded border">
                              <p className="font-medium">税金総合計</p>
                              <p className="mt-1">
                                法人税合計 {formatCurrency(displayTaxData.totalCorporateTax)} + 住民税合計{" "}
                                {formatCurrency(displayTaxData.totalInhabitantTax)} + 事業税合計{" "}
                                {formatCurrency(displayTaxData.totalBusinessTax)} + 消費税合計{" "}
                                {formatCurrency(displayTaxData.totalConsumptionTax)} ={" "}
                                {formatCurrency(displayTaxData.total)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </CardContent>
          </Card>

          {/* シミュレーションパネル - 2024年度のみ表示 */}
          {selectedYear === "2024" && (
            <Card>
              <CardHeader>
                <CardTitle>シミュレーション</CardTitle>
                <CardDescription>収入や支出を調整して税額の変化をシミュレーション</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">収入調整</label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[incomeAdjustment]}
                          onValueChange={(values) => setIncomeAdjustment(values[0])}
                          min={-1000000}
                          max={1000000}
                          step={10000}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={incomeAdjustment}
                          onChange={(e) => setIncomeAdjustment(Number(e.target.value))}
                          className="w-24"
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">-100万円</span>
                        <span className="text-xs text-gray-500">+100万円</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">支出調整</label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[expenseAdjustment]}
                          onValueChange={(values) => setExpenseAdjustment(values[0])}
                          min={-1000000}
                          max={1000000}
                          step={10000}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={expenseAdjustment}
                          onChange={(e) => setExpenseAdjustment(Number(e.target.value))}
                          className="w-24"
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">-100万円</span>
                        <span className="text-xs text-gray-500">+100万円</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">調整後収入:</span>
                        <span className="font-medium">{formatCurrency(simulatedIncome)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">調整後支出:</span>
                        <span className="font-medium">{formatCurrency(simulatedExpense)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">調整後利益:</span>
                        <span className="font-medium">{formatCurrency(simulatedProfit)}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">調整前税額:</span>
                        <span className="font-medium">{formatCurrency(baseYearData.taxEstimates.total)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">調整後税額:</span>
                        <span className="font-medium">{formatCurrency(simulatedTaxes.total)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm font-medium">税額差異:</span>
                        <span
                          className={`font-medium ${simulatedTaxes.total > baseYearData.taxEstimates.total ? "text-red-600" : "text-green-600"}`}
                        >
                          {formatCurrency(simulatedTaxes.total - baseYearData.taxEstimates.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
