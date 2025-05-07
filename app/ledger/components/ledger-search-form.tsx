'use client'

import { Download, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { MergedAccount } from './types'

interface LedgerSearchFormProps {
  fiscalYear: string | null
  account: string | null
  month: string | null
  fiscalYears: { id: string; label: string }[]
  mergedAccounts: MergedAccount[]
  fiscalYearsLoading: boolean
  fiscalYearsError: string | null
  accountListLoading: boolean
  accountCountsLoading: boolean
  accountListError: string | null
  deleteMode: boolean
  selectedRows: string[]
  isSearchValid: boolean
  onFiscalYearChange: (value: string) => void
  onAccountChange: (value: string) => void
  onMonthChange: (value: string) => void
  onToggleDeleteMode: () => void
  onDeleteClick: () => void
  onDownloadCSV: () => void
}

export function LedgerSearchForm({
  fiscalYear,
  account,
  month,
  fiscalYears,
  mergedAccounts,
  fiscalYearsLoading,
  fiscalYearsError,
  accountListLoading,
  accountCountsLoading,
  accountListError,
  deleteMode,
  selectedRows,
  isSearchValid,
  onFiscalYearChange,
  onAccountChange,
  onMonthChange,
  onToggleDeleteMode,
  onDeleteClick,
  onDownloadCSV,
}: LedgerSearchFormProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h3 className="font-bold mb-2">元帳検索</h3>
        <p className="text-sm text-gray-500 mb-4">
          表示する元帳の条件を指定してください
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              会計年度
            </label>
            {fiscalYearsLoading ? (
              <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
            ) : fiscalYearsError ? (
              <div className="text-sm text-red-500">
                {fiscalYearsError}
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={() => window.location.reload()}
                >
                  再読み込み
                </Button>
              </div>
            ) : (
              <Select
                value={fiscalYear ?? ''}
                onValueChange={onFiscalYearChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="会計年度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">未設定</SelectItem>
                  {fiscalYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              勘定科目
            </label>
            {accountListLoading || accountCountsLoading ? (
              <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
            ) : accountListError ? (
              <div className="text-sm text-red-500">
                {accountListError}
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={() => window.location.reload()}
                >
                  再読み込み
                </Button>
              </div>
            ) : (
              <Select
                value={account ?? ''}
                onValueChange={onAccountChange}
                disabled={fiscalYear === ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="勘定科目を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">未設定</SelectItem>
                  {Array.isArray(mergedAccounts) &&
                    mergedAccounts.length > 0 &&
                    mergedAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              月
            </label>
            <Select
              value={month ?? ''}
              onValueChange={onMonthChange}
              disabled={fiscalYear === '' || account === ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="月を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">未設定</SelectItem>
                <SelectItem value="4">4月</SelectItem>
                <SelectItem value="5">5月</SelectItem>
                <SelectItem value="6">6月</SelectItem>
                <SelectItem value="7">7月</SelectItem>
                <SelectItem value="8">8月</SelectItem>
                <SelectItem value="9">9月</SelectItem>
                <SelectItem value="10">10月</SelectItem>
                <SelectItem value="11">11月</SelectItem>
                <SelectItem value="12">12月</SelectItem>
                <SelectItem value="1">1月</SelectItem>
                <SelectItem value="2">2月</SelectItem>
                <SelectItem value="3">3月</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          {deleteMode ? (
            <>
              <Button
                variant="outline"
                onClick={onToggleDeleteMode}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                削除モード終了
              </Button>
              <Button
                variant="destructive"
                onClick={onDeleteClick}
                className="gap-1"
                disabled={selectedRows.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                選択した行を削除 ({selectedRows.length})
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onToggleDeleteMode}
                className="gap-1"
                disabled={!isSearchValid}
              >
                <Trash2 className="h-4 w-4" />
                削除モード
              </Button>
              <Button
                variant="outline"
                onClick={onDownloadCSV}
                className="gap-1"
                disabled={!isSearchValid}
              >
                <Download className="h-4 w-4" />
                CSV形式でダウンロード
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
