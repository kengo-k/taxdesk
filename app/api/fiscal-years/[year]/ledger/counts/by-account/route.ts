import { type NextRequest, NextResponse } from "next/server"

// 勘定科目別レコード件数の型定義
interface AccountCount {
  accountCode: string // 科目コード
  accountName: string // 科目名
  count: number // この科目の総取引件数
}

// 年度ごとにハードコードされた勘定科目別件数データ
const accountCountsByYear: Record<string, AccountCount[]> = {
  "2021": [
    { accountCode: "101", accountName: "現金", count: 32 },
    { accountCode: "102", accountName: "普通預金", count: 65 },
    { accountCode: "103", accountName: "売掛金", count: 28 },
    { accountCode: "201", accountName: "買掛金", count: 22 },
    { accountCode: "202", accountName: "未払金", count: 15 },
    { accountCode: "301", accountName: "資本金", count: 3 },
    { accountCode: "401", accountName: "売上高", count: 42 },
    { accountCode: "501", accountName: "仕入高", count: 38 },
    { accountCode: "601", accountName: "法人税等", count: 0 }, // 0件の科目
    { accountCode: "ZZ", accountName: "繰越", count: 2 },
  ],
  "2022": [
    { accountCode: "101", accountName: "現金", count: 38 },
    { accountCode: "102", accountName: "普通預金", count: 72 },
    { accountCode: "103", accountName: "売掛金", count: 35 },
    { accountCode: "201", accountName: "買掛金", count: 27 },
    { accountCode: "202", accountName: "未払金", count: 18 },
    { accountCode: "301", accountName: "資本金", count: 2 },
    { accountCode: "401", accountName: "売上高", count: 48 },
    { accountCode: "501", accountName: "仕入高", count: 43 },
    { accountCode: "601", accountName: "法人税等", count: 0 }, // 0件の科目
    { accountCode: "ZZ", accountName: "繰越", count: 2 },
  ],
  "2023": [
    { accountCode: "101", accountName: "現金", count: 45 },
    { accountCode: "102", accountName: "普通預金", count: 85 },
    { accountCode: "103", accountName: "売掛金", count: 42 },
    { accountCode: "201", accountName: "買掛金", count: 33 },
    { accountCode: "202", accountName: "未払金", count: 22 },
    { accountCode: "301", accountName: "資本金", count: 1 },
    { accountCode: "401", accountName: "売上高", count: 56 },
    { accountCode: "501", accountName: "仕入高", count: 51 },
    { accountCode: "601", accountName: "法人税等", count: 0 }, // 0件の科目
    { accountCode: "ZZ", accountName: "繰越", count: 2 },
  ],
  "2024": [
    { accountCode: "101", accountName: "現金", count: 53 },
    { accountCode: "102", accountName: "普通預金", count: 97 },
    { accountCode: "103", accountName: "売掛金", count: 48 },
    { accountCode: "201", accountName: "買掛金", count: 39 },
    { accountCode: "202", accountName: "未払金", count: 26 },
    { accountCode: "301", accountName: "資本金", count: 2 },
    { accountCode: "401", accountName: "売上高", count: 67 },
    { accountCode: "501", accountName: "仕入高", count: 59 },
    { accountCode: "601", accountName: "法人税等", count: 0 }, // 0件の科目
    { accountCode: "ZZ", accountName: "繰越", count: 2 },
  ],
  "2025": [
    { accountCode: "101", accountName: "現金", count: 61 },
    { accountCode: "102", accountName: "普通預金", count: 108 },
    { accountCode: "103", accountName: "売掛金", count: 55 },
    { accountCode: "201", accountName: "買掛金", count: 45 },
    { accountCode: "202", accountName: "未払金", count: 31 },
    { accountCode: "301", accountName: "資本金", count: 1 },
    { accountCode: "401", accountName: "売上高", count: 78 },
    { accountCode: "501", accountName: "仕入高", count: 68 },
    { accountCode: "601", accountName: "法人税等", count: 0 }, // 0件の科目
    { accountCode: "ZZ", accountName: "繰越", count: 2 },
  ],
}

export async function GET(request: NextRequest, { params }: { params: { nendo: string } }) {
  // 年度パラメータを取得
  const { nendo } = params

  // 指定された年度のデータを取得（存在しない場合は空配列）
  const accountCounts = accountCountsByYear[nendo] || []

  // 実際のAPIでは処理に時間がかかることを模擬するために遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 300))

  // データを返す
  return NextResponse.json({
    nendo,
    accountCounts,
  })
}
