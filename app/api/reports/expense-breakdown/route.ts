import { NextRequest, NextResponse } from 'next/server'

import { getExpenseBreakdown } from '@/lib/services/reports/get-expense-breakdown'

// モック実装を使用する場合は以下のようにインポートを変更する
// import { getExpenseBreakdownMock as getExpenseBreakdown } from '@/lib/services/reports/get-expense-breakdown'

export async function GET(request: NextRequest) {
  try {
    // クエリパラメータから年度を取得
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year') || '2024'

    // 支出内訳データを取得
    const expenseBreakdownData = await getExpenseBreakdown(year)

    return NextResponse.json({
      success: true,
      data: expenseBreakdownData,
    })
  } catch (error) {
    console.error('支出内訳データの取得に失敗しました:', error)
    return NextResponse.json(
      {
        success: false,
        error: '支出内訳データの取得に失敗しました',
      },
      { status: 500 },
    )
  }
}
