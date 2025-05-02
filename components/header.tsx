"use client"

import Link from "next/link"
import { LogOut } from "lucide-react"

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">会計管理システム</h1>
          <p className="text-sm text-gray-500">経理業務を効率化するための総合ソリューション</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">2024年度</span>
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs rounded-md">
              A
            </span>
          </div>
          <Link href="/login" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <LogOut className="h-4 w-4" />
            <span>ログアウト</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
