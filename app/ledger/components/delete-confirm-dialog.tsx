"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmDialogProps {
  open: boolean
  selectedCount: number
  onOpenChange: (open: boolean) => void
  onDelete: () => void
}

export function DeleteConfirmDialog({ open, selectedCount, onOpenChange, onDelete }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>取引の削除確認</DialogTitle>
          <DialogDescription>
            選択した {selectedCount} 件の取引を削除します。この操作は元に戻せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            削除する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
