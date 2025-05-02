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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { KamokuTaxMapping, Kamoku, TaxCategory } from "./types"

interface TaxMappingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentMapping: KamokuTaxMapping | null
  kamokuList: Kamoku[]
  taxCategories: TaxCategory[]
  isEditing: boolean
  onSave: () => void
  onChange: (field: keyof KamokuTaxMapping, value: string | boolean) => void
}

export function TaxMappingDialog({
  open,
  onOpenChange,
  currentMapping,
  kamokuList,
  taxCategories,
  isEditing,
  onSave,
  onChange,
}: TaxMappingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "関連付けを編集" : "関連付けを追加"}</DialogTitle>
          <DialogDescription>
            勘定科目と消費税区分の関連付け情報を入力してください。
            <span className="block mt-1 text-amber-600">※現在は勘定科目レベルでの関連付けとなっています。</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kamoku-cd" className="text-right">
              勘定科目 <span className="text-red-500">*</span>
            </Label>
            <Select value={currentMapping?.kamoku_cd || ""} onValueChange={(value) => onChange("kamoku_cd", value)}>
              <SelectTrigger id="kamoku-cd" className="col-span-3">
                <SelectValue placeholder="勘定科目を選択" />
              </SelectTrigger>
              <SelectContent>
                {kamokuList.map((kamoku) => (
                  <SelectItem key={kamoku.kamoku_cd} value={kamoku.kamoku_cd}>
                    {kamoku.kamoku_full_name} ({kamoku.kamoku_cd})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tax-category-id" className="text-right">
              消費税区分 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={currentMapping?.tax_category_id || ""}
              onValueChange={(value) => onChange("tax_category_id", value)}
            >
              <SelectTrigger id="tax-category-id" className="col-span-3">
                <SelectValue placeholder="消費税区分を選択" />
              </SelectTrigger>
              <SelectContent>
                {taxCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is-default" className="text-right">
              デフォルト設定
            </Label>
            <div className="col-span-3">
              <Checkbox
                id="is-default"
                checked={currentMapping?.is_default || false}
                onCheckedChange={(checked) => onChange("is_default", checked as boolean)}
              />
              <Label htmlFor="is-default" className="ml-2">
                デフォルトとして設定
              </Label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valid-from-mapping" className="text-right">
              有効期限（開始） <span className="text-red-500">*</span>
            </Label>
            <Input
              id="valid-from-mapping"
              type="date"
              value={currentMapping?.valid_from || ""}
              onChange={(e) => onChange("valid_from", e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valid-to-mapping" className="text-right">
              有効期限（終了）
            </Label>
            <Input
              id="valid-to-mapping"
              type="date"
              value={currentMapping?.valid_to || ""}
              onChange={(e) => onChange("valid_to", e.target.value)}
              className="col-span-3"
              placeholder="終了日が未定の場合は空欄"
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
