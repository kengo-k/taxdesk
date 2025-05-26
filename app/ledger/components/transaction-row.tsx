import { memo } from 'react'

import { AlertCircle } from 'lucide-react'

import { formatCurrency } from '@/app/ledger/components/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { LedgerListItem } from '@/lib/backend/services/ledger/list-ledgers'

interface TransactionRowProps {
  transaction: LedgerListItem
  editedTransaction: Record<string, any>
  isEdited: boolean
  deleteMode: boolean
  isCurrentFiscalYear: boolean
  selectedRows: string[]
  hasFieldError: (id: string, field: string) => boolean
  getFieldErrorMessage: (id: string, field: string) => string
  handleFieldChange: (id: string, field: string, value: string | number) => void
  handleFieldBlur: (id: string, field: string) => void
  registerInputRef: (
    id: string,
    field: string,
    element: HTMLInputElement | null,
  ) => void
  onToggleRowSelection: (id: string) => void
  onCheckedChange: (id: string, checked: boolean) => void
  getDayOfWeekKanji: (dateStr: string) => string
  isWeekend: (dateStr: string) => boolean
}

// カスタム比較関数を定義
const arePropsEqual = (
  prevProps: TransactionRowProps,
  nextProps: TransactionRowProps,
) => {
  const id = prevProps.transaction.journal_id.toString()

  // 基本的な比較
  if (
    prevProps.isEdited !== nextProps.isEdited ||
    prevProps.deleteMode !== nextProps.deleteMode ||
    prevProps.isCurrentFiscalYear !== nextProps.isCurrentFiscalYear ||
    prevProps.selectedRows.includes(id) !== nextProps.selectedRows.includes(id)
  ) {
    return false
  }

  // 編集されたトランザクションの比較
  const prevEdited = prevProps.editedTransaction
  const nextEdited = nextProps.editedTransaction
  if (
    prevEdited.date !== nextEdited.date ||
    prevEdited.other_cd !== nextEdited.other_cd ||
    prevEdited.karikata_value !== nextEdited.karikata_value ||
    prevEdited.kasikata_value !== nextEdited.kasikata_value ||
    prevEdited.note !== nextEdited.note ||
    prevEdited.checked !== nextEdited.checked
  ) {
    return false
  }

  // エラー状態の比較
  const fields = [
    'date',
    'other_cd',
    'karikata_value',
    'kasikata_value',
    'note',
  ]
  for (const field of fields) {
    if (
      prevProps.hasFieldError(id, field) !==
        nextProps.hasFieldError(id, field) ||
      prevProps.getFieldErrorMessage(id, field) !==
        nextProps.getFieldErrorMessage(id, field)
    ) {
      return false
    }
  }

  return true
}

export const TransactionRow = memo(function TransactionRow({
  transaction,
  editedTransaction,
  isEdited,
  deleteMode,
  isCurrentFiscalYear,
  selectedRows,
  hasFieldError,
  getFieldErrorMessage,
  handleFieldChange,
  handleFieldBlur,
  registerInputRef,
  onToggleRowSelection,
  onCheckedChange,
  getDayOfWeekKanji,
  isWeekend,
}: TransactionRowProps) {
  const id = transaction.journal_id.toString()

  return (
    <tr key={id} className={`border-t ${isEdited ? 'bg-amber-50' : ''}`}>
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
                      handleFieldChange(id, 'date', e.target.value)
                    }
                    onBlur={() => handleFieldBlur(id, 'date')}
                    ref={(el) => registerInputRef(id, 'date', el)}
                    className={`h-8 text-sm ${
                      hasFieldError(id, 'date') ? 'border-red-500 pl-8' : ''
                    }`}
                    disabled={
                      !isCurrentFiscalYear || editedTransaction.checked === '1'
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
              value={getDayOfWeekKanji(editedTransaction.date || '')}
              readOnly
              tabIndex={-1}
              className={`h-8 text-sm text-center bg-gray-50 ${
                isWeekend(editedTransaction.date || '') ? 'text-red-600' : ''
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
                    handleFieldChange(id, 'other_cd', e.target.value)
                  }
                  onBlur={() => handleFieldBlur(id, 'other_cd')}
                  ref={(el) => registerInputRef(id, 'other_cd', el)}
                  className={`h-8 text-sm ${
                    hasFieldError(id, 'other_cd') ? 'border-red-500 pl-8' : ''
                  }`}
                  disabled={
                    !isCurrentFiscalYear || editedTransaction.checked === '1'
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
                      ? formatCurrency(editedTransaction.karikata_value)
                      : ''
                  }
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^\d]/g, '')
                    handleFieldChange(
                      id,
                      'karikata_value',
                      numericValue ? Number(numericValue) : 0,
                    )
                  }}
                  onBlur={() => handleFieldBlur(id, 'karikata_value')}
                  ref={(el) => registerInputRef(id, 'karikata_value', el)}
                  className={`h-8 text-sm text-right ${
                    hasFieldError(id, 'karikata_value')
                      ? 'border-red-500 pl-8'
                      : ''
                  }`}
                  disabled={
                    !isCurrentFiscalYear || editedTransaction.checked === '1'
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
                      ? formatCurrency(editedTransaction.kasikata_value)
                      : ''
                  }
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^\d]/g, '')
                    handleFieldChange(
                      id,
                      'kasikata_value',
                      numericValue ? Number(numericValue) : 0,
                    )
                  }}
                  onBlur={() => handleFieldBlur(id, 'kasikata_value')}
                  ref={(el) => registerInputRef(id, 'kasikata_value', el)}
                  className={`h-8 text-sm text-right ${
                    hasFieldError(id, 'kasikata_value')
                      ? 'border-red-500 pl-8'
                      : ''
                  }`}
                  disabled={
                    !isCurrentFiscalYear || editedTransaction.checked === '1'
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
                  onBlur={() => handleFieldBlur(id, 'note')}
                  ref={(el) => registerInputRef(id, 'note', el)}
                  name="note"
                  className={`h-8 text-sm ${
                    hasFieldError(id, 'note') ? 'border-red-500 pl-8' : ''
                  }`}
                  placeholder="摘要を入力"
                  disabled={
                    !isCurrentFiscalYear || editedTransaction.checked === '1'
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
          onCheckedChange={(checked: boolean) => onCheckedChange(id, checked)}
          aria-label={`取引 ${id} の確認`}
          disabled={!isCurrentFiscalYear}
        />
      </td>
    </tr>
  )
}, arePropsEqual)
