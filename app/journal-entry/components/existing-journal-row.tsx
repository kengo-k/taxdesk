import { memo, useEffect, useState } from 'react'

import { useDebouncedCallback } from 'use-debounce'

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
  onJournalCheckedChange?: (entryId: string, checked: boolean) => Promise<void>
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
  onJournalCheckedChange,
  onFocus,
  onBlur,
  errors = {},
}: ExistingJournalRowProps) {
  // フィールドの現在値を取得（一時データを優先）
  const getFieldValue = (fieldName: string, originalValue: any) => {
    return fieldData[fieldName] ?? originalValue
  }

  // ローカルstate
  const [localDate, setLocalDate] = useState(
    getFieldValue('date', entry.date) || '',
  )
  const [localKarikataCode, setLocalKarikataCode] = useState(
    getFieldValue('karikata_cd', entry.karikata_cd) || '',
  )
  const [localKasikataCode, setLocalKasikataCode] = useState(
    getFieldValue('kasikata_cd', entry.kasikata_cd) || '',
  )
  const [localKarikataValue, setLocalKarikataValue] = useState(
    formatCurrency(getFieldValue('karikata_value', entry.karikata_value)),
  )
  const [localKasikataValue, setLocalKasikataValue] = useState(
    formatCurrency(getFieldValue('kasikata_value', entry.kasikata_value)),
  )
  const [localNote, setLocalNote] = useState(
    getFieldValue('note', entry.note || '') || '',
  )
  const [localChecked, setLocalChecked] = useState(entry.checked === '1')

  // propsの値が変更されたときにローカルstateを同期
  useEffect(() => {
    setLocalDate(getFieldValue('date', entry.date) || '')
  }, [fieldData.date, entry.date])

  useEffect(() => {
    setLocalKarikataCode(getFieldValue('karikata_cd', entry.karikata_cd) || '')
  }, [fieldData.karikata_cd, entry.karikata_cd])

  useEffect(() => {
    setLocalKasikataCode(getFieldValue('kasikata_cd', entry.kasikata_cd) || '')
  }, [fieldData.kasikata_cd, entry.kasikata_cd])

  useEffect(() => {
    const value = getFieldValue('karikata_value', entry.karikata_value)
    setLocalKarikataValue(formatCurrency(value))
  }, [fieldData.karikata_value, entry.karikata_value])

  useEffect(() => {
    const value = getFieldValue('kasikata_value', entry.kasikata_value)
    setLocalKasikataValue(formatCurrency(value))
  }, [fieldData.kasikata_value, entry.kasikata_value])

  useEffect(() => {
    setLocalNote(getFieldValue('note', entry.note || '') || '')
  }, [fieldData.note, entry.note])

  useEffect(() => {
    setLocalChecked(entry.checked === '1')
  }, [entry.checked])

  // debounceされたコールバック（300ms）
  const debouncedDateChange = useDebouncedCallback((value: string) => {
    onFieldChange(entry.id, 'date', value)
  }, 300)

  const debouncedKarikataCodeChange = useDebouncedCallback((value: string) => {
    onFieldChange(entry.id, 'karikata_cd', value)
  }, 300)

  const debouncedKasikataCodeChange = useDebouncedCallback((value: string) => {
    onFieldChange(entry.id, 'kasikata_cd', value)
  }, 300)

  const debouncedKarikataValueChange = useDebouncedCallback((value: number) => {
    onFieldChange(entry.id, 'karikata_value', value)
  }, 300)

  const debouncedKasikataValueChange = useDebouncedCallback((value: number) => {
    onFieldChange(entry.id, 'kasikata_value', value)
  }, 300)

  const debouncedNoteChange = useDebouncedCallback((value: string) => {
    onFieldChange(entry.id, 'note', value)
  }, 300)

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
      } ${localChecked ? 'opacity-70' : ''}`}
    >
      {deleteMode && (
        <td className="py-2 px-1 text-center">
          <Checkbox
            className="h-4 w-4"
            checked={isSelected}
            onCheckedChange={(checked) =>
              onCheckboxChange?.(entry.id, !!checked)
            }
            disabled={localChecked}
          />
        </td>
      )}
      <td className="py-2 px-1">
        <div className="flex gap-1">
          <div className="flex-1 relative">
            <Input
              type="text"
              value={localDate}
              className={getFieldClassName('date', 'h-8 text-sm', entry.date)}
              onChange={(e) => {
                const value = e.target.value
                setLocalDate(value)
                debouncedDateChange(value)
              }}
              onFocus={() => onFocus?.(entry.id)}
              onBlur={() => onBlur?.(entry.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onSubmit(entry.id)
                }
              }}
              disabled={localChecked}
              readOnly={localChecked}
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
          value={localKarikataCode}
          placeholder="科目コード"
          options={accountOptions}
          onSelect={(option) => {
            if (!localChecked) {
              setLocalKarikataCode(option.code || '')
              onAccountSelect(entry.id, 'karikata_cd', option)
            }
          }}
          onChange={(value) => {
            if (!localChecked) {
              setLocalKarikataCode(value)
              debouncedKarikataCodeChange(value)
            }
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
          disabled={localChecked}
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
          value={localKarikataValue}
          className={getFieldClassName(
            'karikata_value',
            'h-8 text-sm text-right font-mono',
            entry.karikata_value,
          )}
          onChange={(e) => {
            const value = e.target.value
            setLocalKarikataValue(value)
            const newValue = parseInt(value.replace(/[,\s]/g, ''), 10)
            if (!isNaN(newValue)) {
              debouncedKarikataValueChange(newValue)
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
          disabled={localChecked}
          readOnly={localChecked}
        />
        {isFieldUnsaved('karikata_value', entry.karikata_value) && (
          <span className="absolute -top-1 left-1 text-red-500 text-sm font-bold">
            *
          </span>
        )}
      </td>
      <td className="py-2 px-1 relative">
        <Autocomplete
          value={localKasikataCode}
          placeholder="科目コード"
          options={accountOptions}
          onSelect={(option) => {
            if (!localChecked) {
              setLocalKasikataCode(option.code || '')
              onAccountSelect(entry.id, 'kasikata_cd', option)
            }
          }}
          onChange={(value) => {
            if (!localChecked) {
              setLocalKasikataCode(value)
              debouncedKasikataCodeChange(value)
            }
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
          disabled={localChecked}
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
          value={localKasikataValue}
          className={getFieldClassName(
            'kasikata_value',
            'h-8 text-sm text-right font-mono',
            entry.kasikata_value,
          )}
          onChange={(e) => {
            const value = e.target.value
            setLocalKasikataValue(value)
            const newValue = parseInt(value.replace(/[,\s]/g, ''), 10)
            if (!isNaN(newValue)) {
              debouncedKasikataValueChange(newValue)
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
          disabled={localChecked}
          readOnly={localChecked}
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
          value={localNote}
          className={getFieldClassName('note', 'h-8 text-sm', entry.note || '')}
          onChange={(e) => {
            const value = e.target.value
            setLocalNote(value)
            debouncedNoteChange(value)
          }}
          onFocus={() => onFocus?.(entry.id)}
          onBlur={() => onBlur?.(entry.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSubmit(entry.id)
            }
          }}
          disabled={localChecked}
          readOnly={localChecked}
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
          checked={localChecked}
          onCheckedChange={async (checked: boolean) => {
            const previousChecked = localChecked
            setLocalChecked(checked)
            try {
              await onJournalCheckedChange?.(entry.id, checked)
            } catch (error) {
              // エラー時は元の状態に戻す
              setLocalChecked(previousChecked)
            }
          }}
          aria-label={`取引 ${entry.id} の確認`}
        />
      </td>
    </tr>
  )
})
