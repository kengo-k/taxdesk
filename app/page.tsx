'use client'

import * as React from 'react'
import { useEffect, useMemo } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import {
  BarChart3,
  BookOpen,
  Calculator,
  Calendar,
  Database,
  FileSpreadsheet,
  Grid,
  Receipt,
  Scale,
  Wallet,
} from 'lucide-react'

import { DonutChart } from '@/components/donut-chart'
import { StackedBarChart } from '@/components/stacked-bar-chart'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { calculateTax, formatCurrency } from '@/lib/client/tax-calculation/calc'
import { buildTaxParameters } from '@/lib/client/tax-calculation/parameters'
import { getSteps } from '@/lib/client/tax-calculation/steps'
import { getChartColors } from '@/lib/client/utils/chart-colors'
import {
  fetchFiscalYears,
  selectFiscalYears,
  selectFiscalYearsLoading,
  selectSelectedFiscalYear,
  setSelectedFiscalYear,
} from '@/lib/redux/features/masterSlice'
import {
  clearData,
  fetchDashboardData,
  fetchTaxCalculationParameters,
  selectSaimokuNetAssetsByYear,
  selectSaimokuNetAssetsByYearLoading,
  selectSaimokuNetExpensesByMonth,
  selectSaimokuNetExpensesByMonthLoading,
  selectSaimokuNetExpensesByYear,
  selectSaimokuNetExpensesByYearLoading,
  selectSaimokuNetRevenuesByMonth,
  selectSaimokuNetRevenuesByMonthLoading,
  selectSaimokuNetRevenuesByYear,
  selectSaimokuNetRevenuesByYearLoading,
  selectTaxCalculationParameters,
} from '@/lib/redux/features/reportSlice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'

const FISCAL_YEAR_MONTHS = [
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
  '1月',
  '2月',
  '3月',
]

interface ChartData {
  value: string
  data: number[]
  labels: string[]
  colors: string[]
  amounts: number[]
}

interface MonthlyData {
  name: string
  values: Array<{ month: string; value: number }>
}

interface ChartDataset {
  label: string
  name: string
  data: number[]
  backgroundColor: string
}

function calculateChartData(
  isLoading: boolean,
  data: Array<{ value?: number; name?: string }> | null | undefined,
  colorType: 'asset' | 'income' | 'expense',
): ChartData {
  if (isLoading || !data) {
    return {
      value: '',
      data: [],
      labels: [],
      colors: [],
      amounts: [],
    }
  }

  const values = data.map((item) => item.value || 0)
  const labels = data.map((item) => item.name || '')
  const colors = getChartColors(colorType, data.length)
  const totalValue = values.reduce((sum, value) => sum + value, 0)

  return {
    value: formatCurrency(totalValue),
    data: values,
    labels,
    colors,
    amounts: values,
  }
}

function calculateMonthlyChartData(
  isLoading: boolean,
  data: MonthlyData[] | null | undefined,
  colorType: 'income' | 'expense',
): { labels: string[]; datasets: ChartDataset[] } {
  if (isLoading || !data?.length) {
    return { labels: [], datasets: [] }
  }

  return {
    labels: FISCAL_YEAR_MONTHS,
    datasets: data.map((item, index) => {
      const monthlyData = item.values
      const monthlyName = item.name || ''

      const values = new Array(12).fill(0)
      monthlyData.forEach((monthItem) => {
        const monthIndex = (parseInt(monthItem.month) + 8) % 12
        values[monthIndex] = monthItem.value
      })

      return {
        label: monthlyName,
        name: monthlyName,
        data: values,
        backgroundColor: getChartColors(colorType, data.length)[index],
      }
    }),
  }
}

