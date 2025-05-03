import { NextRequest, NextResponse } from 'next/server'

/**
 * 財務サマリーAPI
 *
 * 注意: このAPIは現在非推奨です。
 * 以下の個別APIを使用してください：
 * - /api/reports/cash-balance - 現金残高の内訳
 * - /api/reports/income-breakdown - 収入の内訳
 * - /api/reports/expense-breakdown - 支出の内訳
 */
export async function GET(request: NextRequest) {
  // クエリパラメータから年度を取得
  const searchParams = request.nextUrl.searchParams
  const year = searchParams.get('year') || '2024'

  try {
    // 各APIからデータを取得
    const [cashBalanceRes, incomeBreakdownRes, expenseBreakdownRes] =
      await Promise.all([
        fetch(
          `${request.nextUrl.origin}/api/reports/cash-balance?year=${year}`,
        ),
        fetch(
          `${request.nextUrl.origin}/api/reports/income-breakdown?year=${year}`,
        ),
        fetch(
          `${request.nextUrl.origin}/api/reports/expense-breakdown?year=${year}`,
        ),
      ])

    if (
      !cashBalanceRes.ok ||
      !incomeBreakdownRes.ok ||
      !expenseBreakdownRes.ok
    ) {
      throw new Error('データの取得に失敗しました')
    }

    const cashBalanceData = await cashBalanceRes.json()
    const incomeBreakdownData = await incomeBreakdownRes.json()
    const expenseBreakdownData = await expenseBreakdownRes.json()

    // 各APIのデータを結合
    const combinedData = {
      ...cashBalanceData.data,
      ...incomeBreakdownData.data,
      // 税金見込みデータ（本来は別APIから取得するべきだが、現在は固定値）
      taxEstimates: {
        corporateTax: 168000, // 法人税
        localTax: 98000, // 住民税
        businessTax: 70000, // 事業税
        consumptionTax: 252000, // 消費税
        total: 588000, // 合計
      },
    }

    return NextResponse.json(combinedData)
  } catch (error) {
    console.error('財務サマリーデータの取得に失敗しました:', error)
    return NextResponse.json(
      {
        success: false,
        error: '財務サマリーデータの取得に失敗しました',
      },
      { status: 500 },
    )
  }
}
