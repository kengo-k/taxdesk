'use client'

import * as React from 'react'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Wallet } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  PayrollSummary,
  fetchPayrollSummary,
  selectPayrollSummary,
} from '@/lib/redux/features/payrollSlice'
import {
  fetchFiscalYears,
  selectFiscalYears,
} from '@/lib/redux/features/masterSlice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'

interface PayrollData {
  month: number
  monthName: string
  baseSalary: number
  withholdingTax: number
  socialInsurance: number
  expenseReimbursement: number
  totalPayment: number
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(amount)
}

function convertToPayrollData(summaries: PayrollSummary[]): PayrollData[] {
  return summaries
    .map((summary) => {
      const monthNum = parseInt(summary.month.substring(4, 6))
      const monthName = `${monthNum}月`

      const withholdingTax = summary.payroll_deduction
        .filter(
          (item) =>
            item.name.includes('所得税') || item.name.includes('源泉徴収'),
        )
        .reduce((sum, item) => sum + item.amount, 0)

      const socialInsurance = summary.payroll_deduction
        .filter(
          (item) =>
            item.name.includes('社会保険') ||
            item.name.includes('健康保険') ||
            item.name.includes('厚生年金'),
        )
        .reduce((sum, item) => sum + item.amount, 0)

      const expenseReimbursement = summary.payroll_addition
        .filter(
          (item) =>
            item.name.includes('経費') ||
            item.name.includes('清算') ||
            item.name.includes('立替') ||
            item.name.includes('年末調整'),
        )
        .reduce((sum, item) => sum + item.amount, 0)

      return {
        month: monthNum,
        monthName,
        baseSalary: summary.payroll_base,
        withholdingTax,
        socialInsurance,
        expenseReimbursement,
        totalPayment: summary.net_payment,
      }
    })
    .sort((a, b) => {
      if (a.month >= 4 && b.month >= 4) return a.month - b.month
      if (a.month < 4 && b.month < 4) return a.month - b.month
      if (a.month >= 4 && b.month < 4) return -1
      if (a.month < 4 && b.month >= 4) return 1
      return 0
    })
}

function PayrollSummaryCard({ data }: { data: PayrollData[] }) {
  const totalBaseSalary = data.reduce((sum, item) => sum + item.baseSalary, 0)
  const totalWithholding = data.reduce(
    (sum, item) => sum + item.withholdingTax,
    0,
  )
  const totalSocialInsurance = data.reduce(
    (sum, item) => sum + item.socialInsurance,
    0,
  )
  const totalExpenseReimbursement = data.reduce(
    (sum, item) => sum + item.expenseReimbursement,
    0,
  )
  const totalPayment = data.reduce((sum, item) => sum + item.totalPayment, 0)

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          年間給与サマリー
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">基本給与総額</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(totalBaseSalary)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">源泉徴収税</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(totalWithholding)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">社会保険料</p>
            <p className="text-lg font-bold text-orange-600">
              {formatCurrency(totalSocialInsurance)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">経費清算</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(totalExpenseReimbursement)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">振込総額</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(totalPayment)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PayrollTable({ summaries }: { summaries: PayrollSummary[] }) {
  const sortedSummaries = summaries
    .map((summary) => ({
      ...summary,
      monthNum: parseInt(summary.month.substring(4, 6)),
      monthName: `${parseInt(summary.month.substring(4, 6))}月`,
    }))
    .sort((a, b) => {
      if (a.monthNum >= 4 && b.monthNum >= 4) return a.monthNum - b.monthNum
      if (a.monthNum < 4 && b.monthNum < 4) return a.monthNum - b.monthNum
      if (a.monthNum >= 4 && b.monthNum < 4) return -1
      if (a.monthNum < 4 && b.monthNum >= 4) return 1
      return 0
    })

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>月</TableHead>
              <TableHead className="text-right">基本給与</TableHead>
              <TableHead className="text-right">差引額</TableHead>
              <TableHead className="text-right">加算額</TableHead>
              <TableHead className="text-right">振込総額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSummaries.map((summary, summaryIndex) => {
              const totalDeduction = summary.payroll_deduction.reduce((sum, item) => sum + item.amount, 0)
              const totalAddition = summary.payroll_addition.reduce((sum, item) => sum + item.amount, 0)
              
              return (
                <TableRow key={summary.month} className={summaryIndex % 2 === 0 ? "bg-white" : "bg-gray-25"}>
                  <TableCell className="py-4 align-top">
                    {summary.monthName}
                  </TableCell>
                  <TableCell className="text-right py-4 align-top">
                    <span className="font-mono">
                      {formatCurrency(summary.payroll_base)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4 align-top">
                    <div className="text-sm min-w-[200px]">
                      {summary.payroll_deduction.length > 0 && (
                        <div className="mb-3">
                          <div className="font-mono border-b border-gray-300 pb-1 inline-block">
                            {formatCurrency(totalDeduction)}
                          </div>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        {summary.payroll_deduction.map((item, index) => (
                          <div key={index} className="text-gray-600 leading-relaxed text-xs">
                            <span className="font-medium">{item.name}:</span>{" "}
                            <span className="font-mono">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4 align-top">
                    <div className="text-sm min-w-[200px]">
                      {summary.payroll_addition.length > 0 && (
                        <div className="mb-3">
                          <div className="font-mono border-b border-gray-300 pb-1 inline-block">
                            {formatCurrency(totalAddition)}
                          </div>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        {summary.payroll_addition.map((item, index) => (
                          <div key={index} className="text-gray-600 leading-relaxed text-xs">
                            <span className="font-medium">{item.name}:</span>{" "}
                            <span className="font-mono">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4 align-top">
                    <span className="font-mono">
                      {formatCurrency(summary.net_payment)}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function PayrollContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fiscalYearParam = searchParams.get('fiscal_year')
  
  const [selectedYear, setSelectedYear] = useState(fiscalYearParam || '2024')
  const dispatch = useAppDispatch()
  const { summaries, loading, error } = useAppSelector(selectPayrollSummary)
  const { data: fiscalYears, loading: fiscalYearsLoading } = useAppSelector(selectFiscalYears)

  const payrollData = React.useMemo(() => {
    if (!summaries || !Array.isArray(summaries)) {
      return []
    }
    return convertToPayrollData(summaries)
  }, [summaries])

  useEffect(() => {
    if (fiscalYears.length === 0 && !fiscalYearsLoading) {
      dispatch(fetchFiscalYears())
    }
  }, [dispatch, fiscalYears.length, fiscalYearsLoading])

  const handleYearChange = (value: string) => {
    setSelectedYear(value)
    router.replace(`/payroll?fiscal_year=${value}`)
  }

  useEffect(() => {
    dispatch(fetchPayrollSummary(selectedYear))
  }, [dispatch, selectedYear])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">データを読み込み中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">給与明細照会</h1>
          <p className="text-gray-600 mt-1">
            月別の給与支払い状況を確認できます
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">年度：</span>
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
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

      <PayrollSummaryCard data={payrollData} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">月別給与明細</h2>
        <PayrollTable summaries={summaries || []} />
      </div>
    </div>
  )
}

export default function PayrollPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-6"><div className="flex justify-center items-center h-64"><div className="text-gray-600">データを読み込み中...</div></div></div>}>
      <PayrollContent />
    </Suspense>
  )
}
