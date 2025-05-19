'use client'

import type { Kamoku } from '@/app/master/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface KamokuDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentKamoku: Kamoku | null
  isEditing: boolean
  onSave: () => void
  onChange: (field: keyof Kamoku, value: string) => void
}

export function KamokuDialog({
  open,
  onOpenChange,
  currentKamoku,
  isEditing,
  onSave,
  onChange,
}: KamokuDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '勘定科目を編集' : '勘定科目を追加'}
          </DialogTitle>
          <DialogDescription>
            勘定科目の情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kamoku-code" className="text-right">
              科目コード
            </Label>
            <div className="col-span-3 py-2 px-3 border rounded-md bg-gray-50 text-gray-700">
              {currentKamoku?.kamoku_cd || ''}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kamoku-name" className="text-right">
              科目名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="kamoku-name"
              value={currentKamoku?.kamoku_full_name || ''}
              onChange={(e) => onChange('kamoku_full_name', e.target.value)}
              className="col-span-3"
              placeholder="例: 現金"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kamoku-short" className="text-right">
              略称
            </Label>
            <Input
              id="kamoku-short"
              value={currentKamoku?.kamoku_ryaku_name || ''}
              onChange={(e) => onChange('kamoku_ryaku_name', e.target.value)}
              className="col-span-3"
              placeholder="例: 現金"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kamoku-kana" className="text-right">
              カナ名
            </Label>
            <Input
              id="kamoku-kana"
              value={currentKamoku?.kamoku_kana_name || ''}
              onChange={(e) => onChange('kamoku_kana_name', e.target.value)}
              className="col-span-3"
              placeholder="例: ゲンキン"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kamoku-bunrui" className="text-right">
              分類
            </Label>
            <div className="col-span-3 py-2 px-3 border rounded-md bg-gray-50 text-gray-700">
              {currentKamoku?.bunrui
                ? `${currentKamoku.bunrui.kamoku_bunrui_name} (${currentKamoku.bunrui.kamoku_bunrui_type})`
                : ''}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="kamoku-desc" className="text-right pt-2">
              説明
            </Label>
            <Textarea
              id="kamoku-desc"
              value={currentKamoku?.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              className="col-span-3"
              placeholder="科目の説明を入力"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={onSave}>{isEditing ? '更新' : '追加'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
