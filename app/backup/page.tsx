"use client"

import { useState, useEffect } from "react"
import { Calendar, Database, Download, Info, RotateCw, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

// バックアップ履歴の型定義
interface BackupHistory {
  id: string
  timestamp: string
  migration: string
  canRestore: boolean
}

export default function BackupPage() {
  // バックアップ状態
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  
  // 現在適用中のマイグレーション（モック）
  const currentMigration = "add_journals_table"

  // モックデータ - バックアップ履歴
  const backupHistory: BackupHistory[] = [
    {
      id: "20241228120000",
      timestamp: "20241228120000",
      migration: "add_journals_table",
      canRestore: true,
    },
    {
      id: "20241227230000",
      timestamp: "20241227230000",
      migration: "add_consumption_tax_mappings",
      canRestore: true,
    },
    {
      id: "20241220150000",
      timestamp: "20241220150000",
      migration: "add_account_masters",
      canRestore: false,
    },
    {
      id: "20241215100000",
      timestamp: "20241215100000",
      migration: "create_initial_schema",
      canRestore: false,
    },
  ]

  // 手動バックアップの実行
  const handleManualBackup = async () => {
    setIsBackingUp(true)
    try {
      // バックアップ処理のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "バックアップが完了しました",
        description: `${new Date().toLocaleString("ja-JP")}にバックアップを作成しました。`,
      })
    } catch (error) {
      toast({
        title: "バックアップに失敗しました",
        description: "バックアップ処理中にエラーが発生しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsBackingUp(false)
    }
  }

  // バックアップからの復元
  const handleRestore = async (backup: BackupHistory) => {
    setIsRestoring(true)
    try {
      // 復元処理のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "復元が完了しました",
        description: `バックアップ ${formatTimestamp(backup.timestamp)} からデータを復元しました。`,
      })
    } catch (error) {
      toast({
        title: "復元に失敗しました",
        description: "復元処理中にエラーが発生しました。もう一度お試しください。",
        variant: "destructive",
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
              <code className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                {currentMigration}
              </code>
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
              <CardDescription>現在のデータを手動でバックアップします</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    すべてのデータをクラウドストレージにバックアップします。処理には数分かかる場合があります。
                  </p>
                </div>
                <Button onClick={handleManualBackup} disabled={isBackingUp} className="ml-4">
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
            </CardContent>
          </Card>

          {/* バックアップ履歴 */}
          <Card>
            <CardHeader>
              <CardTitle>バックアップ履歴</CardTitle>
              <CardDescription>過去のバックアップ記録を表示します</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    現在のマイグレーションと一致するバックアップのみ復元可能です。<br />
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
                      <th className="pb-2 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupHistory.map((backup) => (
                      <tr key={backup.id} className="border-b">
                        <td className="py-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {formatTimestamp(backup.timestamp)}
                          </div>
                        </td>
                        <td className="py-3">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {backup.migration}
                          </code>
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            variant={backup.canRestore ? "outline" : "outline"}
                            size="sm"
                            className={`ml-2 ${!backup.canRestore ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handleRestore(backup)}
                            disabled={isRestoring || !backup.canRestore}
                            title={!backup.canRestore ? "マイグレーションが異なるため復元できません" : ""}
                          >
                            {isRestoring ? (
                              <RotateCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-1" />
                                {backup.canRestore ? "復元" : "復元不可"}
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
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
