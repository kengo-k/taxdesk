import { memo } from 'react'

import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  formatCurrency,
  getDayOfWeekKanji,
  isWeekend,
} from '@/lib/client/utils/formatting'

interface ExistingJournalRowProps {
  entry: any
  index: number
  deleteMode: boolean
  accountOptions: AutocompleteOption[]
  onAccountSelect: (
    entryId: string,
    field: 'karikata_cd' | 'kasikata_cd',
    option: AutocompleteOption,
  ) => void
  onFieldChange: (
    entryId: string,
    field: string,
    value: string | number,
  ) => void
  onSubmit: (entryId: string) => void
  fieldData: Record<string, any>
  getAccountName: (code: string) => string
  isSelected?: boolean
  onCheckboxChange?: (entryId: string, checked: boolean) => void
  onFocus?: (entryId: string) => void
  onBlur?: (entryId: string) => void
  errors?: Record<string, string>
}

export const ExistingJournalRow = memo(function ExistingJournalRow({
  entry,
  index,
  deleteMode,
  accountOptions,
  onAccountSelect,
  onFieldChange,
  onSubmit,
  fieldData,
  getAccountName,
  isSelected = false,
  onCheckboxChange,
  onFocus,
  onBlur,
  errors = {},
}: ExistingJournalRowProps) {
  // フィールドの現在値を取得（一時データを優先）
  const getFieldValue = (fieldName: string, originalValue: any) => {
    return fieldData[fieldName] ?? originalValue
  }

  // フィールドにエラーがあるかチェック
  const hasFieldError = (fieldName: string) => !!errors[fieldName]

  // フィールドが変更されているかチェック（未保存かどうか）
  const isFieldUnsaved = (fieldName: string, originalValue: any) => {
    const currentValue = fieldData[fieldName]
    return currentValue !== undefined && currentValue !== originalValue
  }

  // フィールドのクラス名を取得（エラー状態・未保存状態を考慮）
  const getFieldClassName = (
    fieldName: string,
    baseClass: string,
    originalValue?: any,
  ) => {
    const classes = [baseClass]
    if (hasFieldError(fieldName)) {
      classes.push('border-red-500')
    }
    if (
      originalValue !== undefined &&
      isFieldUnsaved(fieldName, originalValue)
    ) {
      classes.push('bg-yellow-50')
    }
    return classes.join(' ')
  }

  return (
    <tr
      key={entry.id}
      className={`border-t ${
        isWeekend(entry.date || '')
          ? getDayOfWeekKanji(entry.date || '') === '土'
            ? 'bg-blue-50' // 土曜日は青色系
            : 'bg-red-50' // 日曜日は赤色系
          : index % 2 === 0
            ? 'bg-white'
            : 'bg-gray-25'
      }`}
    >
      {deleteMode && (
        <td className="py-2 px-1 text-center">
          <Checkbox
            className="h-4 w-4"
            checked={isSelected}
            onCheckedChange={(checked) =>
              onCheckboxChange?.(entry.id, !!checked)
            }
          />
        </td>
      )}
      <td className="py-2 px-1">
        <div className="flex gap-1">
          <div className="flex-1 relative">
            <Input
              type="text"
              value={getFieldValue('date', entry.date)}
              className={getFieldClassName('date', 'h-8 text-sm', entry.date)}
              onChange={(e) => {
                onFieldChange(entry.id, 'date', e.target.value)
              }}
              onFocus={() => onFocus?.(entry.id)}
              onBlur={() => onBlur?.(entry.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onSubmit(entry.id)
                }
              }}
            />
            {isFieldUnsaved('date', entry.date) && (
              <span className="absolute -top-3 left-0 text-red-500 text-sm font-bold">
                *
              </span>
            )}
          </div>
          <div className="w-12">
            <Input
              type="text"
              value={getDayOfWeekKanji(entry.date || '')}
              readOnly
              tabIndex={-1}
              className="h-8 text-sm text-center bg-gray-50"
            />
          </div>
        </div>
      </td>
      <td className="py-2 px-1 relative">
        <Autocomplete
          value={getFieldValue('karikata_cd', entry.karikata_cd)}
          placeholder="科目コード"
          options={accountOptions}
          onSelect={(option) =>
            onAccountSelect(entry.id, 'karikata_cd', option)
          }
          onChange={(value) => {
            onFieldChange(entry.id, 'karikata_cd', value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSubmit(entry.id)
            }
          }}
          onFocus={() => onFocus?.(entry.id)}
          onBlur={() => onBlur?.(entry.id)}
          className={getFieldClassName(
            'karikata_cd',
            'h-8 text-sm',
            entry.karikata_cd,
          )}
        />
        {isFieldUnsaved('karikata_cd', entry.karikata_cd) && (
          <span className="absolute -top-1 left-1 text-red-500 text-sm font-bold">
            *
          </span>
        )}
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
          value={getAccountName(entry.karikata_cd)}
          className="h-8 text-sm bg-gray-50"
          readOnly
          tabIndex={-1}
        />
      </td>
      <td className="py-2 px-1 relative">
        <Input
          type="text"
          value={formatCurrency(
            getFieldValue('karikata_value', entry.karikata_value),
          )}
          className={getFieldClassName(
            'karikata_value',
            'h-8 text-sm text-right font-mono',
            entry.karikata_value,
          )}
          onChange={(e) => {
            const newValue = parseInt(e.target.value.replace(/[,\s]/g, ''), 10)
            if (!isNaN(newValue)) {
              onFieldChange(entry.id, 'karikata_value', newValue)
            }
          }}
          onFocus={() => onFocus?.(entry.id)}
          onBlur={() => onBlur?.(entry.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSubmit(entry.id)
            }
          }}
        />
        {isFieldUnsaved('karikata_value', entry.karikata_value) && (
          <span className="absolute -top-1 left-1 text-red-500 text-sm font-bold">
            *
          </span>
        )}
      </td>
      <td className="py-2 px-1 relative">
        <Autocomplete
          value={getFieldValue('kasikata_cd', entry.kasikata_cd)}
          placeholder="科目コード"
          options={accountOptions}
          onSelect={(option) =>
            onAccountSelect(entry.id, 'kasikata_cd', option)
          }
          onChange={(value) => {
            onFieldChange(entry.id, 'kasikata_cd', value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSubmit(entry.id)
            }
          }}
          onFocus={() => onFocus?.(entry.id)}
          onBlur={() => onBlur?.(entry.id)}
          className={getFieldClassName(
            'kasikata_cd',
            'h-8 text-sm',
            entry.kasikata_cd,
          )}
        />
        {isFieldUnsaved('kasikata_cd', entry.kasikata_cd) && (
          <span className="absolute -top-1 left-1 text-red-500 text-sm font-bold">
            *
          </span>
        )}
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
          value={getAccountName(entry.kasikata_cd)}
          className="h-8 text-sm bg-gray-50"
          readOnly
          tabIndex={-1}
        />
      </td>
      <td className="py-2 px-1 relative">
        <Input
          type="text"
          value={formatCurrency(
            getFieldValue('kasikata_value', entry.kasikata_value),
          )}
          className={getFieldClassName(
            'kasikata_value',
            'h-8 text-sm text-right font-mono',
            entry.kasikata_value,
          )}
          onChange={(e) => {
            const newValue = parseInt(e.target.value.replace(/[,\s]/g, ''), 10)
            if (!isNaN(newValue)) {
              onFieldChange(entry.id, 'kasikata_value', newValue)
            }
          }}
          onFocus={() => onFocus?.(entry.id)}
          onBlur={() => onBlur?.(entry.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSubmit(entry.id)
            }
          }}
        />
        {isFieldUnsaved('kasikata_value', entry.kasikata_value) && (
          <span className="absolute -top-1 left-1 text-red-500 text-sm font-bold">
            *
          </span>
        )}
      </td>
      <td className="py-2 px-1 relative">
        <Input
          type="text"
          value={getFieldValue('note', entry.note || '')}
          className={getFieldClassName('note', 'h-8 text-sm', entry.note || '')}
          onChange={(e) => {
            onFieldChange(entry.id, 'note', e.target.value)
          }}
          onFocus={() => onFocus?.(entry.id)}
          onBlur={() => onBlur?.(entry.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSubmit(entry.id)
            }
          }}
        />
        {isFieldUnsaved('note', entry.note || '') && (
          <span className="absolute -top-1 left-1 text-red-500 text-sm font-bold">
            *
          </span>
        )}
      </td>
      <td className="py-2 px-1 text-center">
        <Checkbox
          className="h-4 w-4"
          checked={entry.checked === '1'}
          disabled
        />
      </td>
    </tr>
  )
})
