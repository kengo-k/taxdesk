"use client"
import { Plus, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type Kamoku, bunruiTypeMap, getAccountNature } from "./types"

interface KamokuTabProps {
  kamokuList: Kamoku[]
  onOpenKamokuDialog: (kamoku?: Kamoku) => void
  onOpenSaimokuDialog: (parentKamoku: Kamoku) => void
}

export function KamokuTab({ kamokuList, onOpenKamokuDialog, onOpenSaimokuDialog }: KamokuTabProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">コード</TableHead>
            <TableHead>勘定科目名</TableHead>
            <TableHead>略称</TableHead>
            <TableHead>科目区分</TableHead>
            <TableHead>L/R区分</TableHead>
            <TableHead>説明</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kamokuList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                勘定科目が見つかりません
              </TableCell>
            </TableRow>
          ) : (
            kamokuList.map((kamoku) => (
              <TableRow key={kamoku.id}>
                <TableCell className="font-medium">{kamoku.kamoku_cd}</TableCell>
                <TableCell>
                  {kamoku.kamoku_full_name}
                  {(kamoku.saimokuList?.length || 0) > 0 && (
                    <Badge variant="outline" className="ml-2">
                      細目: {kamoku.saimokuList?.length || 0}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{kamoku.kamoku_ryaku_name}</TableCell>
                <TableCell>
                  {kamoku.bunrui && (
                    <Badge className={bunruiTypeMap[kamoku.bunrui.kamoku_bunrui_type]?.color || "bg-gray-100"}>
                      {kamoku.bunrui.kamoku_bunrui_name}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{kamoku.bunrui && getAccountNature(kamoku.bunrui.kamoku_bunrui_type).name}</TableCell>
                <TableCell className="max-w-xs truncate">{kamoku.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onOpenSaimokuDialog(kamoku)} title="細目を追加">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onOpenKamokuDialog(kamoku)} title="編集">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
