'use client'

import { useEffect, useRef, useState } from 'react'

import { AlertCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

import { MergedAccount } from '@/app/ledger/components/types'
import { formatCurrency } from '@/app/ledger/components/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from '@/components/ui/use-toast'
import { CreateLedgerRequest } from '@/lib/backend/services/ledger/create-ledger'
import { LedgerListItem } from '@/lib/backend/services/ledger/list-ledgers'
import { UpdateLedgerRequest } from '@/lib/backend/services/ledger/update-ledger'
import { updateJournalChecked } from '@/lib/redux/features/transactionSlice'
import { useAppDispatch } from '@/lib/redux/hooks'
import { validateField, validateRow } from '@/lib/schemas/ledger-validation'

interface TransactionTableProps {
  ledger_cd: string
  transactions: LedgerListItem[]
  deleteMode: boolean
  selectedRows: string[]
  accountList: MergedAccount[]
  nendo: string
  month?: string | null // 選択された月（nullの場合は制約なし）
  selectedAccountType?: 'L' | 'R' // 選択中の勘定科目のタイプ（L:左側/借方が+、R:右側/貸方が+）
  isCurrentFiscalYear: boolean // 現在の年度かどうか
  onToggleRowSelection: (id: string) => void
  onUpdateTransaction: (transaction: UpdateLedgerRequest) => void
  onBlur: (id: string, field: 'date' | 'debit' | 'credit') => void
  onCreateTransaction: (transaction: CreateLedgerRequest) => void
}

// 編集中のトランザクションデータの型
type EditableTransaction = Record<string, any>

// 日付文字列（YYYYMMDD）から曜日の漢字を取得する関数
const getDayOfWeekKanji = (dateStr: string): string => {
  // 日付が正しいフォーマットでない場合は空文字を返す
  if (!dateStr || !/^\d{8}$/.test(dateStr)) return ''

  try {
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1 // Dateオブジェクトでは月は0から始まる
    const day = parseInt(dateStr.substring(6, 8))

    const date = new Date(year, month, day)

    // 日付が有効かチェック
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return ''
    }

    const dayOfWeek = date.getDay()
    const kanjiDays = ['日', '月', '火', '水', '木', '金', '土']

    return kanjiDays[dayOfWeek]
  } catch (error) {
    return ''
  }
}

// 日付が土日かどうかを判定する関数
const isWeekend = (dateStr: string): boolean => {
  // 日付が正しいフォーマットでない場合はfalseを返す
  if (!dateStr || !/^\d{8}$/.test(dateStr)) return false

  try {
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1 // Dateオブジェクトでは月は0から始まる
    const day = parseInt(dateStr.substring(6, 8))

    const date = new Date(year, month, day)

    // 日付が有効かチェック
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return false
    }

    const dayOfWeek = date.getDay()
    // 0: 日曜日, 6: 土曜日
    return dayOfWeek === 0 || dayOfWeek === 6
  } catch (error) {
    return false
  }
}

