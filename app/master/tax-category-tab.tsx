'use client'

import { Edit, Trash2 } from 'lucide-react'

import type { TaxCategory } from '@/app/master/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TaxCategoryTabProps {
  taxCategories: TaxCategory[]
  onOpenTaxCategoryDialog: (category?: TaxCategory) => void
  onConfirmDelete: (
    item: any,
    type: 'kamoku' | 'saimoku' | 'tax-category' | 'mapping',
  ) => void
}

export function TaxCategoryTab({
  taxCategories,
  onOpenTaxCategoryDialog,
  onConfirmDelete,
}: TaxCategoryTabProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">名称</TableHead>
            <TableHead>説明</TableHead>
            <TableHead className="w-[80px]">税率</TableHead>
            <TableHead className="w-[100px]">軽減税率</TableHead>
            <TableHead className="w-[100px]">課税対象</TableHead>
            <TableHead className="w-[120px]">有効期限</TableHead>
            <TableHead className="text-right w-[120px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taxCategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                消費税区分が見つかりません
              </TableCell>
            </TableRow>
          ) : (
            taxCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {category.description}
                </TableCell>
                <TableCell>{category.tax_rate}%</TableCell>
                <TableCell>
                  <Badge
                    variant={category.is_reduced_tax ? 'default' : 'outline'}
                    className={
                      category.is_reduced_tax
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                        : ''
                    }
                  >
                    {category.is_reduced_tax ? '軽減税率' : '標準税率'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={category.is_taxable ? 'default' : 'outline'}
                    className={
                      category.is_taxable
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : ''
                    }
                  >
                    {category.is_taxable ? '課税' : '非課税'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {category.valid_from}
                  {category.valid_to ? ` 〜 ${category.valid_to}` : ' 〜'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenTaxCategoryDialog(category)}
                      title="編集"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onConfirmDelete(category, 'tax-category')}
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
