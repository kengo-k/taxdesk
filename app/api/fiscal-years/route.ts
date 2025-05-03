import { ApiError, ApiErrorType, apiRouteHandler } from "@/lib/api-utils"
import { getFiscalYears } from "@/lib/services/masters/get-fiscal-years"
// モック実装を使用する場合は以下のようにインポートを変更する
// import { getFiscalYearsMock as getFiscalYears } from "@/lib/services/masters/get-fiscal-years"

export async function GET() {
  return apiRouteHandler(async () => {
    // サービス層の関数を呼び出し
    const fiscalYears = await getFiscalYears()

    // データが空の場合は404エラーをスロー
    if (fiscalYears.length === 0) {
      throw new ApiError(
        "年度データが見つかりません",
        ApiErrorType.NOT_FOUND
      )
    }

    return fiscalYears
  })
}
