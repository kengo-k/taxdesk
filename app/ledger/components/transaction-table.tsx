'use client'

import { useEffect, useRef, useState } from 'react'

import { AlertCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

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

import { MergedAccount } from './types'
import { formatCurrency } from './utils'

interface TransactionTableProps {
  transactions: LedgerListItem[]
  deleteMode: boolean
  selectedRows: string[]
  accountList: MergedAccount[]
  nendo: string
  selectedAccountType?: 'L' | 'R' // 選択中の勘定科目のタイプ（L:左側/借方が+、R:右側/貸方が+）
  onToggleRowSelection: (id: string) => void
  onUpdateTransaction: (
    id: string,
    field: keyof LedgerListItem,
    value: string | number,
  ) => void
  onBlur: (id: string, field: 'date' | 'debit' | 'credit') => void
  onCreateTransaction?: (transaction: EditableTransaction) => void
}

// 編集中のトランザクションデータの型
type EditableTransaction = Record<string, any>

export function TransactionTable({
  transactions,
  deleteMode,
  selectedRows,
  accountList,
  nendo,
  selectedAccountType = 'L', // デフォルトはL（借方が+）
  onToggleRowSelection,
  onUpdateTransaction,
  onBlur,
  onCreateTransaction,
}: TransactionTableProps) {
  // ローカルステート
  const [editableTransactions, setEditableTransactions] = useState<
    Record<string, EditableTransaction>
  >({})
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, Record<string, string>>
  >({})
  const [editedRowIds, setEditedRowIds] = useState<string[]>([])

  // 新規登録用のステート
  const [newTransaction, setNewTransaction] = useState<EditableTransaction>({
    date: '',
    other_cd: '',
    account_name: '',
    karikata_value: 0,
    kasikata_value: 0,
    note: '',
    nendo: nendo,
  })
  const [newTransactionErrors, setNewTransactionErrors] = useState<
    Record<string, string>
  >({})

  // フィールドの入力要素への参照を保持
  const inputRefs = useRef<Record<string, Record<string, HTMLInputElement>>>({})
  // 新規登録用の参照
  const newRowRefs = useRef<Record<string, HTMLInputElement>>({})

  // フィールドの表示順序（左から右）
  const fieldOrder = [
    'date',
    'other_cd',
    'karikata_value',
    'kasikata_value',
    'note',
  ]

  // inputRef登録用のコールバック
  const registerInputRef = (
    id: string,
    field: string,
    element: HTMLInputElement | null,
  ) => {
    if (!inputRefs.current[id]) {
      inputRefs.current[id] = {}
    }

    if (element) {
      inputRefs.current[id][field] = element
    }
  }

  // コンポーネントマウント時にトランザクションデータを初期化
  useEffect(() => {
    const initialData: Record<string, EditableTransaction> = {}
    transactions.forEach((transaction) => {
      const id = transaction.journal_id.toString()
      // 既存のデータをコピー
      initialData[id] = {
        ...transaction,
        nendo: nendo,
      }

      // 相手科目コードが存在する場合、初期表示時から名称を設定
      if (transaction.other_cd) {
        const accountName = getAccountName(transaction.other_cd)
        if (accountName) {
          initialData[id].account_name = accountName
        }
      }
    })
    setEditableTransactions(initialData)
  }, [transactions, accountList, nendo])

  // nendoが変更されたら新規登録用のステートを更新
  useEffect(() => {
    setNewTransaction((prev) => ({
      ...prev,
      nendo: nendo,
    }))
  }, [nendo])

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
    setEditableTransactions((prev) => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value,
        },
      }

      // 相手科目が変更された場合、名称をクリア
      if (field === 'other_cd') {
        updated[id].account_name = ''
      }

      return updated
    })

    // エラー状態をクリア（編集されたので）
    clearFieldError(id, field)
  }

  // 科目コードから科目名を取得
  const getAccountName = (code: string): string => {
    if (!code || code.length !== 3) return ''
    const account = accountList.find((a) => a.code === code)
    return account ? account.name : ''
  }

  // 科目コードが存在するかチェック
  const isValidAccountCode = (code: string): boolean => {
    if (!code || code.length !== 3) return false
    return accountList.some((a) => a.code === code)
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

    // 相手科目フィールドがフォーカスアウトされた場合の特別処理
    if (field === 'other_cd' && value) {
      // 科目コードの存在チェック
      if (!isValidAccountCode(value as string)) {
        // エラーを設定
        setFieldErrors((prev) => ({
          ...prev,
          [id]: {
            ...(prev[id] || {}),
            [field]: '存在しない科目コードです',
          },
        }))
        return
      }

      const accountName = getAccountName(value as string)

      // 科目名が見つかった場合は設定、見つからない場合は空にする
      setEditableTransactions((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          account_name: accountName || '',
        },
      }))
    }

    // フィールド値をバリデーション（nendoを追加）
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

      // 最も左にあるエラーフィールドを特定
      const errorFields = Object.keys(result.errors)
      const sortedErrorFields = fieldOrder.filter((field) =>
        errorFields.includes(field),
      )

      // 一番左のエラーフィールドがあれば、そこにフォーカスを当てる
      if (sortedErrorFields.length > 0) {
        const firstErrorField = sortedErrorFields[0]
        setTimeout(() => {
          const inputElement = inputRefs.current[id]?.[firstErrorField]
          if (inputElement) {
            inputElement.focus()
          }
        }, 0)
      }
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

  // 新規トランザクション用のフィールド変更ハンドラ
  const handleNewFieldChange = (field: string, value: string | number) => {
    // 新規登録用のフィールドを更新
    setNewTransaction((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      }

      // 相手科目が変更された場合、名称を更新
      if (field === 'other_cd' && typeof value === 'string') {
        updated.account_name = getAccountName(value)
      }

      return updated
    })

    // エラー状態をクリア
    clearNewFieldError(field)
  }

  // 新規トランザクション用のエラーをクリア
  const clearNewFieldError = (field: string) => {
    setNewTransactionErrors((prev) => {
      const { [field]: _, ...rest } = prev
      return rest
    })
  }

  // 新規トランザクション用のフィールドのフォーカスアウト時のバリデーション
  const handleNewFieldBlur = (field: string) => {
    // フィールドの値を取得
    const value = newTransaction[field]

    // 相手科目フィールドがフォーカスアウトされた場合の特別処理
    if (field === 'other_cd' && value) {
      // 科目コードの存在チェック
      if (!isValidAccountCode(value as string)) {
        // エラーを設定
        setNewTransactionErrors((prev) => ({
          ...prev,
          [field]: '存在しない科目コードです',
        }))
        return
      }

      const accountName = getAccountName(value as string)

      setNewTransaction((prev) => ({
        ...prev,
        account_name: accountName || '',
      }))
    }

    // フィールド値をバリデーション
    const validation = validateField(field, value, newTransaction)

    if (!validation.valid) {
      // エラーを設定
      setNewTransactionErrors((prev) => ({
        ...prev,
        [field]: validation.message || 'Invalid value',
      }))
    } else {
      // エラーをクリア
      clearNewFieldError(field)
    }

    // 摘要フィールドの場合、トランザクション登録を実行
    if (field === 'note') {
      handleSubmitNewTransaction()
    }
  }

  // 新規トランザクションの登録処理
  const handleSubmitNewTransaction = () => {
    // 全体のバリデーション
    const dataToValidate = {
      ...newTransaction,
      nendo: nendo,
    }

    const result = validateRow(dataToValidate)

    if (!result.valid) {
      // エラーを設定
      setNewTransactionErrors(result.errors)

      // 最も左にあるエラーフィールドを特定
      const errorFields = Object.keys(result.errors)
      const sortedErrorFields = fieldOrder.filter((field) =>
        errorFields.includes(field),
      )

      // 一番左のエラーフィールドがあれば、そこにフォーカスを当てる
      if (sortedErrorFields.length > 0) {
        const firstErrorField = sortedErrorFields[0]
        setTimeout(() => {
          const inputElement = newRowRefs.current?.[firstErrorField]
          if (inputElement) {
            inputElement.focus()
          }
        }, 0)
      }
      return
    }

    // 親コンポーネントに新規取引データを渡す
    if (onCreateTransaction) {
      onCreateTransaction(newTransaction)
    }

    // 登録成功後、入力フィールドをクリア
    setNewTransaction({
      date: '',
      other_cd: '',
      account_name: '',
      karikata_value: 0,
      kasikata_value: 0,
      note: '',
      nendo: nendo,
    })

    // エラーもクリア
    setNewTransactionErrors({})
  }

  // 新規登録用inputRef登録コールバック
  const registerNewRowRef = (
    field: string,
    element: HTMLInputElement | null,
  ) => {
    if (element) {
      newRowRefs.current[field] = element
    }
  }

  // 新規フィールドにエラーがあるかチェック
  const hasNewFieldError = (field: string): boolean => {
    return !!newTransactionErrors[field]
  }

  // 新規フィールドのエラーメッセージを取得
  const getNewFieldErrorMessage = (field: string): string => {
    return newTransactionErrors[field] || ''
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
              <th className="pb-2 font-medium">
                借方{' '}
                {selectedAccountType === 'L' ? (
                  <ArrowUpCircle className="inline-block h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownCircle className="inline-block h-4 w-4 text-red-600" />
                )}
              </th>
              <th className="pb-2 font-medium">
                貸方{' '}
                {selectedAccountType === 'L' ? (
                  <ArrowDownCircle className="inline-block h-4 w-4 text-red-600" />
                ) : (
                  <ArrowUpCircle className="inline-block h-4 w-4 text-green-600" />
                )}
              </th>
              <th className="pb-2 font-medium">摘要</th>
              <th className="pb-2 font-medium">残高</th>
            </tr>
          </thead>
          <tbody>
            {/* 新規登録用の空の入力行を固定で表示する */}
            <tr className="border-t bg-blue-50">
              {deleteMode && (
                <td className="py-2 px-1 text-center">
                  {/* 新規登録行には削除チェックボックスは表示しない */}
                </td>
              )}
              <td className="py-2 px-1 relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-400"></div>
                <div className="relative">
                  <Tooltip open={hasNewFieldError('date')}>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        {hasNewFieldError('date') && (
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 z-10">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        )}
                        <Input
                          type="text"
                          value={newTransaction.date || ''}
                          onChange={(e) =>
                            handleNewFieldChange('date', e.target.value)
                          }
                          onBlur={() => handleNewFieldBlur('date')}
                          ref={(el) => registerNewRowRef('date', el)}
                          placeholder="YYYYMMDD"
                          className={`h-8 text-sm ${
                            hasNewFieldError('date')
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
                      {getNewFieldErrorMessage('date')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </td>
              <td className="py-2 px-1 relative">
                <div className="relative">
                  <Tooltip open={hasNewFieldError('other_cd')}>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        {hasNewFieldError('other_cd') && (
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 z-10">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        )}
                        <Input
                          type="text"
                          value={newTransaction.other_cd || ''}
                          onChange={(e) =>
                            handleNewFieldChange('other_cd', e.target.value)
                          }
                          onBlur={() => handleNewFieldBlur('other_cd')}
                          ref={(el) => registerNewRowRef('other_cd', el)}
                          placeholder="コード"
                          className={`h-8 text-sm ${
                            hasNewFieldError('other_cd')
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
                      {getNewFieldErrorMessage('other_cd')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </td>
              <td className="py-2 px-1">
                <Input
                  type="text"
                  value={newTransaction.account_name || ''}
                  readOnly
                  tabIndex={-1}
                  className="h-8 text-sm bg-gray-50"
                />
              </td>
              <td className="py-2 px-1">
                <div className="relative">
                  <Tooltip open={hasNewFieldError('karikata_value')}>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        {hasNewFieldError('karikata_value') && (
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 z-10">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        )}
                        <Input
                          type="text"
                          value={
                            newTransaction.karikata_value > 0
                              ? formatCurrency(newTransaction.karikata_value)
                              : ''
                          }
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(
                              /[^\d]/g,
                              '',
                            )
                            handleNewFieldChange(
                              'karikata_value',
                              numericValue ? Number(numericValue) : 0,
                            )
                          }}
                          onBlur={() => handleNewFieldBlur('karikata_value')}
                          ref={(el) => registerNewRowRef('karikata_value', el)}
                          placeholder="借方金額"
                          className={`h-8 text-sm text-right ${
                            hasNewFieldError('karikata_value')
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
                      {getNewFieldErrorMessage('karikata_value')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </td>
              <td className="py-2 px-1">
                <div className="relative">
                  <Tooltip open={hasNewFieldError('kasikata_value')}>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        {hasNewFieldError('kasikata_value') && (
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 z-10">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        )}
                        <Input
                          type="text"
                          value={
                            newTransaction.kasikata_value > 0
                              ? formatCurrency(newTransaction.kasikata_value)
                              : ''
                          }
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(
                              /[^\d]/g,
                              '',
                            )
                            handleNewFieldChange(
                              'kasikata_value',
                              numericValue ? Number(numericValue) : 0,
                            )
                          }}
                          onBlur={() => handleNewFieldBlur('kasikata_value')}
                          ref={(el) => registerNewRowRef('kasikata_value', el)}
                          placeholder="貸方金額"
                          className={`h-8 text-sm text-right ${
                            hasNewFieldError('kasikata_value')
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
                      {getNewFieldErrorMessage('kasikata_value')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </td>
              <td className="py-2 px-1">
                <div className="relative">
                  <Tooltip open={hasNewFieldError('note')}>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        {hasNewFieldError('note') && (
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 z-10">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        )}
                        <Input
                          type="text"
                          value={newTransaction.note || ''}
                          onChange={(e) =>
                            handleNewFieldChange('note', e.target.value)
                          }
                          onBlur={() => handleNewFieldBlur('note')}
                          ref={(el) => registerNewRowRef('note', el)}
                          name="note"
                          placeholder="摘要を入力"
                          className={`h-8 text-sm ${
                            hasNewFieldError('note')
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
                      {getNewFieldErrorMessage('note')}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </td>
              <td className="py-2 px-1 text-right text-gray-500 relative">-</td>
            </tr>
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
                                ref={(el) => registerInputRef(id, 'date', el)}
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
                                ref={(el) =>
                                  registerInputRef(id, 'other_cd', el)
                                }
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
                        value={editedTransaction.account_name || ''}
                        readOnly
                        tabIndex={-1}
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
                                ref={(el) =>
                                  registerInputRef(id, 'karikata_value', el)
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
                                ref={(el) =>
                                  registerInputRef(id, 'kasikata_value', el)
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
                                ref={(el) => registerInputRef(id, 'note', el)}
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
