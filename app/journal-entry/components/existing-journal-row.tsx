import { memo } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/client/utils/formatting'

interface ExistingJournalRowProps {
  entry: any
  index: number
  deleteMode: boolean
}

export const ExistingJournalRow = memo(function ExistingJournalRow({
  entry,
  index,
  deleteMode,
}: ExistingJournalRowProps) {
  return (
    <tr
      key={entry.id}
      className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
    >
      {deleteMode && (
        <td className="py-2 px-1 text-center">
          <Checkbox className="h-4 w-4" />
        </td>
      )}
      <td className="py-2 px-1">
        <Input
          type="text"
          defaultValue={entry.date}
          className="h-8 text-sm"
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
          defaultValue={entry.karikata_cd}
          className="h-8 text-sm"
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
          defaultValue=""
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
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
          defaultValue={entry.kasikata_cd}
          className="h-8 text-sm"
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
          defaultValue=""
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
        />
      </td>
      <td className="py-2 px-1">
        <Input
          type="text"
          defaultValue={entry.note || ''}
          className="h-8 text-sm"
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