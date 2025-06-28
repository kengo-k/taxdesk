'use client'

import { Suspense, useEffect, useState } from 'react'

import { AlertCircle, FileSpreadsheet, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataPagination } from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/client/utils/formatting'
import {
  fetchJournals,
  selectJournalList,
} from '@/lib/redux/features/journalSlice'
import {
  fetchAccountList,
  fetchFiscalYears,
  selectAccountList,
  selectFiscalYears,
  selectSelectedFiscalYear,
} from '@/lib/redux/features/masterSlice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'

function JournalEntryContent() {
  const dispatch = useAppDispatch()

  // Redux state
  const { data: fiscalYears } = useAppSelector(selectFiscalYears)
  const selectedFiscalYear = useAppSelector(selectSelectedFiscalYear)
  const { data: accountList } = useAppSelector(selectAccountList)
  const {
    list: journalList,
    count: journalListCount,
    loading: journalLoading,
    error: journalError,
  } = useAppSelector(selectJournalList)

  const [searchForm, setSearchForm] = useState({
    fiscalYear: selectedFiscalYear || 'none',
    month: 'none',
    account: 'none',
    side: 'none',
    description: '',
    amount: '',
    amountCondition: 'none',
    checked: 'none',
  })

  const [deleteMode, setDeleteMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // フォーカス連動エラーサマリー用のモック状態
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null)
  const [showErrorSummary] = useState(true) // モック表示用

  // モックエラーデータ
  const mockFocusedRowErrors = [
    { field: '日付', message: '正しい形式（YYYYMMDD）で入力してください' },
    { field: '借方金額', message: '数値を入力してください' },
    { field: '摘要', message: '摘要は必須です' },
  ]

  // 年度データを取得
  useEffect(() => {
    dispatch(fetchFiscalYears())
  }, [dispatch])

  // 年度が変更された時に勘定科目一覧を取得
  useEffect(() => {
    if (searchForm.fiscalYear && searchForm.fiscalYear !== 'none') {
      dispatch(fetchAccountList(searchForm.fiscalYear))
    }
  }, [dispatch, searchForm.fiscalYear])

  // 検索フォームが変更されたら仕訳データを取得
  useEffect(() => {
    if (searchForm.fiscalYear && searchForm.fiscalYear !== 'none') {
      dispatch(
        fetchJournals({
          fiscal_year: searchForm.fiscalYear,
          account: searchForm.account === 'none' ? null : searchForm.account,
          month: searchForm.month === 'none' ? null : searchForm.month,
          accountSide:
            searchForm.side === 'none'
              ? null
              : searchForm.side === 'debit'
                ? 'karikata'
                : searchForm.side === 'credit'
                  ? 'kasikata'
                  : null,
          note: searchForm.description || null,
          amount: searchForm.amount || null,
          amountCondition:
            searchForm.amountCondition === 'none'
              ? null
              : searchForm.amountCondition,
          checked:
            searchForm.checked === 'none'
              ? null
              : searchForm.checked === 'unchecked'
                ? '0'
                : searchForm.checked === 'checked'
                  ? '1'
                  : null,
          page: currentPage,
          pageSize: pageSize,
        }),
      )
    }
  }, [dispatch, searchForm, currentPage, pageSize])

  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // ページサイズ変更ハンドラー
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // ページサイズ変更時は1ページ目に戻る
  }

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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6" />
          <h1 className="text-2xl font-bold">仕訳帳入力</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">年度：</span>
          <Select
            value={searchForm.fiscalYear}
            onValueChange={(value) =>
              setSearchForm({ ...searchForm, fiscalYear: value })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="年度を選択" />
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

      {/* 検索エリア */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <Label htmlFor="account" className="text-sm">
                  勘定科目
                </Label>
                <div className="flex gap-0">
                  <Select
                    value={searchForm.account}
                    onValueChange={(value) =>
                      setSearchForm({ ...searchForm, account: value })
                    }
                  >
                    <SelectTrigger className="h-9 rounded-r-none border-r-0 flex-1">
                      <SelectValue placeholder="科目を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">未設定</SelectItem>
                      {accountList.map((account) => (
                        <SelectItem key={account.id} value={account.code}>
                          {account.code}: {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={searchForm.side}
                    onValueChange={(value) =>
                      setSearchForm({ ...searchForm, side: value })
                    }
                  >
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
                <Label htmlFor="month" className="text-sm">
                  月
                </Label>
                <Select
                  value={searchForm.month}
                  onValueChange={(value) =>
                    setSearchForm({ ...searchForm, month: value })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="月を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.id} value={month.id}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount" className="text-sm">
                  金額
                </Label>
                <div className="flex gap-0">
                  <Input
                    id="amount"
                    type="number"
                    placeholder=""
                    className="h-9 rounded-r-none border-r-0 flex-1"
                    value={searchForm.amount}
                    onChange={(e) =>
                      setSearchForm({ ...searchForm, amount: e.target.value })
                    }
                  />
                  <Select
                    value={searchForm.amountCondition}
                    onValueChange={(value) =>
                      setSearchForm({ ...searchForm, amountCondition: value })
                    }
                  >
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
                <Label htmlFor="description" className="text-sm">
                  摘要
                </Label>
                <Input
                  id="description"
                  placeholder="摘要で検索"
                  className="h-9"
                  value={searchForm.description}
                  onChange={(e) =>
                    setSearchForm({
                      ...searchForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="checked" className="text-sm">
                  確認状態
                </Label>
                <Select
                  value={searchForm.checked}
                  onValueChange={(value) =>
                    setSearchForm({ ...searchForm, checked: value })
                  }
                >
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
        <CardContent className="pt-6">
          {/* フォーカス連動エラーサマリー (モック) */}
          {showErrorSummary && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">
                  新規行のエラー
                </span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {mockFocusedRowErrors.map((error, index) => (
                  <li key={index}>
                    • <span className="font-medium">{error.field}:</span> {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <colgroup>
                {deleteMode && <col className="w-12" />}
                <col className="w-44" />
                <col className="w-24" />
                <col className="w-32" />
                <col className="w-28" />
                <col className="w-24" />
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
                  <th className="pb-2 font-medium">借方科目名</th>
                  <th className="pb-2 font-medium">借方金額</th>
                  <th className="pb-2 font-medium">貸方科目</th>
                  <th className="pb-2 font-medium">貸方科目名</th>
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
                      className="h-8 text-sm border-red-500"
                      onFocus={() => setFocusedRowId('new')}
                      onBlur={() => setFocusedRowId(null)}
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
                      placeholder=""
                      className="h-8 text-sm bg-gray-50"
                      readOnly
                      tabIndex={-1}
                    />
                  </td>
                  <td className="py-2 px-1">
                    <Input
                      type="text"
                      placeholder="借方金額"
                      className="h-8 text-sm text-right border-red-500"
                      onFocus={() => setFocusedRowId('new')}
                      onBlur={() => setFocusedRowId(null)}
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
                      placeholder=""
                      className="h-8 text-sm bg-gray-50"
                      readOnly
                      tabIndex={-1}
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
                      className="h-8 text-sm border-red-500"
                      onFocus={() => setFocusedRowId('new')}
                      onBlur={() => setFocusedRowId(null)}
                    />
                  </td>
                  <td className="py-2 px-1 text-center">
                    {/* 新規行のため確認チェックボックスなし */}
                  </td>
                </tr>
                {journalList.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                  >
                    {deleteMode && (
                      <td className="py-2 px-1 text-center">
                        <Checkbox className="h-4 w-4" />
                      </td>
                    )}
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue={entry.date}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue={entry.karikata_cd}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue=""
                        className="h-8 text-sm bg-gray-50"
                        readOnly
                        tabIndex={-1}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue={formatCurrency(entry.karikata_value)}
                        className="h-8 text-sm text-right font-mono"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue={entry.kasikata_cd}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue=""
                        className="h-8 text-sm bg-gray-50"
                        readOnly
                        tabIndex={-1}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue={formatCurrency(entry.kasikata_value)}
                        className="h-8 text-sm text-right font-mono"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        defaultValue={entry.note || ''}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="py-2 px-1 text-center">
                      <Checkbox
                        className="h-4 w-4"
                        checked={entry.checked === '1'}
                        disabled
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          <DataPagination
            totalItems={journalListCount}
            totalPages={Math.ceil(journalListCount / pageSize) || 1}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function JournalEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">データを読み込み中...</div>
          </div>
        </div>
      }
    >
      <JournalEntryContent />
    </Suspense>
  )
}
