'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { FileSpreadsheet, Search, Calendar, Yen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

// モックデータ
const mockJournalEntries = [
  {
    id: 1,
    date: '2024-03-15',
    voucherNo: 'V-001',
    debitAccount: '現金',
    debitAmount: 100000,
    creditAccount: '売上高',
    creditAmount: 100000,
    description: '商品売上',
  },
  {
    id: 2,
    date: '2024-03-14',
    voucherNo: 'V-002',
    debitAccount: '仕入',
    debitAmount: 50000,
    creditAccount: '買掛金',
    creditAmount: 50000,
    description: '商品仕入',
  },
  {
    id: 3,
    date: '2024-03-13',
    voucherNo: 'V-003',
    debitAccount: '旅費交通費',
    debitAmount: 15000,
    creditAccount: '現金',
    creditAmount: 15000,
    description: '出張交通費',
  },
]

const mockAccounts = [
  '現金', '普通預金', '売掛金', '買掛金', '仕入', '売上高', 
  '旅費交通費', '通信費', '消耗品費', '減価償却費'
]

function JournalEntryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchForm, setSearchForm] = useState({
    fiscalYear: 'none',
    month: 'none',
    account: 'none',
    side: 'none',
    description: '',
    amount: '',
    amountCondition: 'none',
    checked: 'none',
  })

  const [deleteMode, setDeleteMode] = useState(false)

  // モック年度データ（実際は Redux から取得）
  const mockFiscalYears = [
    { id: '2024', label: '2024年度' },
    { id: '2023', label: '2023年度' },
    { id: '2022', label: '2022年度' },
  ]

  // 月データ
  const months = [
    { id: 'none', label: '未設定' },
    { id: '4', label: '4月' },
    { id: '5', label: '5月' },
    { id: '6', label: '6月' },
    { id: '7', label: '7月' },
    { id: '8', label: '8月' },
    { id: '9', label: '9月' },
    { id: '10', label: '10月' },
    { id: '11', label: '11月' },
    { id: '12', label: '12月' },
    { id: '1', label: '1月' },
    { id: '2', label: '2月' },
    { id: '3', label: '3月' },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6" />
          <h1 className="text-2xl font-bold">仕訳帳入力</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">年度：</span>
          <Select value={searchForm.fiscalYear} onValueChange={(value) => setSearchForm({...searchForm, fiscalYear: value})}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="年度を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">未設定</SelectItem>
              {mockFiscalYears.map(year => (
                <SelectItem key={year.id} value={year.id}>{year.id}年度</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 検索エリア */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <Label htmlFor="account" className="text-sm">勘定科目</Label>
                <div className="flex gap-0">
                  <Select value={searchForm.account} onValueChange={(value) => setSearchForm({...searchForm, account: value})}>
                    <SelectTrigger className="h-9 rounded-r-none border-r-0 flex-1">
                      <SelectValue placeholder="科目を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">未設定</SelectItem>
                      {mockAccounts.map(account => (
                        <SelectItem key={account} value={account}>{account}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={searchForm.side} onValueChange={(value) => setSearchForm({...searchForm, side: value})}>
                    <SelectTrigger className="h-9 w-24 rounded-l-none">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">未設定</SelectItem>
                      <SelectItem value="debit">借方のみ</SelectItem>
                      <SelectItem value="credit">貸方のみ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="month" className="text-sm">月</Label>
                <Select value={searchForm.month} onValueChange={(value) => setSearchForm({...searchForm, month: value})}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="月を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.id} value={month.id}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount" className="text-sm">金額</Label>
                <div className="flex gap-0">
                  <Input
                    id="amount"
                    type="number"
                    placeholder=""
                    className="h-9 rounded-r-none border-r-0 flex-1"
                    value={searchForm.amount}
                    onChange={(e) => setSearchForm({...searchForm, amount: e.target.value})}
                  />
                  <Select value={searchForm.amountCondition} onValueChange={(value) => setSearchForm({...searchForm, amountCondition: value})}>
                    <SelectTrigger className="h-9 w-24 rounded-l-none">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">未設定</SelectItem>
                      <SelectItem value="gte">以上</SelectItem>
                      <SelectItem value="lte">以下</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm">摘要</Label>
                <Input
                  id="description"
                  placeholder="摘要で検索"
                  className="h-9"
                  value={searchForm.description}
                  onChange={(e) => setSearchForm({...searchForm, description: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="checked" className="text-sm">確認状態</Label>
                <Select value={searchForm.checked} onValueChange={(value) => setSearchForm({...searchForm, checked: value})}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">未設定</SelectItem>
                    <SelectItem value="unchecked">未確認</SelectItem>
                    <SelectItem value="checked">確認済み</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" className="h-9">
                クリア
              </Button>
              <Button 
                variant="outline" 
                className="h-9 border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => setDeleteMode(!deleteMode)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                削除モード
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 仕訳一覧エリア */}
      <Card>
        <CardHeader>
          <CardTitle>仕訳一覧</CardTitle>
          <p className="text-sm text-gray-600">
            {mockJournalEntries.length}件の仕訳が見つかりました
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <colgroup>
                {deleteMode && <col className="w-12" />}
                <col className="w-44" />
                <col className="w-32" />
                <col className="w-28" />
                <col className="w-32" />
                <col className="w-28" />
                <col className="w-auto" />
                <col className="w-16" />
              </colgroup>
              <thead>
                <tr className="text-center text-sm">
                  {deleteMode && <th className="pb-2 font-medium w-12"></th>}
                  <th className="pb-2 font-medium">日付</th>
                  <th className="pb-2 font-medium">借方科目</th>
                  <th className="pb-2 font-medium">借方金額</th>
                  <th className="pb-2 font-medium">貸方科目</th>
                  <th className="pb-2 font-medium">貸方金額</th>
                  <th className="pb-2 font-medium">摘要</th>
                  <th className="pb-2 font-medium">確認</th>
                </tr>
              </thead>
              <tbody>
                {/* 新規入力行 */}
                <tr className="border-t bg-gray-50">
                  {deleteMode && <td className="py-2 px-1 text-center"></td>}
                  <td className="py-2 px-1 relative">
                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-400"></div>
                    <Input
                      type="text"
                      placeholder="YYYYMMDD"
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <Input
                      type="text"
                      placeholder="科目コード"
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <Input
                      type="text"
                      placeholder="借方金額"
                      className="h-8 text-sm text-right"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <Input
                      type="text"
                      placeholder="科目コード"
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <Input
                      type="text"
                      placeholder="貸方金額"
                      className="h-8 text-sm text-right"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <Input
                      type="text"
                      placeholder="摘要を入力"
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="py-2 px-1 text-center">
                    {/* 新規行のため確認チェックボックスなし */}
                  </td>
                </tr>
                {mockJournalEntries.map((entry, index) => (
                  <tr key={entry.id} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    {deleteMode && (
                      <td className="py-2 px-1 text-center">
                        <Checkbox className="h-4 w-4" />
                      </td>
                    )}
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue={entry.date.replace(/-/g, '')}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue={entry.debitAccount}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue={formatCurrency(entry.debitAmount)}
                        className="h-8 text-sm text-right"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue={entry.creditAccount}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue={formatCurrency(entry.creditAmount)}
                        className="h-8 text-sm text-right"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue={entry.description}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="py-2 px-1 text-center">
                      <Checkbox className="h-4 w-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              1-3 / 3件
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>前へ</Button>
              <Button variant="outline" size="sm" disabled>次へ</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function JournalEntryPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-6"><div className="flex justify-center items-center h-64"><div className="text-gray-600">データを読み込み中...</div></div></div>}>
      <JournalEntryContent />
    </Suspense>
  )
}