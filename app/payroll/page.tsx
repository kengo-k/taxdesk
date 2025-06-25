'use client'

import * as React from 'react'
import { useState } from 'react'

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


interface PayrollData {
  month: number
  monthName: string
  baseSalary: number
  withholdingTax: number
  socialInsurance: number
  expenseReimbursement: number
  totalPayment: number
}

const mockPayrollData: PayrollData[] = [
  {
    month: 4,
    monthName: '4月',
    baseSalary: 350000,
    withholdingTax: 28000,
    socialInsurance: 52500,
    expenseReimbursement: 12000,
    totalPayment: 281500,
  },
  {
    month: 5,
    monthName: '5月',
    baseSalary: 350000,
    withholdingTax: 28000,
    socialInsurance: 52500,
    expenseReimbursement: 8500,
    totalPayment: 277500,
  },
  {
    month: 6,
    monthName: '6月',
    baseSalary: 380000,
    withholdingTax: 32000,
    socialInsurance: 57000,
    expenseReimbursement: 15000,
    totalPayment: 306000,
  },
  {
    month: 7,
    monthName: '7月',
    baseSalary: 350000,
    withholdingTax: 28000,
    socialInsurance: 52500,
    expenseReimbursement: 3200,
    totalPayment: 272700,
  },
  {
    month: 8,
    monthName: '8月',
    baseSalary: 350000,
    withholdingTax: 28000,
    socialInsurance: 52500,
    expenseReimbursement: 0,
    totalPayment: 269500,
  },
  {
    month: 9,
    monthName: '9月',
    baseSalary: 350000,
    withholdingTax: 28000,
    socialInsurance: 52500,
    expenseReimbursement: 9800,
    totalPayment: 279300,
  },
  {
    month: 10,
    monthName: '10月',
    baseSalary: 350000,
    withholdingTax: 28000,
    socialInsurance: 52500,
    expenseReimbursement: 6500,
    totalPayment: 276000,
  },
  {
    month: 11,
    monthName: '11月',
    baseSalary: 350000,
    withholdingTax: 28000,
    socialInsurance: 52500,
    expenseReimbursement: 4300,
    totalPayment: 273800,
  },
  {
    month: 12,
    monthName: '12月',
    baseSalary: 420000,
    withholdingTax: 38000,
    socialInsurance: 63000,
    expenseReimbursement: 11000,
    totalPayment: 330000,
  },
  {
    month: 1,
    monthName: '1月',
    baseSalary: 350000,
    withholdingTax: 28000,
    socialInsurance: 52500,
    expenseReimbursement: 7200,
    totalPayment: 276700,
  },
  {
    month: 2,
    monthName: '2月',
    baseSalary: 350000,
    withholdingTax: 28000,
    socialInsurance: 52500,
    expenseReimbursement: 5100,
    totalPayment: 274600,
  },
  {
    month: 3,
    monthName: '3月',
    baseSalary: 350000,
    withholdingTax: 28000,
    socialInsurance: 52500,
    expenseReimbursement: 13500,
    totalPayment: 283000,
  },
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(amount)
}

function PayrollSummaryCard({ data }: { data: PayrollData[] }) {
  const totalBaseSalary = data.reduce((sum, item) => sum + item.baseSalary, 0)
  const totalWithholding = data.reduce((sum, item) => sum + item.withholdingTax, 0)
  const totalSocialInsurance = data.reduce((sum, item) => sum + item.socialInsurance, 0)
  const totalExpenseReimbursement = data.reduce((sum, item) => sum + item.expenseReimbursement, 0)
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
            <p className="text-lg font-bold text-blue-600">{formatCurrency(totalBaseSalary)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">源泉徴収税</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totalWithholding)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">社会保険料</p>
            <p className="text-lg font-bold text-orange-600">{formatCurrency(totalSocialInsurance)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">経費清算</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalExpenseReimbursement)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">振込総額</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalPayment)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PayrollTable({ data }: { data: PayrollData[] }) {
  return (
    <Card>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>月</TableHead>
              <TableHead className="text-right">基本給与</TableHead>
              <TableHead className="text-right">源泉徴収税</TableHead>
              <TableHead className="text-right">社会保険料</TableHead>
              <TableHead className="text-right">経費清算</TableHead>
              <TableHead className="text-right font-semibold">振込総額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((payroll) => (
              <TableRow key={payroll.month}>
                <TableCell className="font-medium">{payroll.monthName}</TableCell>
                <TableCell className="text-right">{formatCurrency(payroll.baseSalary)}</TableCell>
                <TableCell className="text-right text-red-600">-{formatCurrency(payroll.withholdingTax)}</TableCell>
                <TableCell className="text-right text-orange-600">-{formatCurrency(payroll.socialInsurance)}</TableCell>
                <TableCell className="text-right text-green-600">{formatCurrency(payroll.expenseReimbursement)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(payroll.totalPayment)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function PayrollPage() {
  const [selectedYear, setSelectedYear] = useState('2024')

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">給与明細照会</h1>
          <p className="text-gray-600 mt-1">月別の給与支払い状況を確認できます</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">年度：</span>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024年度</SelectItem>
              <SelectItem value="2023">2023年度</SelectItem>
              <SelectItem value="2022">2022年度</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <PayrollSummaryCard data={mockPayrollData} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">月別給与明細</h2>
        <PayrollTable data={mockPayrollData} />
      </div>
    </div>
  )
}