export function TransactionTable({
  ledger_cd,
  transactions,
  deleteMode,
  selectedRows,
  accountList,
  nendo,
  month = null,
  selectedAccountType = 'L', // デフォルトはL（借方が+）
  isCurrentFiscalYear,
  onToggleRowSelection,
  onUpdateTransaction,
  onBlur,
  onCreateTransaction,
}: TransactionTableProps) {
  // Reduxディスパッチを取得
  const dispatch = useAppDispatch()
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

  // 検索月に基づいて年月の初期値を設定
  const getInitialDatePrefix = (): string => {
    if (!month || !nendo) return ''

    const monthNum = parseInt(month)
    // 1〜3月は年度+1の年、4〜12月は年度の年
    const year =
      monthNum >= 1 && monthNum <= 3 ? (parseInt(nendo) + 1).toString() : nendo

    // 月を2桁にフォーマット（例：1→01）
    const monthFormatted = monthNum.toString().padStart(2, '0')

    return `${year}${monthFormatted}`
  }

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

  // nendoまたはmonthが変更されたら新規登録用のステートを更新
  useEffect(() => {
    const datePrefix = getInitialDatePrefix()

    setNewTransaction((prev) => ({
      ...prev,
      nendo: nendo,
      date: datePrefix, // 年月の初期値を設定
    }))
  }, [nendo, month])

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
      // 変更の有無をチェック
      const originalTransaction = transactions.find(
        (t) => t.journal_id.toString() === id,
      )
      if (!originalTransaction) return

      // 変更があるかどうかをチェック
      const hasChanges = Object.keys(transaction).some((key) => {
        // 特定のフィールドのみを比較
        const fieldsToCompare = [
          'date',
          'other_cd',
          'karikata_value',
          'kasikata_value',
          'note',
        ]
        if (!fieldsToCompare.includes(key)) return false

        // 数値の場合は数値として比較
        if (key === 'karikata_value' || key === 'kasikata_value') {
          return transaction[key] !== (originalTransaction as any)[key]
        }

        // 文字列の場合は文字列として比較
        return transaction[key] !== (originalTransaction as any)[key]
      })

      // 変更がない場合は処理を終了
      if (!hasChanges) {
        // 編集中リストからも削除
        setEditedRowIds(editedRowIds.filter((rowId) => rowId !== id))
        return
      }

      // 変更がある場合のみバリデーションを実行
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
      onUpdateTransaction({
        id: parseInt(id),
        ledger_cd: ledger_cd,
        nendo: nendo,
        date: transaction.date,
        counter_cd: transaction.other_cd,
        karikata_value: transaction.karikata_value,
        kasikata_value: transaction.kasikata_value,
        note: transaction.note,
        checked: transaction.checked || '0',
      })
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

  // 日付が指定された月に属しているかチェック
  const isDateInSelectedMonth = (dateStr: string): boolean => {
    // 月が指定されていない場合は常にtrue
    if (!month) return true

    // 日付が正しいフォーマットでない場合はfalse
    if (!dateStr || !/^\d{8}$/.test(dateStr)) return false

    const selectedMonth = parseInt(month)
    const inputMonth = parseInt(dateStr.substring(4, 6))

    // 月が一致するかチェック
    return inputMonth === selectedMonth
  }

  // 新規トランザクション用のフィールドのフォーカスアウト時のバリデーション
  const handleNewFieldBlur = (field: string) => {
    // フィールドの値を取得
    const value = newTransaction[field]

    // 日付フィールドで月の選択がある場合、月のチェックを追加
    if (field === 'date' && value && month) {
      if (!isDateInSelectedMonth(value as string)) {
        // 選択された月と日付が一致しない場合はエラーを設定
        setNewTransactionErrors((prev) => ({
          ...prev,
          [field]: `日付は${month}月である必要があります`,
        }))
        return
      }
    }

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
      onCreateTransaction({
        ledger_cd: ledger_cd,
        nendo: nendo,
        date: newTransaction.date,
        counter_cd: newTransaction.other_cd,
        karikata_value: newTransaction.karikata_value,
        kasikata_value: newTransaction.kasikata_value,
        note: newTransaction.note,
        checked: '0',
      })
    }

    // 登録成功後、入力フィールドをクリア
    setNewTransaction({
      date: month ? getInitialDatePrefix() : '',
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
        {!isCurrentFiscalYear && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            <p className="text-sm">
              過去の年度が選択されているため、データは読み取り専用です。
            </p>
          </div>
        )}
        <table className="w-full border-collapse">
          <colgroup>
            {deleteMode && <col className="w-10" />}
            <col className="w-44" />
            <col className="w-20" />
            <col className="w-24" />
            <col className="w-28" />
            <col className="w-28" />
            <col className="w-auto" />
            <col className="w-28" />
            <col className="w-16" />
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
              <th className="pb-2 font-medium">確認</th>
            </tr>
          </thead>
          <tbody>
            {/* 新規登録用の空の入力行を固定で表示する */}
            {isCurrentFiscalYear && (
              <tr className="border-t bg-blue-50">
                {deleteMode && (
                  <td className="py-2 px-1 text-center">
                    {/* 新規登録行には削除チェックボックスは表示しない */}
                  </td>
                )}
                <td className="py-2 px-1 relative">
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-400"></div>
                  <div className="flex gap-1">
                    <div className="flex-1 relative">
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
                    <div className="w-12">
                      <Input
                        type="text"
                        value={getDayOfWeekKanji(newTransaction.date || '')}
                        readOnly
                        tabIndex={-1}
                        className={`h-8 text-sm text-center bg-gray-50 ${
                          isWeekend(newTransaction.date || '')
                            ? 'text-red-600'
                            : ''
                        }`}
                      />
                    </div>
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
                            ref={(el) =>
                              registerNewRowRef('karikata_value', el)
                            }
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
                            ref={(el) =>
                              registerNewRowRef('kasikata_value', el)
                            }
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
                <td className="py-2 px-1 text-right text-gray-500 relative">
                  -
                </td>
                <td className="py-2 px-1 text-center">
                  <Checkbox
                    checked={false}
                    disabled={true}
                    aria-label="新規取引の確認"
                  />
                </td>
              </tr>
            )}
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
                    {deleteMode && isCurrentFiscalYear && (
                      <td className="py-2 px-1 text-center">
                        <Checkbox
                          checked={selectedRows.includes(id)}
                          onCheckedChange={() => onToggleRowSelection(id)}
                          aria-label={`取引 ${id} を選択`}
                        />
                      </td>
                    )}
                    <td className="py-2 px-1 relative">
                      <div className="flex gap-1">
                        <div className="flex-1 relative">
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
                                    handleFieldChange(
                                      id,
                                      'date',
                                      e.target.value,
                                    )
                                  }
                                  onBlur={() => handleFieldBlur(id, 'date')}
                                  ref={(el) => registerInputRef(id, 'date', el)}
                                  className={`h-8 text-sm ${
                                    hasFieldError(id, 'date')
                                      ? 'border-red-500 pl-8'
                                      : ''
                                  }`}
                                  disabled={
                                    !isCurrentFiscalYear ||
                                    editedTransaction.checked === '1'
                                  }
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
                        <div className="w-12">
                          <Input
                            type="text"
                            value={getDayOfWeekKanji(
                              editedTransaction.date || '',
                            )}
                            readOnly
                            tabIndex={-1}
                            className={`h-8 text-sm text-center bg-gray-50 ${
                              isWeekend(editedTransaction.date || '')
                                ? 'text-red-600'
                                : ''
                            }`}
                          />
                        </div>
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
                                disabled={
                                  !isCurrentFiscalYear ||
                                  editedTransaction.checked === '1'
                                }
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
                                disabled={
                                  !isCurrentFiscalYear ||
                                  editedTransaction.checked === '1'
                                }
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
                                disabled={
                                  !isCurrentFiscalYear ||
                                  editedTransaction.checked === '1'
                                }
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
                                disabled={
                                  !isCurrentFiscalYear ||
                                  editedTransaction.checked === '1'
                                }
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
                    <td className="py-2 px-1 text-center">
                      <Checkbox
                        checked={editedTransaction.checked === '1'}
                        onCheckedChange={(checked) => {
                          // ローカルステートを更新
                          handleFieldChange(id, 'checked', checked ? '1' : '0')

                          // 確認状態のみを更新するAPIを呼び出す
                          dispatch(
                            updateJournalChecked({
                              id: parseInt(id),
                              fiscal_year: nendo,
                              checked: checked ? '1' : '0',
                            }),
                          )
                            .unwrap()
                            .then(() => {
                              // 成功時の処理（必要に応じて）
                            })
                            .catch((error) => {
                              // エラー時は元の状態に戻す
                              handleFieldChange(
                                id,
                                'checked',
                                checked ? '0' : '1',
                              )
                              toast({
                                title: 'エラー',
                                description: '確認状態の更新に失敗しました',
                                variant: 'destructive',
                              })
                            })
                        }}
                        aria-label={`取引 ${id} の確認`}
                        disabled={!isCurrentFiscalYear}
                      />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={deleteMode ? 9 : 8}
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
