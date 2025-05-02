import { getFiscalYears } from "@/lib/services/masters/get-fiscal-years"
import { NextResponse } from "next/server"
// モック実装を使用する場合は以下のようにインポートを変更する
// import { getFiscalYearsMock as getFiscalYears } from "@/lib/services/masters/get-fiscal-years"

export async function GET() {
  try {
    const fiscalYears = await getFiscalYears()

    return NextResponse.json({
      success: true,
      data: fiscalYears,
    })
  } catch (error) {
    console.error("年度一覧の取得に失敗しました:", error)
    return NextResponse.json(
      {
        success: false,
        error: "年度一覧の取得に失敗しました",
      },
      { status: 500 },
    )
  }
}
