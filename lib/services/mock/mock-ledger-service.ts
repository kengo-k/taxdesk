import type { LedgerService, AccountCount, Transaction, Pagination } from "../ledger-service"

export class MockLedgerService implements LedgerService {
  // 年度ごとにハードコードされた勘定科目別件数データ
  private accountCountsByYear: Record<string, AccountCount[]> = {
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
  private counterpartyAccounts = [
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

  async getAccountCounts(nendo: string): Promise<AccountCount[]> {
    // 指定された年度のデータを取得（存在しない場合は空配列）
    const accountCounts = this.accountCountsByYear[nendo] || []

    // 遅延を追加（モック用）
    await new Promise((resolve) => setTimeout(resolve, 300))

    return accountCounts
  }

  async getTransactions(
    nendo: string,
    options?: {
      code?: string
      month?: string
      page?: number
      pageSize?: number
    },
  ): Promise<{
    transactions: Transaction[]
    pagination: Pagination
  }> {
    // 年度のデータを生成
    const allTransactions = this.generateTransactions(nendo)

    // 勘定科目と月でフィルタリング
    let filteredTransactions = allTransactions

    // 勘定科目でフィルタリング
    if (options?.code && options.code !== "unset") {
      filteredTransactions = filteredTransactions.filter((transaction) => transaction.accountCode === options.code)
    }

    // 月でフィルタリング
    if (options?.month && options.month !== "unset") {
      filteredTransactions = filteredTransactions.filter((transaction) => {
        const transactionMonth = transaction.date.split("/")[1]
        return transactionMonth === options.month?.padStart(2, "0")
      })
    }

    // ページネーション
    const page = options?.page || 1
    const pageSize = options?.pageSize || 10
    const totalItems = filteredTransactions.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = (page - 1) * pageSize
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + pageSize)

    // 遅延を追加（モック用）
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      transactions: paginatedTransactions,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    }
  }

  // 年度ごとのモックデータを生成
  private generateTransactions(nendo: string): Transaction[] {
    const transactions: Transaction[] = []

    // 指定された年度の勘定科目別件数データを取得
    const yearData = this.accountCountsByYear[nendo] || []
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
          counterpartyIndex = Math.floor(Math.random() * this.counterpartyAccounts.length)
        } while (this.counterpartyAccounts[counterpartyIndex] === accountName)

        // 残高を計算
        currentBalance = isDebit
          ? currentBalance - amount // 借方は残高から減算
          : currentBalance + amount // 貸方は残高に加算

        transactions.push({
          id: `${nendo}-${accountCode}-${i + 1}`,
          date: `${year}/${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}`,
          accountCode,
          accountName,
          counterpartyAccount: this.counterpartyAccounts[counterpartyIndex],
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
}
