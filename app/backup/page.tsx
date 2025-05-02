"use client"

import { useState } from "react"
import { ArrowLeft, Calendar, Cloud, Download, RotateCw, Upload } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

// バックアップ履歴の型定義
interface BackupHistory {
  id: string
  date: string
  time: string
  size: string
  type: string
  status: "success" | "failed"
}

export default function BackupPage() {
  // バックアップ設定の状態
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState("weekly")
  const [backupTime, setBackupTime] = useState("23:00")
  const [retentionPeriod, setRetentionPeriod] = useState("30")
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  // モックデータ - バックアップ履歴
  const backupHistory: BackupHistory[] = [
    {
      id: "1",
      date: "2024/04/25",
      time: "23:00",
      size: "42.5 MB",
      type: "自動",
      status: "success",
    },
    {
      id: "2",
      date: "2024/04/18",
      time: "23:00",
      size: "41.8 MB",
      type: "自動",
      status: "success",
    },
    {
      id: "3",
      date: "2024/04/11",
      time: "23:00",
      size: "40.2 MB",
      type: "自動",
      status: "success",
    },
    {
      id: "4",
      date: "2024/04/05",
      time: "14:30",
      size: "39.7 MB",
      type: "手動",
      status: "success",
    },
    {
      id: "5",
      date: "2024/04/04",
      time: "23:00",
      size: "39.5 MB",
      type: "自動",
      status: "failed",
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
  const handleRestore = async (id: string) => {
    setIsRestoring(true)
    try {
      // 復元処理のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "復元が完了しました",
        description: `バックアップID: ${id}からデータを復元しました。`,
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

  // 設定の保存
  const handleSaveSettings = () => {
    toast({
      title: "設定を保存しました",
      description: "バックアップ設定が正常に保存されました。",
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            戻る
          </Link>
          <h2 className="text-lg font-bold">バックアップ設定</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 自動バックアップ設定 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>自動バックアップ設定</CardTitle>
              <CardDescription>データの自動バックアップに関する設定を行います</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-backup">自動バックアップ</Label>
                  <p className="text-sm text-muted-foreground">定期的なバックアップを自動で実行します</p>
                </div>
                <Switch id="auto-backup" checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>

              {autoBackup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">バックアップ頻度</Label>
                    <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                      <SelectTrigger id="backup-frequency">
                        <SelectValue placeholder="バックアップ頻度を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">毎日</SelectItem>
                        <SelectItem value="weekly">毎週</SelectItem>
                        <SelectItem value="monthly">毎月</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backup-time">バックアップ時刻</Label>
                    <Input
                      id="backup-time"
                      type="time"
                      value={backupTime}
                      onChange={(e) => setBackupTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Cloud className="h-4 w-4 mr-2 text-blue-500" />
                      <Label>バックアップ先: クラウドストレージ</Label>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      データはセキュアなクラウドストレージに保存されます
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retention-period">保持期間（日数）</Label>
                    <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
                      <SelectTrigger id="retention-period">
                        <SelectValue placeholder="保持期間を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7日間</SelectItem>
                        <SelectItem value="14">14日間</SelectItem>
                        <SelectItem value="30">30日間</SelectItem>
                        <SelectItem value="90">90日間</SelectItem>
                        <SelectItem value="365">365日間</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>設定を保存</Button>
            </CardFooter>
          </Card>

          {/* 手動バックアップ */}
          <Card>
            <CardHeader>
              <CardTitle>手動バックアップ</CardTitle>
              <CardDescription>今すぐバックアップを実行します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center h-24 bg-gray-50 rounded-md border">
                <Download className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-sm text-center text-gray-500">
                現在のデータを手動でバックアップします。バックアップには数分かかる場合があります。
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleManualBackup} disabled={isBackingUp}>
                {isBackingUp ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    バックアップ中...
                  </>
                ) : (
                  "今すぐバックアップ"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* バックアップ履歴 */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>バックアップ履歴</CardTitle>
              <CardDescription>過去のバックアップ記録を表示します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left text-sm border-b">
                      <th className="pb-2 font-medium">日付</th>
                      <th className="pb-2 font-medium">時刻</th>
                      <th className="pb-2 font-medium">サイズ</th>
                      <th className="pb-2 font-medium">種類</th>
                      <th className="pb-2 font-medium">状態</th>
                      <th className="pb-2 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupHistory.map((backup) => (
                      <tr key={backup.id} className="border-b">
                        <td className="py-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {backup.date}
                          </div>
                        </td>
                        <td className="py-3">{backup.time}</td>
                        <td className="py-3">{backup.size}</td>
                        <td className="py-3">{backup.type}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              backup.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {backup.status === "success" ? "成功" : "失敗"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => handleRestore(backup.id)}
                            disabled={isRestoring || backup.status === "failed"}
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