export default function Home() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedFiscalYear = useAppSelector(selectSelectedFiscalYear)
  const fiscalYears = useAppSelector(selectFiscalYears)
  const fiscalYearsLoading = useAppSelector(selectFiscalYearsLoading)

  const expenseByMonth = useAppSelector(selectSaimokuNetExpensesByMonth)
  const expenseByMonthLoading = useAppSelector(
    selectSaimokuNetExpensesByMonthLoading,
  )
  const expenseByYear = useAppSelector(selectSaimokuNetExpensesByYear)
  const expenseByYearLoading = useAppSelector(
    selectSaimokuNetExpensesByYearLoading,
  )

  const assetByYear = useAppSelector(selectSaimokuNetAssetsByYear)
  const assetByYearLoading = useAppSelector(selectSaimokuNetAssetsByYearLoading)

  const revenueByMonth = useAppSelector(selectSaimokuNetRevenuesByMonth)
  const revenueByMonthLoading = useAppSelector(
    selectSaimokuNetRevenuesByMonthLoading,
  )
  const revenueByYear = useAppSelector(selectSaimokuNetRevenuesByYear)
  const revenueByYearLoading = useAppSelector(
    selectSaimokuNetRevenuesByYearLoading,
  )

  const taxCalculationParameters = useAppSelector(
    selectTaxCalculationParameters,
  )

  const taxCalculation = useMemo(() => {
    if (selectedFiscalYear === 'none') {
      return null
    }
    try {
      const parameters = buildTaxParameters(
        taxCalculationParameters,
        selectedFiscalYear,
      )
      const steps = getSteps(selectedFiscalYear)
      return calculateTax(steps, parameters)
    } catch (error) {
      return null
    }
  }, [selectedFiscalYear, taxCalculationParameters])

  const assetChartData = useMemo(
    () => calculateChartData(assetByYearLoading, assetByYear, 'asset'),
    [assetByYearLoading, assetByYear],
  )

  const revenueChartData = useMemo(
    () => calculateChartData(revenueByYearLoading, revenueByYear, 'income'),
    [revenueByYearLoading, revenueByYear],
  )

  const expenseChartData = useMemo(
    () => calculateChartData(expenseByYearLoading, expenseByYear, 'expense'),
    [expenseByYearLoading, expenseByYear],
  )

  const monthlyRevenueData = useMemo(
    () =>
      calculateMonthlyChartData(
        revenueByMonthLoading,
        revenueByMonth,
        'income',
      ),
    [revenueByMonthLoading, revenueByMonth],
  )

  const monthlyExpenseData = useMemo(
    () =>
      calculateMonthlyChartData(
        expenseByMonthLoading,
        expenseByMonth,
        'expense',
      ),
    [expenseByMonthLoading, expenseByMonth],
  )

  const handleYearChange = (value: string) => {
    dispatch(setSelectedFiscalYear(value))
    if (value === 'none') {
      router.replace('/')
    } else {
      router.replace(`/?fiscal_year=${value}`)
    }
  }

  useEffect(() => {
    dispatch(fetchFiscalYears())
  }, [dispatch])

  useEffect(() => {
    const yearParam = searchParams.get('fiscal_year')
    if (yearParam && fiscalYears.some((year) => year.id === yearParam)) {
      dispatch(setSelectedFiscalYear(yearParam))
    }
  }, [dispatch, searchParams, fiscalYears])

  useEffect(() => {
    if (selectedFiscalYear && selectedFiscalYear !== 'none') {
      dispatch(fetchDashboardData(selectedFiscalYear))
      dispatch(fetchTaxCalculationParameters(selectedFiscalYear))
    } else {
      dispatch(clearData())
    }
  }, [dispatch, selectedFiscalYear])

  const isChartDataLoading = useMemo(() => {
    if (selectedFiscalYear === 'none') return false
    return (
      assetByYearLoading ||
      revenueByYearLoading ||
      expenseByYearLoading ||
      revenueByMonthLoading ||
      expenseByMonthLoading
    )
  }, [
    selectedFiscalYear,
    assetByYearLoading,
    revenueByYearLoading,
    expenseByYearLoading,
    revenueByMonthLoading,
    expenseByMonthLoading,
  ])

  return (
    <div className="container mx-auto px-4 py-6">
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">主要機能</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">年度：</span>
            <Select
              value={selectedFiscalYear || 'none'}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="年度を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">未設定</SelectItem>
                {fiscalYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.id}年度
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="accounting" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounting">会計管理</TabsTrigger>
            <TabsTrigger value="business">業務管理</TabsTrigger>
            <TabsTrigger value="system">システム管理</TabsTrigger>
          </TabsList>

          <TabsContent value="accounting" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
              <FeatureCard
                href={
                  selectedFiscalYear !== 'none'
                    ? `/ledger?fiscal_year=${selectedFiscalYear}`
                    : '/ledger'
                }
                icon={BookOpen}
                title="元帳"
                description=""
                iconBgColor="blue-100"
                iconColor="blue-600"
                hoverBorderColor="blue-200"
              />

              <FeatureCard
                href="#"
                icon={FileSpreadsheet}
                title="仕訳帳"
                description=""
                iconBgColor="purple-100"
                iconColor="purple-600"
                hoverBorderColor="purple-200"
              />

              <FeatureCard
                href={
                  selectedFiscalYear !== 'none'
                    ? `/balance-sheet?fiscal_year=${selectedFiscalYear}`
                    : '/balance-sheet'
                }
                icon={Scale}
                title="貸借対照表"
                description=""
                iconBgColor="green-100"
                iconColor="green-600"
                hoverBorderColor="green-200"
              />

              <FeatureCard
                href={
                  selectedFiscalYear !== 'none'
                    ? `/income-statement?fiscal_year=${selectedFiscalYear}`
                    : '/income-statement'
                }
                icon={BarChart3}
                title="損益計算書"
                description=""
                iconBgColor="gray-100"
                iconColor="gray-600"
                hoverBorderColor="gray-200"
              />

              <FeatureCard
                href="#"
                icon={Grid}
                title="財務諸表一覧"
                description=""
                iconBgColor="red-100"
                iconColor="red-600"
                hoverBorderColor="red-200"
              />
            </div>
          </TabsContent>

          <TabsContent value="business" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <FeatureCard
                href="#"
                icon={Wallet}
                title="給与明細照会"
                description=""
                iconBgColor="red-100"
                iconColor="red-600"
                hoverBorderColor="red-200"
              />

              <FeatureCard
                href="#"
                icon={Receipt}
                title="出張旅費管理"
                description=""
                iconBgColor="gray-100"
                iconColor="gray-600"
                hoverBorderColor="gray-200"
              />

              <FeatureCard
                href="#"
                icon={Database}
                title="減価償却資産台帳"
                description=""
                iconBgColor="green-100"
                iconColor="green-600"
                hoverBorderColor="green-200"
              />
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <FeatureCard
                href="/master"
                icon={FileSpreadsheet}
                title="マスタ管理"
                description=""
                iconBgColor="purple-100"
                iconColor="purple-600"
                hoverBorderColor="purple-200"
              />

              <FeatureCard
                href="/fiscal-year-transition"
                icon={Calendar}
                title="年度移行"
                description=""
                iconBgColor="green-100"
                iconColor="green-600"
                hoverBorderColor="green-200"
              />

              <FeatureCard
                href="/backup"
                icon={Database}
                title="バックアップ設定"
                description=""
                iconBgColor="blue-100"
                iconColor="blue-600"
                hoverBorderColor="blue-200"
              />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">財務サマリー</h2>
        </div>

        <TaxEstimationCard
          selectedYearId={selectedFiscalYear}
          taxCalculation={taxCalculation}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm min-h-[400px]">
            {assetByYearLoading ? (
              <LoadingSpinner />
            ) : (
              <DonutChart
                title={`資産の内訳${selectedFiscalYear === 'none' ? '' : ` (${selectedFiscalYear}年度)`}`}
                value={assetChartData.value}
                data={assetChartData.data}
                labels={assetChartData.labels}
                colors={assetChartData.colors}
                amounts={assetChartData.amounts}
              />
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm min-h-[400px]">
            {revenueByYearLoading ? (
              <LoadingSpinner />
            ) : (
              <DonutChart
                title={`収入の内訳${selectedFiscalYear === 'none' ? '' : ` (${selectedFiscalYear}年度)`}`}
                value={revenueChartData.value}
                data={revenueChartData.data}
                labels={revenueChartData.labels}
                colors={revenueChartData.colors}
                amounts={revenueChartData.amounts}
              />
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm min-h-[400px]">
            {expenseByYearLoading ? (
              <LoadingSpinner />
            ) : (
              <DonutChart
                title={`支出の内訳${selectedFiscalYear === 'none' ? '' : ` (${selectedFiscalYear}年度)`}`}
                value={expenseChartData.value}
                data={expenseChartData.data}
                labels={expenseChartData.labels}
                colors={expenseChartData.colors}
                amounts={expenseChartData.amounts}
              />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h3 className="font-medium text-lg mb-4">
            収入の内訳 月別
            {selectedFiscalYear === 'none'
              ? ''
              : ` (${selectedFiscalYear}年度)`}
          </h3>
          {revenueByMonthLoading ? (
            <LoadingSpinner />
          ) : monthlyRevenueData.datasets.length === 0 ? (
            <div className="flex justify-center items-center h-[400px] text-gray-500">
              データがありません
            </div>
          ) : (
            <StackedBarChart data={monthlyRevenueData} />
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-medium text-lg mb-4">
            支出の内訳 月別
            {selectedFiscalYear === 'none'
              ? ''
              : ` (${selectedFiscalYear}年度)`}
          </h3>
          {expenseByMonthLoading ? (
            <LoadingSpinner />
          ) : monthlyExpenseData.datasets.length === 0 ? (
            <div className="flex justify-center items-center h-[400px] text-gray-500">
              データがありません
            </div>
          ) : (
            <StackedBarChart data={monthlyExpenseData} />
          )}
        </div>
      </section>
    </div>
  )
}

interface TaxEstimationCardProps {
  selectedYearId: string | null
  taxCalculation: {
    getResult: () => Array<{
      taxName: string
      taxAmount: number
    }>
  } | null
}

function TaxEstimationCard({
  selectedYearId,
  taxCalculation,
}: TaxEstimationCardProps) {
  const fiscalYears = useAppSelector(selectFiscalYears)
  const selectedYear = fiscalYears.find((year) => year.id === selectedYearId)
  const isCurrentYear = selectedYear?.isCurrent

  if (!taxCalculation) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">税額シミュレーション</h3>
          <Link href={`/tax-simulation?fiscal_year=${selectedYearId}`}>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Calculator className="h-4 w-4" />
              詳細表示
            </Button>
          </Link>
        </div>
        <div className="flex justify-center items-center h-[120px] text-gray-500">
          データがありません
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">
          税額シミュレーション
          {selectedYearId !== 'none'
            ? ` (${selectedYearId}年度${isCurrentYear ? ' 見込み額' : ' 確定額'})`
            : ''}
        </h3>
        <Link href={`/tax-simulation?fiscal_year=${selectedYearId}`}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Calculator className="h-4 w-4" />
            詳細表示
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {taxCalculation
          .getResult()
          .map((tax: { taxName: string; taxAmount: number }, index: number) => {
            const isLast = index === taxCalculation.getResult().length - 1
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
    </div>
  )
}

interface FeatureCardProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  iconBgColor: string
  iconColor: string
  hoverBorderColor: string
}

function FeatureCard({
  href,
  icon: Icon,
  title,
  description,
  iconBgColor,
  iconColor,
  hoverBorderColor,
}: FeatureCardProps) {
  return (
    <Link href={href} className="block">
      <div
        className={`bg-white rounded-lg p-6 shadow-sm border transition-all hover:shadow-md hover:border-${hoverBorderColor} cursor-pointer h-[100px] flex items-center`}
      >
        <div
          className={`w-16 h-16 rounded-md bg-${iconBgColor} flex items-center justify-center mr-4`}
        >
          <Icon className={`h-10 w-10 text-${iconColor}`} />
        </div>
        <h3 className="font-medium text-lg">{title}</h3>
      </div>
    </Link>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-[400px]">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  )
}
