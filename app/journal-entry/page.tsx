'use client'

import { FileSpreadsheet } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function JournalEntryPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <FileSpreadsheet className="h-6 w-6" />
        <h1 className="text-2xl font-bold">仕訳帳入力</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>仕訳帳入力</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">この機能は準備中です</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}