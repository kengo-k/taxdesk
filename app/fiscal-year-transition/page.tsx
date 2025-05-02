"use client"

import { useState } from "react"
import { ArrowLeft, Check, ChevronRight, Clock, Info, Shield } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function FiscalYearTransitionPage() {
  // 現在の年度と新年度の状態
  const [currentYear, setCurrentYear] = useState("2024")
  const [newYear, setNewYear] = useState("2025")

  // 移行オプションの状態
  const [backupBeforeTransition, setBackupBeforeTransition] = useState(true)

  // 移行ステップの状態
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // サンプルの繰越科目データ
  const sampleCarryForwardData = [
    { name: "現金", amount: 1250000 },
    { name: "普通預金", amount: 3750000 },
    { name: "売掛金", amount: 2500000 },
    { name: "買掛金", amount: -1800000 },
    { name: "未払金", amount: -650000 },
    { name: "資本金", amount: -5000000 },
  ]

  // 移行プロセスのシミュレーション
  const simulateTransition = async () => {
    setIsProcessing(true)

    // ステップ1: バックアップ
    if (backupBeforeTransition) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: "バックアップが完了しました",
        description: `${currentYear}年度のデータが正常にバックアップされました。`,
      })
    }

    // ステップ2: 繰越処理
    await new Promise((resolve) => setTimeout(resolve, 2000))
    toast({
      title: "繰越処理が完了しました",
      description: `${currentYear}年度から${newYear}年度への繰越処理が完了しました。`,
    })

    // ステップ3: 新年度の初期化
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast({
      title: "新年度の初期化が完了しました",
      description: `${newYear}年度の会計データが初期化されました。`,
    })

    setIsProcessing(false)
    setIsCompleted(true)
  }

  // 次のステップに進む
  const goToNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowConfirmDialog(true)
    }
  }

  // 前のステップに戻る
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 移行処理を開始
  const startTransition = () => {
    setShowConfirmDialog(false)
    simulateTransition()
  }

  // 金額のフォーマット
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-6">
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              戻る
            </Link>
            <h2 className="text-lg font-bold">年度移行</h2>
          </div>

          {isCompleted ? (
            <Card className="mb-6">
              <CardHeader className="bg-green-50 border-b">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>年度移行が完了しました</CardTitle>
                    <CardDescription>
                      {currentYear}年度から{newYear}年度への移行処理が正常に完了しました
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium mb-2">移行処理の概要</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>{currentYear}年度のデータがバックアップされました</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>貸借対照表の残高が{newYear}年度に繰り越されました</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>{newYear}年度の会計データが初期化されました</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>{currentYear}年度のデータが読み取り専用に設定されました</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/">ホームに戻る</Link>
                </Button>
                <Button asChild>
                  <Link href={`/?year=${newYear}`}>{newYear}年度のダッシュボードを表示</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>年度移行ウィザード</CardTitle>
                <CardDescription>現在の会計年度から新しい会計年度へのデータ移行を行います</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`flex items-center ${currentStep >= 1 ? "text-blue-600 font-medium" : "text-gray-500"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                            currentStep > 1
                              ? "bg-blue-100 text-blue-600"
                              : currentStep === 1
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          1
                        </div>
                        <span>基本設定</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      <div
                        className={`flex items-center ${currentStep >= 2 ? "text-blue-600 font-medium" : "text-gray-500"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                            currentStep > 2
                              ? "bg-blue-100 text-blue-600"
                              : currentStep === 2
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          2
                        </div>
                        <span>確認</span>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-3 mb-6">
                      <div
                        className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 2) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* ステップ1: 基本設定 */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="current-year" className="mb-1 block">
                            現在の会計年度
                          </Label>
                          <Input
                            id="current-year"
                            value={currentYear}
                            onChange={(e) => setCurrentYear(e.target.value)}
                            className="bg-gray-50"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">現在の会計年度は変更できません</p>
                        </div>
                        <div>
                          <Label htmlFor="new-year" className="mb-1 block">
                            新しい会計年度
                          </Label>
                          <Input id="new-year" value={newYear} onChange={(e) => setNewYear(e.target.value)} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="backup">移行前にバックアップを作成</Label>
                          <p className="text-sm text-muted-foreground">
                            年度移行前に現在のデータを自動的にバックアップします
                          </p>
                        </div>
                        <Switch
                          id="backup"
                          checked={backupBeforeTransition}
                          onCheckedChange={setBackupBeforeTransition}
                        />
                      </div>

                      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-blue-800">繰越処理について</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              繰越処理では、資産・負債・純資産の科目残高が新年度に自動的に引き継がれます。
                              収益・費用の科目はゼロから開始されます。
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-amber-800">年度移行の注意点</h4>
                            <p className="text-sm text-amber-700 mt-1">
                              年度移行を行うと、現在の年度のデータを基に新しい年度のデータが作成されます。
                              過去年度のデータは読み取り専用になります。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ステップ2: 確認 */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <h3 className="font-medium mb-3">移行内容の確認</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">現在の会計年度</p>
                            <p className="font-medium">{currentYear}年度</p>
                          </div>
                          <div>
                            <p className="text-gray-500">新しい会計年度</p>
                            <p className="font-medium">{newYear}年度</p>
                          </div>
                          <div>
                            <p className="text-gray-500">移行前にバックアップを作成</p>
                            <p className="font-medium">{backupBeforeTransition ? "はい" : "いいえ"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">過去年度データの扱い</p>
                            <p className="font-medium">読み取り専用</p>
                          </div>
                        </div>
                      </div>

                      {/* 繰越科目と金額のサンプル表示 */}
                      <div className="bg-white p-4 rounded-md border">
                        <h3 className="font-medium mb-3">繰越される主な科目と金額</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-sm border-b">
                                <th className="pb-2 font-medium">科目</th>
                                <th className="pb-2 font-medium text-right">金額</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sampleCarryForwardData.map((item, index) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2">{item.name}</td>
                                  <td className={`py-2 text-right ${item.amount < 0 ? "text-red-600" : ""}`}>
                                    {formatCurrency(item.amount)}
                                  </td>
                                </tr>
                              ))}
                              <tr className="font-bold">
                                <td className="py-2">純資産合計</td>
                                <td className="py-2 text-right">
                                  {formatCurrency(sampleCarryForwardData.reduce((sum, item) => sum + item.amount, 0))}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          ※ 上記は主要科目のサンプルです。実際の繰越処理では全ての貸借対照表科目が対象となります。
                        </p>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                        <div className="flex items-start">
                          <Shield className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-amber-800">重要な注意事項</h4>
                            <p className="text-sm text-amber-700 mt-1">
                              年度移行処理は取り消すことができません。移行を開始する前に、すべての設定を確認してください。
                              問題がある場合は、バックアップからの復元が必要になります。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={goToPreviousStep} disabled={isProcessing}>
                    前へ戻る
                  </Button>
                ) : (
                  <Button variant="outline" asChild disabled={isProcessing}>
                    <Link href="/">キャンセル</Link>
                  </Button>
                )}
                <Button onClick={goToNextStep} disabled={isProcessing}>
                  {currentStep < 2 ? "次へ進む" : "年度移行を開始"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </main>
      </div>

      {/* 年度移行確認ダイアログ */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>年度移行の確認</DialogTitle>
            <DialogDescription>
              {currentYear}年度から{newYear}年度への移行を開始します。この処理は取り消すことができません。
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-sm text-amber-800">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-amber-600 mr-2" />
              <span>この処理には数分かかる場合があります。処理中はブラウザを閉じないでください。</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={startTransition} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  処理中...
                </>
              ) : (
                "年度移行を実行する"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
