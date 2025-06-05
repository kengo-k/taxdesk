'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// コンポーネントのインポート
import { AlertCircle, ArrowLeft } from 'lucide-react'

import { DeleteConfirmDialog } from '@/app/ledger/components/delete-confirm-dialog'
import { LedgerSearchForm } from '@/app/ledger/components/ledger-search-form'
import { Pagination } from '@/app/ledger/components/pagination'
import { TransactionTable } from '@/app/ledger/components/transaction-table'
import { Card, CardContent } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { toast } from '@/components/ui/use-toast'
import { UpdateLedgerRequest } from '@/lib/backend/services/ledger/update-ledger'
import {
  clearLedgers,
  createLedger,
  deleteLedgers,
  fetchLedgerCountsByAccount,
  fetchLedgers,
  selectAccountCounts,
  selectLedgerList,
  updateLedger,
} from '@/lib/redux/features/ledgerSlice'
import {
  fetchAccountList,
  fetchFiscalYears,
  selectAccountList,
  selectFiscalYears,
} from '@/lib/redux/features/masterSlice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'

export default function LedgerPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Reduxから年度データを取得
  const {
    data: fiscalYears,
    loading: fiscalYearsLoading,
    error: fiscalYearsError,
  } = useAppSelector(selectFiscalYears)

  // Reduxから勘定科目一覧を取得
  const {
    data: accountList,
    loading: accountListLoading,
    error: accountListError,
  } = useAppSelector(selectAccountList)

  // Reduxから取引データを取得
  const {
    list: ledgerList,
    count: ledgerListCount,
    loading: ledgerListLoading,
  } = useAppSelector(selectLedgerList)

  // Reduxから勘定科目別レコード件数を取得
  const { data: accountCounts, loading: accountCountsLoading } =
    useAppSelector(selectAccountCounts)

  // URLパラメータから初期値を取得
  const searchParams = useSearchParams()
  const nendoParam = searchParams.get('nendo')
  const codeParam = searchParams.get('code')
  const monthParam = searchParams.get('month')
  const checkedParam = searchParams.get('checked')
  const noteParam = searchParams.get('note')
  const pageNoParam = searchParams.get('pageno')
  const pageSizeParam = searchParams.get('pagesize')

  // 検索条件の状態
  const [fiscalYear, setFiscalYear] = useState<string | null>(nendoParam)
  const [account, setAccount] = useState<string | null>(codeParam)
  const [month, setMonth] = useState<string | null>(monthParam)
  const [checked, setChecked] = useState<string | null>(checkedParam) // '0'=未確認, '1'=確認済み, null=指定なし
  const [note, setNote] = useState<string | null>(noteParam) // 摘要（部分一致検索）

  const [currentPage, setCurrentPage] = useState(
    pageNoParam ? Number.parseInt(pageNoParam, 10) : 1,
  )
  const [pageSize, setPageSize] = useState(
    pageSizeParam ? Number.parseInt(pageSizeParam, 10) : 10,
  )

  // 削除モード関連の状態
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // 年度一覧がストアにない場合は取得する
  useEffect(() => {
    if (fiscalYears.length === 0 && !fiscalYearsLoading) {
      dispatch(fetchFiscalYears())
    }
  }, [fiscalYears.length, fiscalYearsLoading])

  useEffect(() => {
    updateUrlParams()
    if (fiscalYear == null) {
      setAccount(null)
      setMonth(null)
      setChecked(null)
      setNote(null)
      setCurrentPage(1)
      dispatch(clearLedgers())
      // TODO ストアの勘定科目一覧をクリアする
      return
    }
    // 年度が変更された時に勘定科目一覧(件数付き)を取得する
    dispatch(fetchLedgerCountsByAccount(fiscalYear))

    if (account == null) {
      setMonth(null)
      setChecked(null)
      setNote(null)
      setCurrentPage(1)
      dispatch(clearLedgers())
      return
    }

    dispatch(
      fetchLedgers({
        nendo: fiscalYear,
        code: account,
        month: month,
        checked: checked,
        note: note,
        page: currentPage,
        pageSize: pageSize,
      }),
    )
  }, [fiscalYear, account, month, checked, note, currentPage, pageSize])

  // 勘定科目一覧と勘定科目別レコード件数をマージ
  const mergedAccounts = useMemo(() => {
    const countMap = new Map<string, number>()
    const checkedCountMap = new Map<string, number>()
    accountCounts.forEach((item) => {
      countMap.set(item.saimoku_cd, item.count)
      checkedCountMap.set(item.saimoku_cd, item.checked_count)
    })

    return accountList.map((account) => {
      const count = countMap.get(account.code) || 0
      const checked_count = checkedCountMap.get(account.code) || 0
      return {
        id: account.id,
        code: account.code,
        name: account.name,
        label: `${account.code}: ${account.name} (${checked_count} / ${count})`,
      }
    })
  }, [accountList, accountCounts])

  // 初期表示時または年度変更時に勘定科目データを取得
  useEffect(() => {
    if (fiscalYear != null) {
      // 勘定科目別レコード件数を取得
      dispatch(fetchLedgerCountsByAccount(fiscalYear))

      // 勘定科目一覧を取得
      dispatch(fetchAccountList(fiscalYear))
    }
  }, [dispatch, fiscalYear])

  // URLパラメータを更新する関数
  const updateUrlParams = () => {
    const params = new URLSearchParams()
    if (fiscalYear) {
      params.set('nendo', fiscalYear)
    }
    if (account) {
      params.set('code', account)
    }
    if (month) {
      params.set('month', month)
    }
    if (checked) {
      params.set('checked', checked)
    }
    if (note) {
      params.set('note', note)
    }
    if (currentPage) {
      params.set('pageno', currentPage.toString())
    }
    if (pageSize) {
      params.set('pagesize', pageSize.toString())
    }
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl, { scroll: false })
  }

  // 年度条件を変更した時のハンドラー
  const handleFiscalYearChange = (value: string) => {
    setAccount(null)
    setMonth(null)
    setCurrentPage(1)
    if (value === 'none') {
      setFiscalYear(null)
    } else {
      setFiscalYear(value)
    }
    updateUrlParams()
  }

  // 勘定科目を変更した時のハンドラー
  const handleAccountChange = (value: string) => {
    setMonth(null)
    setCurrentPage(1)
    if (value === 'none') {
      setAccount(null)
    } else {
      setAccount(value)
    }
    updateUrlParams()
  }

  // 月を変更した時のハンドラー
  const handleMonthChange = (value: string) => {
    setCurrentPage(1)
    if (value === 'none') {
      setMonth(null)
    } else {
      setMonth(value)
    }
    updateUrlParams()
  }

  // 確認状態を変更した時のハンドラー
  const handleCheckedChange = (value: string) => {
    setCurrentPage(1)
    if (value === 'none') {
      setChecked(null)
    } else {
      setChecked(value)
    }

    // 検索条件が変更されたら取引データを再取得
    if (fiscalYear && account) {
      dispatch(
        fetchLedgers({
          nendo: fiscalYear,
          code: account,
          month: month,
          checked: value === 'none' ? null : value,
          note: note,
          page: currentPage,
          pageSize: pageSize,
        }),
      )
    }
  }

  // 摘要を変更した時のハンドラー
  const handleNoteChange = (value: string) => {
    setCurrentPage(1)
    setNote(value === '' ? null : value)

    // 検索条件が変更されたら取引データを再取得
    if (fiscalYear && account) {
      dispatch(
        fetchLedgers({
          nendo: fiscalYear,
          code: account,
          month: month,
          checked: checked,
          note: value === '' ? null : value,
          page: currentPage,
          pageSize: pageSize,
        }),
      )
    }
  }

  // 新規取引作成ハンドラー
  const handleCreateTransaction = async (transaction: any) => {
    dispatch(createLedger(transaction))
      .unwrap()
      .then(() => {
        if (fiscalYear) {
          dispatch(
            fetchLedgers({
              nendo: fiscalYear,
              code: account,
              month: month,
              checked: checked,
              note: note,
              page: currentPage,
              pageSize: pageSize,
            }),
          )
        }
      })
      .catch((error) => {
        console.error('取引作成エラー:', error)
      })
  }

  // 取引データの更新関数
  const handleUpdateTransaction = (transaction: UpdateLedgerRequest) => {
    dispatch(updateLedger(transaction))
      .unwrap()
      .then(() => {
        if (fiscalYear) {
          dispatch(
            fetchLedgers({
              nendo: fiscalYear,
              code: account,
              month: month,
              checked: checked,
              note: note,
              page: currentPage,
              pageSize: pageSize,
            }),
          )
        }
      })
      .catch((error) => {
        console.error('取引作成エラー:', error)
      })
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
    const csvData = ledgerList.map((ledger) => {
      return [
        ledger.date,
        ledger.other_cd,
        ledger.karikata_cd,
        ledger.kasikata_cd,
        ledger.karikata_value,
        ledger.kasikata_value,
        ledger.note,
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
    const accountCode = 'XX'

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
    dispatch(
      deleteLedgers({
        fiscal_year: fiscalYear || '',
        ids: selectedRows.map((id) => parseInt(id)),
      }),
    )

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
    const newPage = Math.max(
      1,
      Math.min(page, Math.ceil(ledgerListCount / pageSize)),
    )
    setCurrentPage(newPage)
    updateUrlParams()
  }

  // ページサイズ変更ハンドラー
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    updateUrlParams()
  }

  // 検索条件が有効かどうかを判定
  const isSearchValid = fiscalYear != null && account != null

  // 選択された勘定科目の表示名を取得
  const getSelectedAccountLabel = () => {
    if (account == null) {
      return ''
    }

    // マージされた勘定科目データから検索
    if (mergedAccounts.length > 0) {
      const selectedAccount = mergedAccounts.find((acc) => acc.code === account)
      if (selectedAccount) {
        return selectedAccount.name
      }
    }

    return ''
  }

  // 選択された勘定科目の勘定科目区分タイプ（L/R）を取得
  const getSelectedAccountType = (): 'L' | 'R' => {
    if (account == null) {
      return 'L' // デフォルト値
    }

    // アカウントリストから該当するアカウントを検索
    const selectedAccount = accountList.find((acc) => acc.code === account)
    if (selectedAccount && selectedAccount.kamoku_bunrui_type) {
      // L（左側：借方増加）またはR（右側：貸方増加）を返す
      return selectedAccount.kamoku_bunrui_type === 'L' ? 'L' : 'R'
    }

    return 'L' // デフォルト値
  }

  const handleDeleteLedgers = async (ids: string[]) => {
    try {
      await dispatch(
        deleteLedgers({
          fiscal_year: fiscalYear || '',
          ids: ids.map((id) => parseInt(id)),
        }),
      ).unwrap()
      toast({
        title: '削除完了',
        description: `${ids.length}件の取引を削除しました`,
      })
      // 選択状態をクリア
      setSelectedRows([])
      // 取引一覧を再取得
      await dispatch(
        fetchLedgers({
          nendo: fiscalYear || '',
          code: account,
          month: month || null,
          checked: checked,
          note: note,
          page: currentPage,
          pageSize,
        }),
      )
    } catch (error) {
      toast({
        title: 'エラー',
        description: '取引の削除に失敗しました',
        variant: 'destructive',
      })
    }
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
            checked={checked}
            note={note}
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
            isCurrentFiscalYear={
              fiscalYears.find((fy) => fy.id === fiscalYear)?.isCurrent || false
            }
            onFiscalYearChange={handleFiscalYearChange}
            onAccountChange={handleAccountChange}
            onMonthChange={handleMonthChange}
            onCheckedChange={handleCheckedChange}
            onNoteChange={handleNoteChange}
            onToggleDeleteMode={toggleDeleteMode}
            onDeleteClick={handleDeleteClick}
            onDownloadCSV={handleDownloadCSV}
            onDeleteTransactions={handleDeleteLedgers}
          />

          {/* 元帳一覧セクション */}
          {isSearchValid ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">元帳一覧</h3>
                  <p className="text-sm text-gray-500">
                    {fiscalYear}年度 {month == null ? '全期間' : `${month}月`}
                  </p>
                </div>

                <h4 className="text-lg font-medium mb-4">
                  {getSelectedAccountLabel()}
                </h4>

                {ledgerListLoading ? (
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
                      ledger_cd={account}
                      transactions={ledgerList}
                      deleteMode={deleteMode}
                      selectedRows={selectedRows}
                      accountList={mergedAccounts}
                      nendo={fiscalYear || ''}
                      month={month}
                      selectedAccountType={getSelectedAccountType()}
                      isCurrentFiscalYear={
                        fiscalYears.find((fy) => fy.id === fiscalYear)
                          ?.isCurrent || false
                      }
                      onToggleRowSelection={toggleRowSelection}
                      onUpdateTransaction={handleUpdateTransaction}
                      onBlur={handleBlur}
                      onCreateTransaction={handleCreateTransaction}
                    />

                    {/* ページネーション */}
                    <Pagination
                      totalItems={ledgerListCount}
                      totalPages={Math.ceil(ledgerListCount / pageSize)}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                    />
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
