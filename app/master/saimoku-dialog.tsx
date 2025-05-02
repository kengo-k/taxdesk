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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Saimoku, Kamoku } from "./types"

interface SaimokuDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSaimoku: Saimoku | null
  parentKamokuForSaimoku: Kamoku | null
  kamokuList: Kamoku[]
  isEditing: boolean
  onSave: () => void
  onChange: (field: keyof Saimoku, value: string) => void
  onKamokuChange: (kamokuCd: string) => void
}

export function SaimokuDialog({
  open,
  onOpenChange,
  currentSaimoku,
  parentKamokuForSaimoku,
  kamokuList,
  isEditing,
  onSave,
  onChange,
  onKamokuChange,
}: SaimokuDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "細目を編集" : "細目を追加"}</DialogTitle>
          <DialogDescription>
            {parentKamokuForSaimoku?.kamoku_full_name}（{parentKamokuForSaimoku?.kamoku_cd}
            ）の細目情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kamoku-select" className="text-right">
              勘定科目 <span className="text-red-500">*</span>
            </Label>
            <Select value={currentSaimoku?.kamoku_cd || ""} onValueChange={onKamokuChange}>
              <SelectTrigger className="col-span-3">
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
            <Label htmlFor="saimoku-code" className="text-right">
              細目コード <span className="text-red-500">*</span>
            </Label>
            <Input
              id="saimoku-code"
              value={currentSaimoku?.saimoku_cd || ""}
              onChange={(e) => onChange("saimoku_cd", e.target.value)}
              className="col-span-3"
              placeholder="例: 001"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="saimoku-name" className="text-right">
              細目名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="saimoku-name"
              value={currentSaimoku?.saimoku_full_name || ""}
              onChange={(e) => onChange("saimoku_full_name", e.target.value)}
              className="col-span-3"
              placeholder="例: 三菱UFJ銀行"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="saimoku-short" className="text-right">
              略称
            </Label>
            <Input
              id="saimoku-short"
              value={currentSaimoku?.saimoku_ryaku_name || ""}
              onChange={(e) => onChange("saimoku_ryaku_name", e.target.value)}
              className="col-span-3"
              placeholder="例: 三菱UFJ"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="saimoku-kana" className="text-right">
              カナ名
            </Label>
            <Input
              id="saimoku-kana"
              value={currentSaimoku?.saimoku_kana_name || ""}
              onChange={(e) => onChange("saimoku_kana_name", e.target.value)}
              className="col-span-3"
              placeholder="例: ミツビシ"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valid-from" className="text-right">
              有効期限（開始） <span className="text-red-500">*</span>
            </Label>
            <Input
              id="valid-from"
              type="date"
              value={currentSaimoku?.valid_from || ""}
              onChange={(e) => onChange("valid_from", e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valid-to" className="text-right">
              有効期限（終了）
            </Label>
            <Input
              id="valid-to"
              type="date"
              value={currentSaimoku?.valid_to || ""}
              onChange={(e) => onChange("valid_to", e.target.value)}
              className="col-span-3"
              placeholder="終了日が未定の場合は空欄"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="saimoku-desc" className="text-right pt-2">
              説明
            </Label>
            <Textarea
              id="saimoku-desc"
              value={currentSaimoku?.description || ""}
              onChange={(e) => onChange("description", e.target.value)}
              className="col-span-3"
              placeholder="細目の説明を入力"
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
