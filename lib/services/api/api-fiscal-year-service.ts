import type { FiscalYearService, FiscalYear } from "../fiscal-year-service"

export class ApiFiscalYearService implements FiscalYearService {
  async getFiscalYears(): Promise<FiscalYear[]> {
    try {
      const response = await fetch("/api/fiscal-years", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }

      const data = await response.json()
      if (data.success && Array.isArray(data.data)) {
        return data.data
      } else {
        throw new Error("APIからの応答が不正です")
      }
    } catch (error) {
      console.error("年度一覧の取得に失敗しました:", error)
      throw error
    }
  }
}
