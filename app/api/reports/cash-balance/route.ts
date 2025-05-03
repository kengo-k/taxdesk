import { NextRequest, NextResponse } from 'next/server'

import { getCashBalance } from '@/lib/services/reports/get-cash-balance'

// モック実装を使用する場合は以下のようにインポートを変更する
// import { getCashBalanceMock as getCashBalance } from '@/lib/services/reports/get-cash-balance'

export async function GET(request: NextRequest) {
  try {
    // クエリパラメータから年度を取得
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year') || '2024'

    // 現金残高データを取得
    const cashBalanceData = await getCashBalance(year)

    return NextResponse.json({
      success: true,
      data: cashBalanceData,
    })
  } catch (error) {
    console.error('現金残高データの取得に失敗しました:', error)
    return NextResponse.json(
      {
        success: false,
        error: '現金残高データの取得に失敗しました',
      },
      { status: 500 },
    )
  }
}
