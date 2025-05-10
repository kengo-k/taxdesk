import { NextRequest, NextResponse } from 'next/server'

import { getIncomeBreakdown } from '@/lib/services/reports/get-income-breakdown'

// モック実装を使用する場合は以下のようにインポートを変更する
// import { getIncomeBreakdownMock as getIncomeBreakdown } from '@/lib/services/reports/get-income-breakdown'

export async function GET(request: NextRequest) {
  try {
    // クエリパラメータから年度を取得
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year') || '2024'

    // 収入内訳データを取得
    const incomeBreakdownData = await getIncomeBreakdown(year)

    return NextResponse.json({
      success: true,
      data: incomeBreakdownData,
    })
  } catch (error) {
    console.error('収入内訳データの取得に失敗しました:', error)
    return NextResponse.json(
      {
        success: false,
        error: '収入内訳データの取得に失敗しました',
      },
      { status: 500 },
    )
  }
}
