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
  onFieldUpdate: (
    entryId: string,
    field: string,
    value: string | number,
  ) => void
  getAccountName: (code: string) => string
  isSelected?: boolean
  onCheckboxChange?: (entryId: string, checked: boolean) => void
}

export const ExistingJournalRow = memo(function ExistingJournalRow({
  entry,
  index,
  deleteMode,
  accountOptions,
  onAccountSelect,
  onFieldUpdate,
  getAccountName,
  isSelected = false,
  onCheckboxChange,
}: ExistingJournalRowProps) {
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
          <div className="flex-1">
            <Input
              type="text"
              defaultValue={entry.date}
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (e.currentTarget.value !== entry.date) {
                    onFieldUpdate(entry.id, 'date', e.currentTarget.value)
                  }
                }
              }}
            />
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
      <td className="py-2 px-1">
        <Autocomplete
          value={entry.karikata_cd}
          placeholder="科目コード"
          options={accountOptions}
          onSelect={(option) =>
            onAccountSelect(entry.id, 'karikata_cd', option)
          }
          onChange={() => {}}
          className="h-8 text-sm"
        />
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
      <td className="py-2 px-1">
        <Input
          type="text"
          defaultValue={formatCurrency(entry.karikata_value)}
          className="h-8 text-sm text-right font-mono"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const newValue = parseInt(
                e.currentTarget.value.replace(/[,\s]/g, ''),
                10,
              )
              if (!isNaN(newValue) && newValue !== entry.karikata_value) {
                onFieldUpdate(entry.id, 'debitAmount', newValue)
              }
            }
          }}
        />
      </td>
      <td className="py-2 px-1">
        <Autocomplete
          value={entry.kasikata_cd}
          placeholder="科目コード"
          options={accountOptions}
          onSelect={(option) =>
            onAccountSelect(entry.id, 'kasikata_cd', option)
          }
          onChange={() => {}}
          className="h-8 text-sm"
        />
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
      <td className="py-2 px-1">
        <Input
          type="text"
          defaultValue={formatCurrency(entry.kasikata_value)}
          className="h-8 text-sm text-right font-mono"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const newValue = parseInt(
                e.currentTarget.value.replace(/[,\s]/g, ''),
                10,
              )
              if (!isNaN(newValue) && newValue !== entry.kasikata_value) {
                onFieldUpdate(entry.id, 'creditAmount', newValue)
              }
            }
          }}
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
          defaultValue={entry.note || ''}
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (e.currentTarget.value !== (entry.note || '')) {
                onFieldUpdate(entry.id, 'description', e.currentTarget.value)
              }
            }
          }}
        />
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
