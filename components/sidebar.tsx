'use client'

import * as React from 'react'
import { useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  Database,
  FileSpreadsheet,
  Grid,
  Receipt,
  Scale,
  Wallet,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/client/utils'

interface MenuCategory {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
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
    icon: FileSpreadsheet,
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
    icon: Database,
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
    icon: BarChart3,
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
    icon: Calendar,
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
  const [expandedCategories, setExpandedCategories] = useState<string[]>(() => {
    const defaultExpanded = menuCategories
      .filter((category) =>
        category.items.some((item) => pathname === item.href)
      )
      .map((category) => category.id)
    
    return defaultExpanded.length > 0 ? defaultExpanded : ['transaction']
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  return (
    <div className={cn('flex flex-col w-64 bg-white border-r border-gray-200', className)}>
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Grid className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold">Tax Web App</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <Link
          href="/"
          className={cn(
            'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
            pathname === '/'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-700 hover:bg-gray-50'
          )}
        >
          <Grid className="mr-3 h-4 w-4" />
          ダッシュボード
        </Link>

        <div className="space-y-1">
          {menuCategories.map((category) => {
            const isExpanded = expandedCategories.includes(category.id)
            const hasActiveItem = category.items.some((item) => pathname === item.href)

            return (
              <div key={category.id}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-between px-3 py-2 text-sm font-medium',
                    hasActiveItem ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                  )}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center">
                    <category.icon className="mr-3 h-4 w-4" />
                    {category.title}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                          pathname === item.href
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )
}