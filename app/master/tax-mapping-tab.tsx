"use client"

import { Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { KamokuTaxMapping } from "./types"

interface TaxMappingTabProps {
  kamokuTaxMappings: KamokuTaxMapping[]
  onOpenMappingDialog: (mapping?: KamokuTaxMapping) => void
  onConfirmDelete: (item: any, type: "kamoku" | "saimoku" | "tax-category" | "mapping") => void
}

export function TaxMappingTab({ kamokuTaxMappings, onOpenMappingDialog, onConfirmDelete }: TaxMappingTabProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">勘定科目</TableHead>
            <TableHead className="w-[200px]">消費税区分</TableHead>
            <TableHead className="w-[80px]">税率</TableHead>
            <TableHead className="w-[100px]">デフォルト</TableHead>
            <TableHead className="w-[120px]">有効期限</TableHead>
            <TableHead className="text-right w-[120px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kamokuTaxMappings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                消費税関連付けが見つかりません
              </TableCell>
            </TableRow>
          ) : (
            kamokuTaxMappings.map((mapping) => (
              <TableRow key={mapping.id}>
                <TableCell>{mapping.kamoku_name}</TableCell>
                <TableCell>{mapping.tax_category?.name}</TableCell>
                <TableCell>{mapping.tax_category?.tax_rate}%</TableCell>
                <TableCell>
                  <Badge
                    variant={mapping.is_default ? "default" : "outline"}
                    className={mapping.is_default ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}
                  >
                    {mapping.is_default ? "デフォルト" : "通常"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {mapping.valid_from}
                  {mapping.valid_to ? ` 〜 ${mapping.valid_to}` : " 〜"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onOpenMappingDialog(mapping)} title="編集">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onConfirmDelete(mapping, "mapping")}
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
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
