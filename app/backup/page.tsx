'use client'

import { useEffect, useState } from 'react'

import {
  Calendar,
  Database,
  Download,
  Info,
  RotateCw,
  Upload,
} from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'

// バックアップ履歴の型定義
interface BackupHistory {
  id: string
  timestamp: string
  migration: string
  comment: string
  sizeFormatted: string
  canRestore: boolean
}

export default function BackupPage() {
  // バックアップ状態
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupComment, setBackupComment] = useState('')

  // 現在適用中のマイグレーション
  const [currentMigration, setCurrentMigration] = useState<string>('取得中...')

  // マイグレーションバージョンを取得
  useEffect(() => {
    const fetchMigrationVersion = async () => {
      try {
        const response = await fetch('/api/migration-version')
        const data = await response.json()
        console.log('Migration version API response:', data)

        if (data.success) {
          setCurrentMigration(data.data.migrationVersion)
        } else {
          setCurrentMigration('取得失敗')
        }
      } catch (error) {
        console.error('Failed to fetch migration version:', error)
        setCurrentMigration('取得エラー')
      }
    }

    fetchMigrationVersion()
  }, [])

  // バックアップ履歴データ
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([])
  const [isLoadingBackups, setIsLoadingBackups] = useState(true)

  // バックアップ一覧を取得
  useEffect(() => {
    const fetchBackups = async () => {
      try {
        const response = await fetch('/api/backup')
        const data = await response.json()
        console.log('Backup list API response:', data)

        if (data.success) {
          const backups = data.backups.map((backup: any) => ({
            id: backup.id,
            timestamp: backup.timestamp,
            migration: backup.migration,
            comment: backup.comment || 'コメントなし',
            sizeFormatted: backup.sizeFormatted || 'Unknown',
            canRestore:
              backup.migration === currentMigration &&
              currentMigration !== '取得中...',
          }))
          setBackupHistory(backups)
        } else {
          console.error('Failed to fetch backup list:', data.message)
        }
      } catch (error) {
        console.error('Error fetching backup list:', error)
      } finally {
        setIsLoadingBackups(false)
      }
    }

    fetchBackups()
  }, [currentMigration])

  // 手動バックアップの実行
  const handleManualBackup = async () => {
    // コメントの必須チェック
    if (!backupComment.trim()) {
      toast({
        title: 'コメントが必要です',
        description: 'バックアップコメントを入力してください。',
        variant: 'destructive',
      })
      return
    }

    setIsBackingUp(true)
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: backupComment.trim() }),
      })

      const data = await response.json()
      console.log('Backup creation API response:', data)

      if (data.success) {
        toast({
          title: 'バックアップが完了しました',
          description: `${new Date().toLocaleString('ja-JP')}にバックアップを作成しました。`,
        })
        setBackupComment('')
        // バックアップ一覧を再取得
        const fetchBackups = async () => {
          try {
            const response = await fetch('/api/backup')
            const data = await response.json()

            if (data.success) {
              const backups = data.backups.map((backup: any) => ({
                id: backup.id,
                timestamp: backup.timestamp,
                migration: backup.migration,
                comment: backup.comment || 'コメントなし',
                sizeFormatted: backup.sizeFormatted || 'Unknown',
                canRestore:
                  backup.migration === currentMigration &&
                  currentMigration !== '取得中...',
              }))
              setBackupHistory(backups)
            }
          } catch (error) {
            console.error('Error refreshing backup list:', error)
          }
        }
        await fetchBackups()
      } else {
        throw new Error(data.message || 'バックアップに失敗しました')
      }
    } catch (error) {
      toast({
        title: 'バックアップに失敗しました',
        description:
          error instanceof Error
            ? error.message
            : 'バックアップ処理中にエラーが発生しました。',
        variant: 'destructive',
      })
    } finally {
      setIsBackingUp(false)
    }
  }

  // バックアップからの復元
  const handleRestore = async (backup: BackupHistory) => {
    setIsRestoring(true)
    try {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupId: backup.id }),
      })

      const data = await response.json()
      console.log('Restore API response:', data)

      if (data.success) {
        toast({
          title: '復元が完了しました',
          description: `バックアップ ${formatTimestamp(backup.timestamp)} からデータを復元しました。`,
        })
        // 復元後にバックアップ一覧を再取得
        const fetchBackups = async () => {
          try {
            const response = await fetch('/api/backup')
            const data = await response.json()

            if (data.success) {
              const backups = data.backups.map((backup: any) => ({
                id: backup.id,
                timestamp: backup.timestamp,
                migration: backup.migration,
                comment: backup.comment || 'コメントなし',
                sizeFormatted: backup.sizeFormatted || 'Unknown',
                canRestore:
                  backup.migration === currentMigration &&
                  currentMigration !== '取得中...',
              }))
              setBackupHistory(backups)
            }
          } catch (error) {
            console.error('Error refreshing backup list:', error)
          }
        }
        await fetchBackups()
      } else {
        throw new Error(data.message || '復元に失敗しました')
      }
    } catch (error) {
      toast({
        title: '復元に失敗しました',
        description:
          error instanceof Error
            ? error.message
            : '復元処理中にエラーが発生しました。',
        variant: 'destructive',
      })
    } finally {
      setIsRestoring(false)
    }
  }

  // タイムスタンプを表示用の日時に変換
  const formatTimestamp = (timestamp: string) => {
    if (!/^\d{14}$/.test(timestamp)) return timestamp

    const year = timestamp.substring(0, 4)
    const month = timestamp.substring(4, 6)
    const day = timestamp.substring(6, 8)
    const hour = timestamp.substring(8, 10)
    const minute = timestamp.substring(10, 12)

    return `${year}/${month}/${day} ${hour}:${minute}`
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center">
              <Database className="h-5 w-5 mr-2" />
              バックアップ管理
            </h2>
            <div className="text-sm text-gray-600">
              現在のマイグレーション:
              <code className="ml-2 px-2 py-1 text-xs">{currentMigration}</code>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 手動バックアップ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                手動バックアップ
              </CardTitle>
              <CardDescription>
                現在のデータを手動でバックアップします
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    すべてのデータをクラウドストレージにバックアップします。処理には数分かかる場合があります。
                  </p>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="backup-comment"
                    className="text-sm font-medium"
                  >
                    バックアップコメント <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="backup-comment"
                    placeholder="例: 月次バックアップ、機能追加前のバックアップ"
                    value={backupComment}
                    onChange={(e) => setBackupComment(e.target.value)}
                    disabled={isBackingUp}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleManualBackup}
                    disabled={isBackingUp || !backupComment.trim()}
                  >
                    {isBackingUp ? (
                      <>
                        <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                        バックアップ中...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        今すぐバックアップ
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* バックアップ履歴 */}
          <Card>
            <CardHeader>
              <CardTitle>バックアップ履歴</CardTitle>
              <CardDescription>
                過去のバックアップ記録を表示します
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    現在のマイグレーションと一致するバックアップのみ復元可能です。
                    <br />
                    異なるマイグレーションのバックアップを復元したい場合は、事前に対応するマイグレーションを実行してください。
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left text-sm border-b">
                      <th className="pb-2 font-medium">バックアップ時刻</th>
                      <th className="pb-2 font-medium">マイグレーション</th>
                      <th className="pb-2 font-medium">コメント</th>
                      <th className="pb-2 font-medium">サイズ</th>
                      <th className="pb-2 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingBackups ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-gray-500"
                        >
                          バックアップ一覧を読み込み中...
                        </td>
                      </tr>
                    ) : backupHistory.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-gray-500"
                        >
                          バックアップが見つかりませんでした
                        </td>
                      </tr>
                    ) : (
                      backupHistory.map((backup) => (
                        <tr key={backup.id} className="border-b">
                          <td className="py-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {formatTimestamp(backup.timestamp)}
                            </div>
                          </td>
                          <td className="py-3">
                            <code className="text-sm px-2 py-1">
                              {backup.migration}
                            </code>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-gray-600">
                              {backup.comment}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-gray-500">
                              {backup.sizeFormatted}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {backup.canRestore ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="ml-2"
                                    disabled={isRestoring}
                                  >
                                    {isRestoring ? (
                                      <RotateCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Upload className="h-4 w-4 mr-1" />
                                        復元
                                      </>
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      データベース復元の確認
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      以下のバックアップからデータベースを復元します。現在のデータは完全に置き換えられます。
                                      <br />
                                      <br />
                                      <strong>バックアップ:</strong>{' '}
                                      {formatTimestamp(backup.timestamp)}
                                      <br />
                                      <strong>コメント:</strong>{' '}
                                      {backup.comment}
                                      <br />
                                      <strong>マイグレーション:</strong>{' '}
                                      {backup.migration}
                                      <br />
                                      <br />
                                      この操作は元に戻せません。続行しますか？
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      キャンセル
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRestore(backup)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      復元する
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-2 opacity-50 cursor-not-allowed"
                                disabled
                                title="マイグレーションが異なるため復元できません"
                              >
                                復元不可
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
