'use client'

import { useEffect, useState } from 'react'

import { AlertCircle } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { validateField, validateRow } from '@/lib/schemas/ledger-validation'
import { LedgerListItem } from '@/lib/services/ledger/list-ledgers'

import { formatCurrency } from './utils'

interface TransactionTableProps {
  transactions: LedgerListItem[]
  deleteMode: boolean
  selectedRows: string[]
  onToggleRowSelection: (id: string) => void
  onUpdateTransaction: (
    id: string,
    field: keyof LedgerListItem,
    value: string | number,
  ) => void
  onBlur: (id: string, field: 'date' | 'debit' | 'credit') => void
}

// 編集中のトランザクションデータの型
type EditableTransaction = Record<string, any>

export function TransactionTable({
  transactions,
  deleteMode,
  selectedRows,
  onToggleRowSelection,
  onUpdateTransaction,
  onBlur,
}: TransactionTableProps) {
  // ローカルステート
  const [editableTransactions, setEditableTransactions] = useState<
    Record<string, EditableTransaction>
  >({})
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, Record<string, string>>
  >({})
  const [editedRowIds, setEditedRowIds] = useState<string[]>([])

  // コンポーネントマウント時にトランザクションデータを初期化
  useEffect(() => {
    const initialData: Record<string, EditableTransaction> = {}
    transactions.forEach((transaction) => {
      const id = transaction.journal_id.toString()
      initialData[id] = { ...transaction }
    })
    setEditableTransactions(initialData)
  }, [transactions])

  // フィールド値の変更ハンドラ
  const handleFieldChange = (
    id: string,
    field: string,
    value: string | number,
  ) => {
    // 編集中の行としてマーク
    if (!editedRowIds.includes(id)) {
      setEditedRowIds([...editedRowIds, id])
    }

    // 対応するフィールドを更新
    setEditableTransactions((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))

    // エラー状態をクリア（編集されたので）
    clearFieldError(id, field)
  }

  // エラーをクリア
  const clearFieldError = (id: string, field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev }
      if (newErrors[id]) {
        const { [field]: _, ...rest } = newErrors[id]
        newErrors[id] = rest
        if (Object.keys(newErrors[id]).length === 0) {
          delete newErrors[id]
        }
      }
      return newErrors
    })
  }

  // フィールドのフォーカスアウト時のバリデーション
  const handleFieldBlur = (id: string, field: string) => {
    const transaction = editableTransactions[id]
    if (!transaction) return

    // フィールドの値を取得
    const value = transaction[field]

    // フィールド値をバリデーション
    const validation = validateField(field, value, transaction)

    if (!validation.valid) {
      // エラーを設定
      setFieldErrors((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          [field]: validation.message || 'Invalid value',
        },
      }))
    } else {
      // エラーをクリア
      clearFieldError(id, field)
    }

    // 摘要フィールドの場合、行全体のバリデーションも実行
    if (field === 'note') {
      validateEntireRow(id)
    }
  }

  // 行全体のバリデーション
  const validateEntireRow = (id: string) => {
    const transaction = editableTransactions[id]
    if (!transaction) return

    // データを整形（バリデーションに必要なフィールドを追加）
    const dataToValidate = {
      ...transaction,
      // トランザクションデータに必要なフィールドが欠けている場合、追加する
      nendo: transaction.nendo || '2023', // 仮の値、実際の処理では適切な値を設定
    }

    const result = validateRow(dataToValidate)

    if (!result.valid) {
      // エラーを設定
      setFieldErrors((prev) => ({
        ...prev,
        [id]: result.errors,
      }))
    } else {
      // 全てのエラーをクリア
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })

      // 編集済みリストから削除（更新成功とみなす）
      setEditedRowIds(editedRowIds.filter((rowId) => rowId !== id))

      // ここで将来的に更新APIを呼び出す
      // onUpdateRow(id, transaction)
    }
  }

  // フィールドにエラーがあるかチェック
  const hasFieldError = (id: string, field: string): boolean => {
    return !!(fieldErrors[id] && fieldErrors[id][field])
  }

  // フィールドのエラーメッセージを取得
  const getFieldErrorMessage = (id: string, field: string): string => {
    return fieldErrors[id]?.[field] || ''
  }

  // 行が編集中かどうかをチェック
  const isRowEdited = (id: string): boolean => {
    return editedRowIds.includes(id)
  }

  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <colgroup>
            {deleteMode && <col className="w-10" />}
            <col className="w-32" />
            <col className="w-20" />
            <col className="w-24" />
            <col className="w-28" />
            <col className="w-28" />
            <col className="w-auto" />
            <col className="w-28" />
          </colgroup>
          <thead>
            <tr className="text-center text-sm">
              {deleteMode && <th className="pb-2 font-medium"></th>}
              <th className="pb-2 font-medium">日付</th>
              <th className="pb-2 font-medium">相手科目</th>
              <th className="pb-2 font-medium">名称</th>
              <th className="pb-2 font-medium">借方 [-]</th>
              <th className="pb-2 font-medium">貸方 [+]</th>
              <th className="pb-2 font-medium">摘要</th>
              <th className="pb-2 font-medium">残高</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => {
                const id = transaction.journal_id.toString()
                const editedTransaction =
                  editableTransactions[id] || transaction
                const isEdited = isRowEdited(id)

                return (
                  <tr
                    key={id}
                    className={`border-t ${isEdited ? 'bg-amber-50' : ''}`}
                  >
                    {deleteMode && (
                      <td className="py-2 px-1 text-center">
                        <Checkbox
                          checked={selectedRows.includes(id)}
                          onCheckedChange={() => onToggleRowSelection(id)}
                          aria-label={`取引 ${id} を選択`}
                        />
                      </td>
                    )}
                    <td className="py-2 px-1 relative">
                      {isEdited && (
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-amber-400"></div>
                      )}
                      <div className="relative">
                        <Tooltip open={hasFieldError(id, 'date')}>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              {hasFieldError(id, 'date') && (
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 z-10">
                                  <AlertCircle className="h-4 w-4" />
                                </div>
                              )}
                              <Input
                                type="text"
                                value={editedTransaction.date || ''}
                                onChange={(e) =>
                                  handleFieldChange(id, 'date', e.target.value)
                                }
                                onBlur={() => handleFieldBlur(id, 'date')}
                                className={`h-8 text-sm ${
                                  hasFieldError(id, 'date')
                                    ? 'border-red-500 pl-8'
                                    : ''
                                }`}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="start"
                            sideOffset={5}
                            alignOffset={0}
                            className="bg-red-50 text-red-800 border border-red-200 z-50"
                          >
                            {getFieldErrorMessage(id, 'date')}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                    <td className="py-2 px-1 relative">
                      <div className="relative">
                        <Tooltip open={hasFieldError(id, 'other_cd')}>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              {hasFieldError(id, 'other_cd') && (
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 z-10">
                                  <AlertCircle className="h-4 w-4" />
                                </div>
                              )}
                              <Input
                                type="text"
                                value={editedTransaction.other_cd || ''}
                                onChange={(e) =>
                                  handleFieldChange(
                                    id,
                                    'other_cd',
                                    e.target.value,
                                  )
                                }
                                onBlur={() => handleFieldBlur(id, 'other_cd')}
                                className={`h-8 text-sm ${
                                  hasFieldError(id, 'other_cd')
                                    ? 'border-red-500 pl-8'
                                    : ''
                                }`}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="start"
                            sideOffset={5}
                            alignOffset={0}
                            className="bg-red-50 text-red-800 border border-red-200 z-50"
                          >
                            {getFieldErrorMessage(id, 'other_cd')}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="text"
                        value={''}
                        readOnly
                        className="h-8 text-sm bg-gray-50"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <div className="relative">
                        <Tooltip open={hasFieldError(id, 'karikata_value')}>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              {hasFieldError(id, 'karikata_value') && (
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 z-10">
                                  <AlertCircle className="h-4 w-4" />
                                </div>
                              )}
                              <Input
                                type="text"
                                value={
                                  editedTransaction.karikata_value > 0
                                    ? formatCurrency(
                                        editedTransaction.karikata_value,
                                      )
                                    : ''
                                }
                                onChange={(e) => {
                                  const numericValue = e.target.value.replace(
                                    /[^\d]/g,
                                    '',
                                  )
                                  handleFieldChange(
                                    id,
                                    'karikata_value',
                                    numericValue ? Number(numericValue) : 0,
                                  )
                                }}
                                onBlur={() =>
                                  handleFieldBlur(id, 'karikata_value')
                                }
                                className={`h-8 text-sm text-right ${
                                  hasFieldError(id, 'karikata_value')
                                    ? 'border-red-500 pl-8'
                                    : ''
                                }`}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="start"
                            sideOffset={5}
                            alignOffset={0}
                            className="bg-red-50 text-red-800 border border-red-200 z-50"
                          >
                            {getFieldErrorMessage(id, 'karikata_value')}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                    <td className="py-2 px-1">
                      <div className="relative">
                        <Tooltip open={hasFieldError(id, 'kasikata_value')}>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              {hasFieldError(id, 'kasikata_value') && (
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 z-10">
                                  <AlertCircle className="h-4 w-4" />
                                </div>
                              )}
                              <Input
                                type="text"
                                value={
                                  editedTransaction.kasikata_value > 0
                                    ? formatCurrency(
                                        editedTransaction.kasikata_value,
                                      )
                                    : ''
                                }
                                onChange={(e) => {
                                  const numericValue = e.target.value.replace(
                                    /[^\d]/g,
                                    '',
                                  )
                                  handleFieldChange(
                                    id,
                                    'kasikata_value',
                                    numericValue ? Number(numericValue) : 0,
                                  )
                                }}
                                onBlur={() =>
                                  handleFieldBlur(id, 'kasikata_value')
                                }
                                className={`h-8 text-sm text-right ${
                                  hasFieldError(id, 'kasikata_value')
                                    ? 'border-red-500 pl-8'
                                    : ''
                                }`}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="start"
                            sideOffset={5}
                            alignOffset={0}
                            className="bg-red-50 text-red-800 border border-red-200 z-50"
                          >
                            {getFieldErrorMessage(id, 'kasikata_value')}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                    <td className="py-2 px-1">
                      <div className="relative">
                        <Tooltip open={hasFieldError(id, 'note')}>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              {hasFieldError(id, 'note') && (
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 z-10">
                                  <AlertCircle className="h-4 w-4" />
                                </div>
                              )}
                              <Input
                                type="text"
                                value={editedTransaction.note || ''}
                                onChange={(e) =>
                                  handleFieldChange(id, 'note', e.target.value)
                                }
                                onBlur={(e) => {
                                  handleFieldBlur(id, 'note')
                                }}
                                name="note"
                                className={`h-8 text-sm ${
                                  hasFieldError(id, 'note')
                                    ? 'border-red-500 pl-8'
                                    : ''
                                }`}
                                placeholder="摘要を入力"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="start"
                            sideOffset={5}
                            alignOffset={0}
                            className="bg-red-50 text-red-800 border border-red-200 z-50"
                          >
                            {getFieldErrorMessage(id, 'note')}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                    <td className="py-2 px-1 text-right text-green-600 relative">
                      {formatCurrency(transaction.acc)}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={deleteMode ? 8 : 7}
                  className="py-8 text-center text-gray-500"
                >
                  該当する取引データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  )
}
