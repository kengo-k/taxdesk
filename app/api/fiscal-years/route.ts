import { NextResponse } from "next/server"
import { ServiceFactory } from "@/lib/services/service-factory"

export async function GET() {
  try {
    const fiscalYearService = ServiceFactory.getFiscalYearService()
    const fiscalYears = await fiscalYearService.getFiscalYears()

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
