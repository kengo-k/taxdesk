'use client'

import * as React from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  BarChart3,
  BookOpen,
  Calendar,
  Database,
  FileSpreadsheet,
  Grid,
  Receipt,
  Scale,
  Wallet,
  Calculator,
  TrendingUp,
  Zap,
  Diamond,
} from 'lucide-react'

import { cn } from '@/lib/client/utils'

interface MenuCategory {
  id: string
  title: string
  items: MenuItem[]
}

interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const menuCategories: MenuCategory[] = [
  {
    id: 'transaction',
    title: 'トランザクション',
    items: [
      {
        title: '仕訳帳入力',
        href: '/journal-entry',
        icon: FileSpreadsheet,
      },
      {
        title: '元帳入力',
        href: '/ledger',
        icon: BookOpen,
      },
      {
        title: '出張申請',
        href: '/business-trip',
        icon: Receipt,
      },
    ],
  },
  {
    id: 'master',
    title: '台帳・マスタ管理',
    items: [
      {
        title: 'マスタメンテナンス',
        href: '/master',
        icon: FileSpreadsheet,
      },
      {
        title: '減価償却資産台帳',
        href: '/depreciation-assets',
        icon: Database,
      },
    ],
  },
  {
    id: 'reports',
    title: '決算・レポート',
    items: [
      {
        title: '給与明細照会',
        href: '/payroll',
        icon: Wallet,
      },
      {
        title: '貸借対照表',
        href: '/balance-sheet',
        icon: Scale,
      },
      {
        title: '損益計算書',
        href: '/income-statement',
        icon: BarChart3,
      },
      {
        title: '税額計算詳細',
        href: '/tax-simulation',
        icon: Grid,
      },
    ],
  },
  {
    id: 'system',
    title: 'システム管理',
    items: [
      {
        title: '年度切り替え',
        href: '/fiscal-year-transition',
        icon: Calendar,
      },
      {
        title: 'バックアップ管理',
        href: '/backup',
        icon: Database,
      },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn('flex flex-col w-64 bg-slate-100 border-r border-slate-300', className)}>
      <div className="flex items-center h-[73px] px-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold">TaxDesk</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <Link
          href="/"
          className={cn(
            'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
            pathname === '/'
              ? 'bg-blue-600 text-white'
              : 'text-slate-700 hover:bg-slate-200'
          )}
        >
          <Grid className="mr-3 h-4 w-4" />
          ダッシュボード
        </Link>

        <div className="space-y-1">
          {menuCategories.map((category) => (
            <div key={category.id}>
              <div className="px-3 py-2 text-sm font-medium text-slate-700">
                {category.title}
              </div>
              <div className="ml-6 mt-1 space-y-1">
                {category.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                      pathname === item.href
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}