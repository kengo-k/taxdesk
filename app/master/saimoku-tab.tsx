'use client'

import { Edit, Trash2 } from 'lucide-react'

import type { Kamoku, Saimoku } from '@/app/master/types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SaimokuTabProps {
  saimokuList: Saimoku[]
  kamokuList: Kamoku[]
  onOpenSaimokuDialog: (parentKamoku: Kamoku, saimoku?: Saimoku) => void
  confirmDelete: (
    item: any,
    type: 'kamoku' | 'saimoku' | 'tax-category' | 'mapping',
  ) => void
}

export function SaimokuTab({
  saimokuList,
  kamokuList,
  onOpenSaimokuDialog,
  confirmDelete,
}: SaimokuTabProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">細目コード</TableHead>
            <TableHead>細目名</TableHead>
            <TableHead className="w-[150px]">勘定科目</TableHead>
            <TableHead className="w-[180px]">有効期限</TableHead>
            <TableHead>説明</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {saimokuList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                細目が見つかりません
              </TableCell>
            </TableRow>
          ) : (
            saimokuList.map((saimoku) => {
              const parentKamoku = kamokuList.find(
                (k) => k.kamoku_cd === saimoku.kamoku_cd,
              )
              return (
                <TableRow key={saimoku.id}>
                  <TableCell className="font-medium">
                    {saimoku.saimoku_cd}
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-help"
                      title={`略称: ${saimoku.saimoku_ryaku_name || '未設定'}\nカナ名: ${saimoku.saimoku_kana_name || '未設定'}`}
                    >
                      {saimoku.saimoku_full_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {parentKamoku ? parentKamoku.kamoku_ryaku_name : ''}
                  </TableCell>
                  <TableCell>
                    {saimoku.valid_from}
                    {saimoku.valid_to ? ` 〜 ${saimoku.valid_to}` : ' 〜'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {saimoku.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {parentKamoku && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              onOpenSaimokuDialog(parentKamoku, saimoku)
                            }
                            title="編集"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(saimoku, 'saimoku')}
                            title="削除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
