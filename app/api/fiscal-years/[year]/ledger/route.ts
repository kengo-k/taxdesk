import { type NextRequest, NextResponse } from "next/server"

// 取引データの型定義
interface Transaction {
  id: string
  date: string
  accountCode: string
  accountName: string
  counterpartyAccount: string
  description: string
  debit: number
  credit: number
  summary: string
  balance: number
}

// 勘定科目別レコード件数の型定義（counts/by-account APIと同じ）
interface AccountCount {
  accountCode: string
  accountName: string
  count: number
}

// 年度ごとにハードコードされた勘定科目別件数データ（counts/by-account APIと同じ）
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

// 相手科目のリスト
const counterpartyAccounts = [
  "現金",
  "普通預金",
  "売掛金",
  "買掛金",
  "未払金",
  "資本金",
  "売上高",
  "仕入高",
  "法人税等",
  "繰越",
]

// 年度ごとのモックデータを生成
function generateTransactions(nendo: string): Transaction[] {
  const transactions: Transaction[] = []

  // 指定された年度の勘定科目別件数データを取得
  const yearData = accountCountsByYear[nendo] || []
  if (yearData.length === 0) return []

  // 年度の開始月（4月）と終了月（翌年3月）を設定
  const startYear = Number.parseInt(nendo, 10)
  const endYear = startYear + 1

  // 各勘定科目ごとにデータを生成
  let totalTransactionCount = 0
  let currentBalance = 0

  for (const accountData of yearData) {
    const { accountCode, accountName, count } = accountData

    // この勘定科目の取引件数が0の場合はスキップ
    if (count === 0) continue

    for (let i = 0; i < count; i++) {
      totalTransactionCount++

      // 月を計算（4月から始まり、翌年3月まで）
      // 取引を年度内に均等に分布させる
      const monthIndex = Math.floor((totalTransactionCount % 12) * (12 / 12))
      const month = monthIndex < 9 ? monthIndex + 4 : monthIndex - 8 // 4,5,6,7,8,9,10,11,12,1,2,3

      // 日付を計算（各月1〜28日）
      const day = ((totalTransactionCount - 1) % 28) + 1

      // 年を決定（1月、2月、3月は翌年）
      const year = month <= 3 ? endYear : startYear

      // 取引金額をランダムに生成（10,000円〜500,000円）
      const amount = Math.floor(Math.random() * 490000) + 10000

      // 借方か貸方かをランダムに決定
      const isDebit = Math.random() > 0.5 // 50%の確率で借方

      // 相手科目をランダムに選択（自分以外）
      let counterpartyIndex
      do {
        counterpartyIndex = Math.floor(Math.random() * counterpartyAccounts.length)
      } while (counterpartyAccounts[counterpartyIndex] === accountName)

      // 残高を計算
      currentBalance = isDebit
        ? currentBalance - amount // 借方は残高から減算
        : currentBalance + amount // 貸方は残高に加算

      transactions.push({
        id: `${nendo}-${accountCode}-${i + 1}`,
        date: `${year}/${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}`,
        accountCode,
        accountName,
        counterpartyAccount: counterpartyAccounts[counterpartyIndex],
        description: "",
        debit: isDebit ? amount : 0,
        credit: isDebit ? 0 : amount,
        summary: `${accountName}取引 ${i + 1}`,
        balance: currentBalance,
      })
    }
  }

  // 日付順にソート
  return transactions.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
}

export async function GET(request: NextRequest, { params }: { params: { nendo: string } }) {
  // URLパスから年度を取得
  const nendo = params.nendo

  // クエリパラメータを取得
  const searchParams = request.nextUrl.searchParams
  const account = searchParams.get("code") || ""
  const month = searchParams.get("month") || ""
  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "10", 10)

  // 年度のデータを生成
  const allTransactions = generateTransactions(nendo)

  // 勘定科目と月でフィルタリング
  let filteredTransactions = allTransactions

  // 勘定科目でフィルタリング
  if (account && account !== "unset") {
    filteredTransactions = filteredTransactions.filter((transaction) => transaction.accountCode === account)
  }

  // 月でフィルタリング
  if (month && month !== "unset") {
    filteredTransactions = filteredTransactions.filter((transaction) => {
      const transactionMonth = transaction.date.split("/")[1]
      return transactionMonth === month.padStart(2, "0")
    })
  }

  // ページネーション
  const totalItems = filteredTransactions.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (page - 1) * pageSize
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + pageSize)

  // 実際のAPIでは処理に時間がかかることを模擬するために遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 300))

  // データを返す
  return NextResponse.json({
    transactions: paginatedTransactions,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  })
}
