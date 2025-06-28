'use client'

import {
  Suspense,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { AlertCircle, FileSpreadsheet, Trash2 } from 'lucide-react'

import { AutocompleteOption } from '@/components/ui/autocomplete'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { getFieldDisplayName } from '@/lib/schemas/common-validation'
import { validateJournalRow } from '@/lib/schemas/journal-validation'

import { ExistingJournalRow } from './components/existing-journal-row'
import { NewJournalRow } from './components/new-journal-row'

const JournalEntryContent = memo(function JournalEntryContent() {
  const dispatch = useAppDispatch()

  // Redux state
  const { data: fiscalYears } = useAppSelector(selectFiscalYears)
  const selectedFiscalYear = useAppSelector(selectSelectedFiscalYear)
  const { data: accountList } = useAppSelector(selectAccountList)
  const { list: journalList, count: journalListCount } =
    useAppSelector(selectJournalList)

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

  // フォーカス連動エラーサマリー用の状態
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null)

  // 新規行のバリデーション状態
  const [newRowData, setNewRowData] = useState({
    date: '',
    karikata_cd: '',
    kasikata_cd: '',
    karikata_value: 0,
    kasikata_value: 0,
    note: '',
    nendo: searchForm.fiscalYear !== 'none' ? searchForm.fiscalYear : '',
  })

  // 年度変更時に新規行データの年度も更新
  useEffect(() => {
    setNewRowData((prev) => ({
      ...prev,
      nendo: searchForm.fiscalYear !== 'none' ? searchForm.fiscalYear : '',
    }))
  }, [searchForm.fiscalYear])
  const [newRowErrors, setNewRowErrors] = useState<Record<string, string>>({})

  // エラーサマリー表示用（エラーがある限り常に表示）
  const showErrorSummary = Object.keys(newRowErrors).length > 0
  const focusedRowErrors = Object.entries(newRowErrors).map(
    ([field, message]) => ({
      field: getFieldDisplayName(field),
      message,
    }),
  )

  // 勘定科目リストをオートコンプリート用に変換（メモ化）
  const accountOptions: AutocompleteOption[] = useMemo(
    () =>
      accountList.map((account) => ({
        value: account.id,
        code: account.code,
        label: account.name,
        kana_name: account.kana_name,
      })),
    [accountList],
  )

  // getFieldDisplayName は common-validation から import済み

  // 新規行フィールド変更ハンドラー（メモ化）
  const handleNewRowFieldChange = useCallback(
    (field: string, value: string | number) => {
      setNewRowData((prev) => ({
        ...prev,
        [field]: value,
      }))
      // エラーのクリアは削除（Enterキー押下時のみクリア）
    },
    [],
  )

  // オートコンプリート選択ハンドラー（メモ化）
  const handleAccountSelect = useCallback(
    (field: 'karikata_cd' | 'kasikata_cd', option: AutocompleteOption) => {
      handleNewRowFieldChange(field, option.code || '')
    },
    [handleNewRowFieldChange],
  )

  // 個別バリデーションは削除（Enterキーのみでバリデーション）

  // Enterキー押下時の全体バリデーション＆登録処理（メモ化）
  const handleNewRowSubmit = useCallback(() => {
    const rowValidation = validateJournalRow(newRowData)

    if (!rowValidation.valid) {
      setNewRowErrors(rowValidation.errors)
      return
    }

    // バリデーション成功時の登録処理
    console.log('新規仕訳登録:', newRowData)

    // 登録後、フィールドをクリア
    setNewRowData({
      date: '',
      karikata_cd: '',
      kasikata_cd: '',
      karikata_value: 0,
      kasikata_value: 0,
      note: '',
      nendo: searchForm.fiscalYear !== 'none' ? searchForm.fiscalYear : '',
    })
    setNewRowErrors({})
  }, [newRowData, searchForm.fiscalYear])

  // キーダウンハンドラー（メモ化）
  const handleNewRowKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleNewRowSubmit()
      }
    },
    [handleNewRowSubmit],
  )

  // フォーカス・ブラーハンドラー（メモ化）
  const handleNewRowFocus = useCallback(() => setFocusedRowId('new'), [])
  const handleNewRowBlur = useCallback(() => setFocusedRowId(null), [])

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
                <span className="font-medium text-red-800">新規行のエラー</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {focusedRowErrors.map((error, index) => (
                  <li key={index}>
                    • <span className="font-medium">{error.field}:</span>{' '}
                    {error.message}
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
                <NewJournalRow
                  newRowData={newRowData}
                  newRowErrors={newRowErrors}
                  accountOptions={accountOptions}
                  deleteMode={deleteMode}
                  onFieldChange={handleNewRowFieldChange}
                  onAccountSelect={handleAccountSelect}
                  onKeyDown={handleNewRowKeyDown}
                  onFocus={handleNewRowFocus}
                  onBlur={handleNewRowBlur}
                />
                {journalList.map((entry, index) => (
                  <ExistingJournalRow
                    key={entry.id}
                    entry={entry}
                    index={index}
                    deleteMode={deleteMode}
                  />
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
})

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
