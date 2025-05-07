'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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

export function TransactionTable({
  transactions,
  deleteMode,
  selectedRows,
  onToggleRowSelection,
  onUpdateTransaction,
  onBlur,
}: TransactionTableProps) {
  return (
    <TooltipProvider>
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
              transactions.map((transaction) => (
                <tr key={transaction.journal_id} className="border-t">
                  {deleteMode && (
                    <td className="py-2 px-1 text-center">
                      <Checkbox
                        checked={selectedRows.includes(
                          transaction.journal_id as any,
                        )}
                        onCheckedChange={() =>
                          onToggleRowSelection(transaction.journal_id as any)
                        }
                        aria-label={`取引 ${transaction.journal_id} を選択`}
                      />
                    </td>
                  )}
                  <td className="py-2 px-1">
                    <div className="relative">
                      <Tooltip
                        open={
                          // transaction.showTooltips.date &&
                          // !!transaction.errors.date
                          false
                        }
                      >
                        <TooltipTrigger asChild>
                          <div className="relative">
                            <Input
                              type="text"
                              value={transaction.date}
                              // onChange={(e) =>
                              //   onUpdateTransaction(
                              //     transaction.id,
                              //     'date',
                              //     e.target.value,
                              //   )
                              // }
                              //onBlur={() => onBlur(transaction.id, 'date')}
                              // className={`h-8 text-sm ${transaction.errors.date ? 'border-red-500 pr-8' : ''}`}
                              className={`h-8 text-sm}`}
                            />
                            {/* {transaction.errors.date && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500">
                                <AlertCircle className="h-4 w-4" />
                              </div>
                            )} */}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-red-50 text-red-800 border border-red-200"
                        >
                          {/* {transaction.errors.date} */}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="py-2 px-1">
                    <Input
                      type="text"
                      value={transaction.other_cd}
                      // onChange={(e) =>
                      //   onUpdateTransaction(
                      //     transaction.id,
                      //     'karikata_cd',
                      //     e.target.value,
                      //   )
                      // }
                      className="h-8 text-sm"
                    />
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
                      <Tooltip
                        open={
                          // transaction.showTooltips.debit &&
                          // !!transaction.errors.debit
                          false
                        }
                      >
                        <TooltipTrigger asChild>
                          <div className="relative">
                            <Input
                              type="text"
                              value={
                                transaction.karikata_value > 0
                                  ? formatCurrency(transaction.karikata_value)
                                  : ''
                                // transaction.debit > 0
                                //   ? formatCurrency(transaction.debit)
                                //   : ''
                              }
                              // onChange={(e) =>
                              //   onUpdateTransaction(
                              //     transaction.id,
                              //     'karikata_value',
                              //     e.target.value,
                              //   )
                              // }
                              // onBlur={() => onBlur(transaction.id, 'debit')}
                              // className={`h-8 text-sm text-right ${transaction.errors.debit ? 'border-red-500 pr-8' : ''}`}
                              className={`h-8 text-sm text-right`}
                            />
                            {/* {transaction.errors.debit && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500">
                                <AlertCircle className="h-4 w-4" />
                              </div>
                            )} */}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-red-50 text-red-800 border border-red-200"
                        >
                          {/* {transaction.errors.debit} */}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="py-2 px-1">
                    <div className="relative">
                      <Tooltip
                        open={
                          // transaction.showTooltips.credit &&
                          // !!transaction.errors.credit
                          false
                        }
                      >
                        <TooltipTrigger asChild>
                          <div className="relative">
                            <Input
                              type="text"
                              value={
                                transaction.kasikata_value > 0
                                  ? formatCurrency(transaction.kasikata_value)
                                  : ''
                                // transaction.credit > 0
                                //   ? formatCurrency(transaction.credit)
                                //   : ''
                              }
                              // onChange={(e) =>
                              //   onUpdateTransaction(
                              //     transaction.id,
                              //     'kasikata_value',
                              //     e.target.value,
                              //   )
                              // }
                              // onBlur={() => onBlur(transaction.id, 'credit')}
                              // className={`h-8 text-sm text-right ${transaction.errors.credit ? 'border-red-500 pr-8' : ''}`}
                              className={`h-8 text-sm text-right`}
                            />
                            {/* {transaction.errors.credit && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500">
                                <AlertCircle className="h-4 w-4" />
                              </div>
                            )} */}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-red-50 text-red-800 border border-red-200"
                        >
                          {/* {transaction.errors.credit} */}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="py-2 px-1">
                    <Input
                      type="text"
                      value={transaction.note ?? ''}
                      // onChange={(e) =>
                      //   onUpdateTransaction(
                      //     transaction.id,
                      //     'note',
                      //     e.target.value,
                      //   )
                      // }
                      className="h-8 text-sm"
                      placeholder="摘要を入力"
                    />
                  </td>
                  <td className="py-2 px-1 text-right text-green-600">
                    {formatCurrency(transaction.acc)}
                  </td>
                </tr>
              ))
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
