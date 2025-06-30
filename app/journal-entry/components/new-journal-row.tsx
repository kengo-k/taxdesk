import { memo, useEffect, useState } from 'react'

import { useDebouncedCallback } from 'use-debounce'

import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete'
import { Input } from '@/components/ui/input'
import { getDayOfWeekKanji, isWeekend } from '@/lib/client/utils/formatting'

interface NewJournalRowProps {
  newRowData: any
  newRowErrors: Record<string, string>
  accountOptions: AutocompleteOption[]
  deleteMode: boolean
  onFieldChange: (field: string, value: string | number) => void
  onAccountSelect: (
    field: 'karikata_cd' | 'kasikata_cd',
    option: AutocompleteOption,
  ) => void
  onKeyDown: (event: React.KeyboardEvent) => void
  onFocus: () => void
  onBlur: () => void
  getAccountName: (code: string) => string
}

export const NewJournalRow = memo(function NewJournalRow({
  newRowData,
  newRowErrors,
  accountOptions,
  deleteMode,
  onFieldChange,
  onAccountSelect,
  onKeyDown,
  onFocus,
  onBlur,
  getAccountName,
}: NewJournalRowProps) {
  // ローカルstate
  const [localDate, setLocalDate] = useState(newRowData.date || '')
  const [localKarikataCode, setLocalKarikataCode] = useState(
    newRowData.karikata_cd || '',
  )
  const [localKasikataCode, setLocalKasikataCode] = useState(
    newRowData.kasikata_cd || '',
  )
  const [localKarikataValue, setLocalKarikataValue] = useState(
    newRowData.karikata_value || '',
  )
  const [localKasikataValue, setLocalKasikataValue] = useState(
    newRowData.kasikata_value || '',
  )
  const [localNote, setLocalNote] = useState(newRowData.note || '')

  // propsの値が変更されたときにローカルstateを同期
  useEffect(() => {
    setLocalDate(newRowData.date || '')
  }, [newRowData.date])

  useEffect(() => {
    setLocalKarikataCode(newRowData.karikata_cd || '')
  }, [newRowData.karikata_cd])

  useEffect(() => {
    setLocalKasikataCode(newRowData.kasikata_cd || '')
  }, [newRowData.kasikata_cd])

  useEffect(() => {
    setLocalKarikataValue(newRowData.karikata_value || '')
  }, [newRowData.karikata_value])

  useEffect(() => {
    setLocalKasikataValue(newRowData.kasikata_value || '')
  }, [newRowData.kasikata_value])

  useEffect(() => {
    setLocalNote(newRowData.note || '')
  }, [newRowData.note])

  // debounceされたコールバック（300ms）
  const debouncedDateChange = useDebouncedCallback((value: string) => {
    onFieldChange('date', value)
  }, 300)

  const debouncedKarikataCodeChange = useDebouncedCallback((value: string) => {
    onFieldChange('karikata_cd', value)
  }, 300)

  const debouncedKasikataCodeChange = useDebouncedCallback((value: string) => {
    onFieldChange('kasikata_cd', value)
  }, 300)

  const debouncedKarikataValueChange = useDebouncedCallback((value: number) => {
    onFieldChange('karikata_value', value)
  }, 300)

  const debouncedKasikataValueChange = useDebouncedCallback((value: number) => {
    onFieldChange('kasikata_value', value)
  }, 300)

  const debouncedNoteChange = useDebouncedCallback((value: string) => {
    onFieldChange('note', value)
  }, 300)
  return (
    <tr
      data-entry-id="new"
      className={`border-t ${
        isWeekend(newRowData.date || '')
          ? getDayOfWeekKanji(newRowData.date || '') === '土'
            ? 'bg-blue-50' // 土曜日は青色系
            : 'bg-red-50' // 日曜日は赤色系
          : 'bg-gray-50'
      }`}
    >
      {deleteMode && <td className="py-2 px-1 text-center"></td>}
      <td className="py-2 px-1 relative">
        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-400"></div>
        <div className="flex gap-1">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="YYYYMMDD"
              value={localDate}
              onChange={(e) => {
                const value = e.target.value
                setLocalDate(value)
                debouncedDateChange(value)
              }}
              onKeyDown={onKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              className={`h-8 text-sm ${newRowErrors.date ? 'border-red-500' : ''}`}
            />
          </div>
          <div className="w-12">
            <Input
              type="text"
              value={getDayOfWeekKanji(newRowData.date || '')}
              readOnly
              tabIndex={-1}
              className="h-8 text-sm text-center bg-gray-50"
            />
          </div>
        </div>
      </td>
      <td className="py-2 px-1">
        <Autocomplete
          value={localKarikataCode}
          placeholder="科目コード"
          options={accountOptions}
          onSelect={(option) => {
            setLocalKarikataCode(option.code || '')
            onAccountSelect('karikata_cd', option)
          }}
          onChange={(value) => {
            setLocalKarikataCode(value)
            debouncedKarikataCodeChange(value)
          }}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`h-8 text-sm ${newRowErrors.karikata_cd ? 'border-red-500' : ''}`}
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
          value={getAccountName(newRowData.karikata_cd)}
          placeholder=""
          className="h-8 text-sm bg-gray-50"
          readOnly
          tabIndex={-1}
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="number"
          placeholder="借方金額"
          value={localKarikataValue}
          onChange={(e) => {
            const value = e.target.value
            setLocalKarikataValue(value)
            debouncedKarikataValueChange(Number(value) || 0)
          }}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`h-8 text-sm text-right ${newRowErrors.karikata_value ? 'border-red-500' : ''}`}
        />
      </td>
      <td className="py-2 px-1">
        <Autocomplete
          value={localKasikataCode}
          placeholder="科目コード"
          options={accountOptions}
          onSelect={(option) => {
            setLocalKasikataCode(option.code || '')
            onAccountSelect('kasikata_cd', option)
          }}
          onChange={(value) => {
            setLocalKasikataCode(value)
            debouncedKasikataCodeChange(value)
          }}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`h-8 text-sm ${newRowErrors.kasikata_cd ? 'border-red-500' : ''}`}
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
          value={getAccountName(newRowData.kasikata_cd)}
          placeholder=""
          className="h-8 text-sm bg-gray-50"
          readOnly
          tabIndex={-1}
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="number"
          placeholder="貸方金額"
          value={localKasikataValue}
          onChange={(e) => {
            const value = e.target.value
            setLocalKasikataValue(value)
            debouncedKasikataValueChange(Number(value) || 0)
          }}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`h-8 text-sm text-right ${newRowErrors.kasikata_value ? 'border-red-500' : ''}`}
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
          placeholder="摘要を入力"
          value={localNote}
          onChange={(e) => {
            const value = e.target.value
            setLocalNote(value)
            debouncedNoteChange(value)
          }}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`h-8 text-sm ${newRowErrors.note ? 'border-red-500' : ''}`}
        />
      </td>
      <td className="py-2 px-1 text-center">
        {/* 新規行のため確認チェックボックスなし */}
      </td>
    </tr>
  )
})
