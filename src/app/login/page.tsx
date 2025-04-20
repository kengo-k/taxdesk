'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Page() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [required_mfa, setRequiredMfa] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const login = async (e: any) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/public/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const { required_mfa } = data.data
        setRequiredMfa(required_mfa)
        if (!required_mfa) {
          router.push('/')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch (error) {
      setError('An error occurred during login.')
    }
  }

  const verify = async (e: any) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/public/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, email, password }),
      })
      if (response.ok) {
        router.push('/')
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch (error) {
      setError('An error occurred during login.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">税額計算アプリ</h1>
          <p className="text-muted-foreground mt-2">帳簿入力・経費分析をシンプルに</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {required_mfa ? 'Verify' : 'ログイン'}
            </CardTitle>
            <CardDescription className="text-center">
              {required_mfa
                ? '認証コードを入力してください'
                : 'アカウント情報を入力してください'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-2 bg-destructive/10 text-destructive text-sm rounded">
                {error}
              </div>
            )}
            {!required_mfa ? (
              <form onSubmit={login} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@company.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">パスワード</Label>
                    <a
                      href="#"
                      className="text-xs text-primary hover:underline"
                    >
                      パスワードをお忘れですか？
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  ログイン
                </Button>
              </form>
            ) : (
              <form onSubmit={verify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">認証コード</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="6桁のコードを入力"
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    認証アプリに表示されている6桁のコードを入力してください
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  認証する
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setRequiredMfa(false)}
                >
                  戻る
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  または
                </span>
              </div>
            </div>
            <div className="text-center text-sm">
              アカウントをお持ちでない場合は
              <a href="#" className="text-primary font-medium hover:underline ml-1">
                新規登録
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
