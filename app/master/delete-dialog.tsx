'use client'

import type { DeleteType } from '@/app/master/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deleteType: DeleteType
  onDelete: () => void
}

export function DeleteDialog({
  open,
  onOpenChange,
  deleteType,
  onDelete,
}: DeleteDialogProps) {
  const getDeleteTypeName = () => {
    switch (deleteType) {
      case 'kamoku':
        return '勘定科目'
      case 'saimoku':
        return '細目'
      case 'tax-category':
        return '消費税区分'
      case 'mapping':
        return '関連付け'
      default:
        return '項目'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>削除確認</DialogTitle>
          <DialogDescription>
            本当にこの{getDeleteTypeName()}を削除しますか？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
