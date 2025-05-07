'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// コンポーネントのインポート
import { AlertCircle, ArrowLeft } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { toast } from '@/components/ui/use-toast'
import {
  fetchAccountList,
  selectAccountListError,
  selectAccountListLoading,
  selectAllAccountList,
} from '@/lib/redux/features/accountSlice'
import {
  fetchFiscalYears,
  selectAllFiscalYears,
  selectFiscalYear as selectFiscalYearAction,
  selectFiscalYearError,
  selectFiscalYearLoading,
} from '@/lib/redux/features/fiscalYearSlice'
import {
  type TransactionSearchParams,
  deleteTransactions,
  fetchAccountCounts,
  fetchTransactions,
  selectAccountCounts,
  selectAccountCountsError,
  selectAccountCountsLoading,
  selectPagination,
  selectSearchParams,
  selectTransactionError,
  selectTransactionLoading,
  selectTransactions,
  updateSearchParams,
} from '@/lib/redux/features/transactionSlice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'

import { DeleteConfirmDialog } from './components/delete-confirm-dialog'
import { LedgerSearchForm } from './components/ledger-search-form'
import { Pagination } from './components/pagination'
import { TransactionTable } from './components/transaction-table'

export default function LedgerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const dispatch = useAppDispatch()

  // Reduxから年度データを取得
  const fiscalYears = useAppSelector(selectAllFiscalYears)
  const fiscalYearsLoading = useAppSelector(selectFiscalYearLoading)
  const fiscalYearsError = useAppSelector(selectFiscalYearError)

  // Reduxから勘定科目一覧を取得
  const accountList = useAppSelector(selectAllAccountList)
  const accountListLoading = useAppSelector(selectAccountListLoading)
  const accountListError = useAppSelector(selectAccountListError)

  // Reduxから取引データを取得
  const transactions = useAppSelector(selectTransactions)
  const pagination = useAppSelector(selectPagination)
  const transactionLoading = useAppSelector(selectTransactionLoading)
  const transactionError = useAppSelector(selectTransactionError)
  const reduxSearchParams = useAppSelector(selectSearchParams)

  // Reduxから勘定科目別レコード件数を取得
  const accountCounts = useAppSelector(selectAccountCounts)
  const accountCountsLoading = useAppSelector(selectAccountCountsLoading)
  const accountCountsError = useAppSelector(selectAccountCountsError)

  // URLパラメータから初期値を取得
  const nendoParam = searchParams.get('nendo')
  const codeParam = searchParams.get('code')
  const monthParam = searchParams.get('month')
  const pageParam = searchParams.get('page')

  // 検索条件の状態
  const [fiscalYear, setFiscalYear] = useState<string>(nendoParam || 'unset')

  // 初期表示用の空の配列
  const [initialLoaded, setInitialLoaded] = useState(false)

  // 勘定科目一覧と勘定科目別レコード件数をマージ
  const mergedAccounts = useMemo(() => {
    if (!Array.isArray(accountList) || accountList.length === 0) {
      return []
    }

    // 勘定科目別レコード件数がない場合は、件数0としてマージ
    if (!Array.isArray(accountCounts) || accountCounts.length === 0) {
      const merged = accountList.map((account) => {
        return {
          id: account.id,
          code: account.code,
          name: account.name,
          count: 0,
          label: `${account.code}: ${account.name} (0)`,
        }
      })
      return merged
    }
    // 科目コードごとに件数を集計
    const countMap = new Map<string, number>()
    accountCounts.forEach((item) => {
      // 既存の件数を取得（存在しない場合は0）
      const currentCount = countMap.get(item.saimoku_cd) || 0
      // 件数を加算して更新
      countMap.set(item.saimoku_cd, currentCount + item.count)
    })
    // 勘定科目一覧と勘定科目別レコード件数をマージ
    const merged = accountList.map((account) => {
      const count = countMap.get(account.code) || 0
      return {
        id: account.id,
        code: account.code,
        name: account.name,
        count,
        label: `${account.code}: ${account.name} (${count})`,
      }
    })
    return merged
  }, [accountList, accountCounts])

  // codeParamからアカウントIDを特定
  const getAccountIdFromCode = (code: string | null): string => {
    if (!code) return 'unset'

    // マージされた勘定科目データから検索
    if (mergedAccounts.length > 0) {
      const account = mergedAccounts.find((acc) => acc.code === code)
      if (account) return account.id
    }

    return 'unset'
  }

  const [account, setAccount] = useState<string>(
    getAccountIdFromCode(codeParam),
  )
  const [month, setMonth] = useState<string>(monthParam || 'unset')
  const [currentPage, setCurrentPage] = useState(
    pageParam ? Number.parseInt(pageParam, 10) : 1,
  )
  const [pageSize, setPageSize] = useState(10)

  // 削除モード関連の状態
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // コンポーネントマウント時に年度一覧と勘定科目データを取得
  useEffect(() => {
    // ストアに年度データがない場合のみ取得
    if (fiscalYears.length === 0 && !fiscalYearsLoading) {
      dispatch(fetchFiscalYears())
    }

    // URLパラメータから年度が指定されている場合は、その年度のデータを取得
    if (nendoParam && nendoParam !== 'unset') {
      dispatch(fetchAccountCounts(nendoParam))
    } else {
      // デフォルトの年度データを取得
      dispatch(fetchAccountCounts('2024'))
    }

    setInitialLoaded(true)
  }, [dispatch, nendoParam, fiscalYears.length, fiscalYearsLoading])

  // 初期表示時または年度変更時に勘定科目データを取得
  useEffect(() => {
    if (fiscalYear !== 'unset') {
      // 勘定科目別レコード件数を取得
      dispatch(fetchAccountCounts(fiscalYear))

      // 勘定科目一覧を取得
      dispatch(fetchAccountList(fiscalYear))
    }
  }, [dispatch, fiscalYear])

  // 検索条件が変更されたときにReduxの検索パラメータを更新し、取引データを取得
  useEffect(() => {
    const searchParams: TransactionSearchParams = {
      nendo: fiscalYear,
      page: currentPage,
      pageSize: pageSize,
    }

    // 勘定科目コードを取得
    const code = getCodeFromAccountId(account)
    if (code) searchParams.code = code

    // 月を設定
    if (month !== 'unset') searchParams.month = month

    // 検索パラメータを更新
    dispatch(updateSearchParams(searchParams))

    // 取引データを取得
    dispatch(fetchTransactions(searchParams))
  }, [dispatch, fiscalYear, account, month, currentPage, pageSize])

  // 勘定科目IDからコードを取得する関数
  const getCodeFromAccountId = (accountId: string): string | null => {
    if (accountId === 'unset') return null

    // マージされた勘定科目データから検索
    if (mergedAccounts.length > 0) {
      const account = mergedAccounts.find((acc) => acc.id === accountId)
      if (account) return account.code
    }

    return null
  }

  // URLパラメータを更新する関数
  const updateUrlParams = (
    nendo?: string,
    code?: string,
    monthValue?: string,
    page?: number,
  ) => {
    const params = new URLSearchParams()

    if (nendo) params.set('nendo', nendo)
    if (code) params.set('code', code)
    if (monthValue) params.set('month', monthValue)
    if (page && page > 1) params.set('page', page.toString())

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl, { scroll: false })
  }

  // 検索条件変更ハンドラー
  const handleFiscalYearChange = (value: string) => {
    setFiscalYear(value)
    // Reduxストアの年度も更新
    dispatch(selectFiscalYearAction(value))

    // 年度が変更されたら、他の条件をリセット
    setAccount('unset')
    setMonth('unset')
    setCurrentPage(1)

    if (value !== 'unset') {
      updateUrlParams(value)
    } else {
      // 未設定の場合はURLパラメータをクリア
      updateUrlParams()
    }
  }

  const handleAccountChange = (value: string) => {
    setAccount(value)
    // 勘定科目が変更されたら、月をリセット
    setMonth('unset')
    setCurrentPage(1)

    // 勘定科目からコード部分を抽出
    const code = getCodeFromAccountId(value)

    if (fiscalYear !== 'unset' && value !== 'unset' && code) {
      updateUrlParams(fiscalYear, code)
    } else if (fiscalYear !== 'unset') {
      updateUrlParams(fiscalYear)
    } else {
      updateUrlParams()
    }
  }

  const handleMonthChange = (value: string) => {
    setMonth(value)
    setCurrentPage(1)

    // 勘定科目からコード部分を抽出
    const code = getCodeFromAccountId(account)

    if (fiscalYear !== 'unset' && account !== 'unset' && code) {
      if (value !== 'unset') {
        updateUrlParams(fiscalYear, code, value)
      } else {
        updateUrlParams(fiscalYear, code)
      }
    }
  }

  // 取引データの更新関数
  const handleUpdateTransaction = (
    id: string,
    field: keyof (typeof transactions)[0],
    value: string | number,
  ) => {
    //dispatch(updateTransaction({ id, field, value }))
  }

  // フォーカスが外れた時のハンドラー
  const handleBlur = (id: string, field: 'date' | 'debit' | 'credit') => {
    //dispatch(setShowTooltip({ id, field }))
  }

  // CSVダウンロード処理
  const handleDownloadCSV = () => {
    // CSVヘッダー
    const headers = [
      '日付',
      '勘定科目コード',
      '相手科目',
      '説明',
      '借方金額',
      '貸方金額',
      '摘要',
      '残高',
    ]

    // 取引データをCSV形式に変換
    const csvData = transactions.map((transaction) => {
      return [
        transaction.date,
        transaction.other_cd,
        transaction.karikata_cd,
        transaction.kasikata_cd,
        transaction.karikata_value,
        transaction.kasikata_value,
        transaction.note,
      ].join(',')
    })

    // ヘッダーとデータを結合
    const csvContent = [headers.join(','), ...csvData].join('\n')

    // BOMを追加してExcelで文字化けしないようにする
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], {
      type: 'text/csv;charset=utf-8',
    })

    // ダウンロードリンクを作成
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 選択された勘定科目からコードを取得
    const accountCode = getCodeFromAccountId(account) || 'unknown'

    link.download = `取引履歴_${fiscalYear}年度_${accountCode}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 成功通知
    toast({
      title: 'CSVファイルをダウンロードしました',
      description: `${fiscalYear}年度 ${accountCode}の取引履歴をCSV形式でダウンロードしました。`,
    })
  }

  // 削除モードの切り替え
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode)
    // 削除モードを終了する場合は選択をクリア
    if (deleteMode) {
      setSelectedRows([])
    }
  }

  // 行の選択状態を切り替え
  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rowId) => rowId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // 削除確認ダイアログを表示
  const handleDeleteClick = () => {
    if (selectedRows.length > 0) {
      setShowDeleteDialog(true)
    } else {
      toast({
        title: '削除する行を選択してください',
        description:
          '削除したい取引の行を選択してから削除ボタンをクリックしてください。',
      })
    }
  }

  // 取引削除処理
  const handleDelete = () => {
    // Reduxアクションで取引を削除
    dispatch(deleteTransactions(selectedRows))

    toast({
      title: '取引を削除しました',
      description: `${selectedRows.length}件の取引を削除しました。`,
    })
    // ダイアログを閉じる
    setShowDeleteDialog(false)
    // 削除モードを終了
    setDeleteMode(false)
    // 選択をクリア
    setSelectedRows([])
  }

  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    const newPage = Math.max(1, Math.min(page, pagination.totalPages))
    setCurrentPage(newPage)

    // 勘定科目からコード部分を抽出
    const code = getCodeFromAccountId(account)

    // URLパラメータを更新
    if (code) {
      if (month !== 'unset') {
        updateUrlParams(fiscalYear, code, month, newPage)
      } else {
        updateUrlParams(fiscalYear, code, undefined, newPage)
      }
    } else {
      updateUrlParams(fiscalYear, undefined, undefined, newPage)
    }
  }

  // ページサイズ変更ハンドラー
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // ページサイズ変更時は1ページ目に戻る
  }

  // 検索条件が有効かどうかを判定
  const isSearchValid = fiscalYear !== 'unset' && account !== 'unset'

  // 選択された勘定科目の表示名を取得
  const getSelectedAccountLabel = () => {
    if (account === 'unset') return ''

    // マージされた勘定科目データから検索
    if (mergedAccounts.length > 0) {
      const selectedAccount = mergedAccounts.find((acc) => acc.id === account)
      if (selectedAccount) return selectedAccount.label
    }

    return ''
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-6">
        <main className="flex-1">
          <div className="mb-6 flex items-center">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              戻る
            </Link>
            <h2 className="text-lg font-bold">元帳</h2>
          </div>

          {/* 元帳検索セクション */}
          <LedgerSearchForm
            fiscalYear={fiscalYear}
            account={account}
            month={month}
            fiscalYears={fiscalYears}
            mergedAccounts={mergedAccounts}
            fiscalYearsLoading={fiscalYearsLoading}
            fiscalYearsError={fiscalYearsError}
            accountListLoading={accountListLoading}
            accountCountsLoading={accountCountsLoading}
            accountListError={accountListError}
            deleteMode={deleteMode}
            selectedRows={selectedRows}
            isSearchValid={isSearchValid}
            onFiscalYearChange={handleFiscalYearChange}
            onAccountChange={handleAccountChange}
            onMonthChange={handleMonthChange}
            onToggleDeleteMode={toggleDeleteMode}
            onDeleteClick={handleDeleteClick}
            onDownloadCSV={handleDownloadCSV}
          />

          {/* 元帳一覧セクション */}
          {isSearchValid ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">元帳一覧</h3>
                  <p className="text-sm text-gray-500">
                    {fiscalYear}年度{' '}
                    {month === 'unset' ? '全期間' : `${month}月`}
                  </p>
                </div>

                <h4 className="text-lg font-medium mb-4">
                  {getSelectedAccountLabel()}
                </h4>

                {transactionLoading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      データを読み込み中...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 取引テーブル */}
                    <TransactionTable
                      transactions={transactions}
                      deleteMode={deleteMode}
                      selectedRows={selectedRows}
                      onToggleRowSelection={toggleRowSelection}
                      onUpdateTransaction={handleUpdateTransaction}
                      onBlur={handleBlur}
                    />

                    {/* ページネーション */}
                    {
                      <Pagination
                        pagination={{
                          totalItems: 100,
                          totalPages: 10,
                          currentPage: 1,
                          pageSize: 10,
                        }}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                      />
                    }
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-gray-500 mb-4">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">
                    データを表示するには検索条件を設定してください
                  </h3>
                </div>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  会計年度と勘定科目を選択すると、取引データが表示されます。月は任意で選択できます。
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        selectedCount={selectedRows.length}
        onOpenChange={setShowDeleteDialog}
        onDelete={handleDelete}
      />
    </TooltipProvider>
  )
}
