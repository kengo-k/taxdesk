"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { TaxCategory } from "./types"

interface TaxCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTaxCategory: TaxCategory | null
  isEditing: boolean
  onSave: () => void
  onChange: (field: keyof TaxCategory, value: string | number | boolean) => void
}

export function TaxCategoryDialog({
  open,
  onOpenChange,
  currentTaxCategory,
  isEditing,
  onSave,
  onChange,
}: TaxCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "消費税区分を編集" : "消費税区分を追加"}</DialogTitle>
          <DialogDescription>消費税区分の情報を入力してください。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* コードは内部的に保持するが画面上には表示しない */}
          <input
            type="hidden"
            id="tax-code"
            value={currentTaxCategory?.code || `TAX_${Date.now().toString().substring(8)}`}
            onChange={(e) => onChange("code", e.target.value)}
          />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tax-name" className="text-right">
              名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tax-name"
              value={currentTaxCategory?.name || ""}
              onChange={(e) => onChange("name", e.target.value)}
              className="col-span-3"
              placeholder="例: 課税（標準税率10%）"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tax-rate" className="text-right">
              税率 (%)
            </Label>
            <Input
              id="tax-rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={currentTaxCategory?.tax_rate || 0}
              onChange={(e) => onChange("tax_rate", Number.parseFloat(e.target.value) || 0)}
              className="col-span-3"
              placeholder="例: 10"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valid-from-tax" className="text-right">
              有効期限（開始） <span className="text-red-500">*</span>
            </Label>
            <Input
              id="valid-from-tax"
              type="date"
              value={currentTaxCategory?.valid_from || ""}
              onChange={(e) => onChange("valid_from", e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valid-to-tax" className="text-right">
              有効期限（終了）
            </Label>
            <Input
              id="valid-to-tax"
              type="date"
              value={currentTaxCategory?.valid_to || ""}
              onChange={(e) => onChange("valid_to", e.target.value)}
              className="col-span-3"
              placeholder="終了日が未定の場合は空欄"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              <Label>設定</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-taxable"
                  checked={currentTaxCategory?.is_taxable || false}
                  onCheckedChange={(checked) => onChange("is_taxable", checked as boolean)}
                />
                <Label htmlFor="is-taxable">課税対象</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-reduced-tax"
                  checked={currentTaxCategory?.is_reduced_tax || false}
                  onCheckedChange={(checked) => onChange("is_reduced_tax", checked as boolean)}
                />
                <Label htmlFor="is-reduced-tax">軽減税率</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-deductible"
                  checked={currentTaxCategory?.is_deductible || false}
                  onCheckedChange={(checked) => onChange("is_deductible", checked as boolean)}
                />
                <Label htmlFor="is-deductible">仕入税額控除対象</Label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="tax-desc" className="text-right pt-2">
              説明
            </Label>
            <Textarea
              id="tax-desc"
              value={currentTaxCategory?.description || ""}
              onChange={(e) => onChange("description", e.target.value)}
              className="col-span-3"
              placeholder="消費税区分の説明を入力"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={onSave}>{isEditing ? "更新" : "追加"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
