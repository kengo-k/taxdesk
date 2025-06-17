'use client'

import * as React from 'react'
import { useState } from 'react'

import { ChevronDown, ChevronUp, TrendingDown, Wallet } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'


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

function PayrollCard({ data, isExpanded, onToggle }: { 
  data: PayrollData
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm font-medium">
              {data.monthName}
            </Badge>
            <h3 className="text-lg font-semibold">{formatCurrency(data.totalPayment)}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* 給与所得部分 */}
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-800 mb-2">給与所得</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">基本給与</span>
                  <span className="font-medium text-blue-600">{formatCurrency(data.baseSalary)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    源泉徴収税
                  </span>
                  <span className="text-sm text-red-600">-{formatCurrency(data.withholdingTax)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-orange-500" />
                    社会保険料
                  </span>
                  <span className="text-sm text-orange-600">-{formatCurrency(data.socialInsurance)}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">給与手取り</span>
                  <span className="font-medium text-blue-800">{formatCurrency(data.baseSalary - data.withholdingTax - data.socialInsurance)}</span>
                </div>
              </div>
            </div>

            {/* 経費清算部分 */}
            {data.expenseReimbursement > 0 && (
              <div className="bg-green-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-green-800 mb-2">経費清算</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">立替経費</span>
                  <span className="font-medium text-green-600">{formatCurrency(data.expenseReimbursement)}</span>
                </div>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between items-center pt-2">
              <span className="font-medium text-lg">振込総額</span>
              <span className="font-bold text-xl">{formatCurrency(data.totalPayment)}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function PayrollPage() {
  const [selectedYear, setSelectedYear] = useState('2024')
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  const toggleCard = (month: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(month)) {
      newExpanded.delete(month)
    } else {
      newExpanded.add(month)
    }
    setExpandedCards(newExpanded)
  }

  const toggleAll = () => {
    if (expandedCards.size === mockPayrollData.length) {
      setExpandedCards(new Set())
    } else {
      setExpandedCards(new Set(mockPayrollData.map(item => item.month)))
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">給与明細照会</h1>
          <p className="text-gray-600 mt-1">月別の給与支払い状況を確認できます</p>
        </div>
        
        <div className="flex items-center gap-4">
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAll}
          >
            {expandedCards.size === mockPayrollData.length ? '全て閉じる' : '全て展開'}
          </Button>
        </div>
      </div>

      <PayrollSummaryCard data={mockPayrollData} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">月別給与明細</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockPayrollData.map((payroll) => (
            <PayrollCard
              key={payroll.month}
              data={payroll}
              isExpanded={expandedCards.has(payroll.month)}
              onToggle={() => toggleCard(payroll.month)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}