"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [showMFA, setShowMFA] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mfaCode, setMfaCode] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!showMFA) {
      // 最初のログインボタン押下時はMFA入力フィールドを表示
      setShowMFA(true)
    } else {
      // MFAコード入力後のログインボタン押下時は認証処理を行い、ダッシュボードに遷移
      // 通常は認証APIを呼び出しますが、ここではダッシュボードページに遷移するだけにします
      window.location.href = "/"
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">会計管理システム</CardTitle>
        <CardDescription className="text-center">経理業務を効率化するための総合ソリューション</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {showMFA && (
            <div className="space-y-2">
              <Label htmlFor="mfa">認証コード</Label>
              <Input
                id="mfa"
                type="text"
                placeholder="6桁のコードを入力"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                required
                maxLength={6}
              />
              <p className="text-xs text-gray-500">認証アプリに表示されている6桁のコードを入力してください</p>
            </div>
          )}

          <Button type="submit" className="w-full">
            {showMFA ? "認証して続行" : "ログイン"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
