import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ServiceFactory } from "@/lib/services/service-factory"

export async function GET(request: NextRequest, { params }: { params: { nendo: string } }) {
  try {
    // パスパラメータから年度を取得
    const { nendo } = params

    // クエリパラメータを取得
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") || undefined
    const active = searchParams.get("active") ? searchParams.get("active") === "true" : undefined
    const search = searchParams.get("search") || undefined

    // サービスファクトリーからアカウントサービスを取得
    const accountService = ServiceFactory.getAccountService()

    // 勘定科目一覧を取得
    const accountList = await accountService.getAccountList(nendo, {
      category,
      active,
      search,
    })

    return NextResponse.json(accountList)
  } catch (error) {
    console.error("Error fetching account list:", error)
    return NextResponse.json({ error: "Failed to fetch account list" }, { status: 500 })
  }
}
