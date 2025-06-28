import { memo } from 'react'

import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete'
import { Input } from '@/components/ui/input'

interface NewJournalRowProps {
  newRowData: any
  newRowErrors: Record<string, string>
  accountOptions: AutocompleteOption[]
  deleteMode: boolean
  onFieldChange: (field: string, value: string | number) => void
  onAccountSelect: (field: 'karikata_cd' | 'kasikata_cd', option: AutocompleteOption) => void
  onKeyDown: (event: React.KeyboardEvent) => void
  onFocus: () => void
  onBlur: () => void
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
}: NewJournalRowProps) {
  return (
    <tr className="border-t bg-gray-50">
      {deleteMode && <td className="py-2 px-1 text-center"></td>}
      <td className="py-2 px-1 relative">
        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-400"></div>
        <Input
          type="text"
          placeholder="YYYYMMDD"
          value={newRowData.date}
          onChange={(e) => onFieldChange('date', e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`h-8 text-sm ${newRowErrors.date ? 'border-red-500' : ''}`}
        />
      </td>
      <td className="py-2 px-1">
        <Autocomplete
          value={newRowData.karikata_cd}
          placeholder="科目コード"
          options={accountOptions}
          onSelect={(option) => onAccountSelect('karikata_cd', option)}
          onChange={(value) => onFieldChange('karikata_cd', value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`h-8 text-sm ${newRowErrors.karikata_cd ? 'border-red-500' : ''}`}
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
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
          value={newRowData.karikata_value || ''}
          onChange={(e) => onFieldChange('karikata_value', Number(e.target.value) || 0)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`h-8 text-sm text-right ${newRowErrors.karikata_value ? 'border-red-500' : ''}`}
        />
      </td>
      <td className="py-2 px-1">
        <Autocomplete
          value={newRowData.kasikata_cd}
          placeholder="科目コード"
          options={accountOptions}
          onSelect={(option) => onAccountSelect('kasikata_cd', option)}
          onChange={(value) => onFieldChange('kasikata_cd', value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`h-8 text-sm ${newRowErrors.kasikata_cd ? 'border-red-500' : ''}`}
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
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
          value={newRowData.kasikata_value || ''}
          onChange={(e) => onFieldChange('kasikata_value', Number(e.target.value) || 0)}
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
          value={newRowData.note}
          onChange={(e) => onFieldChange('note', e.target.value)}
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