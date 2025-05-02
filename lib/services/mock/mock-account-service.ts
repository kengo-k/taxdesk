import type { AccountService, AccountItem } from "../account-service"

export class MockAccountService implements AccountService {
  async getAccountList(
    nendo: string,
    options?: {
      category?: string
      active?: boolean
      search?: string
    },
  ): Promise<AccountItem[]> {
    // 基本データ
    const baseAccounts: AccountItem[] = [
      {
        id: "1",
        code: "101",
        name: "現金",
        category: "1",
        categoryName: "資産",
        isActive: true,
        description: "手元にある現金",
      },
      {
        id: "2",
        code: "102",
        name: "普通預金",
        category: "1",
        categoryName: "資産",
        isActive: true,
        description: "銀行の普通預金口座の残高",
      },
      {
        id: "3",
        code: "103",
        name: "売掛金",
        category: "1",
        categoryName: "資産",
        isActive: true,
        description: "商品・サービスを販売した際の未回収金額",
      },
      {
        id: "4",
        code: "201",
        name: "買掛金",
        category: "2",
        categoryName: "負債",
        isActive: true,
        description: "商品・サービスを仕入れた際の未払金額",
      },
      {
        id: "5",
        code: "202",
        name: "未払金",
        category: "2",
        categoryName: "負債",
        isActive: true,
        description: "商品・サービス以外の未払金額",
      },
      {
        id: "6",
        code: "301",
        name: "資本金",
        category: "3",
        categoryName: "純資産",
        isActive: true,
        description: "会社設立時や増資時に出資された金額",
      },
      {
        id: "7",
        code: "401",
        name: "売上高",
        category: "4",
        categoryName: "収益",
        isActive: true,
        description: "商品・サービスの販売による収益",
      },
      {
        id: "8",
        code: "501",
        name: "仕入高",
        category: "5",
        categoryName: "費用",
        isActive: true,
        description: "商品・サービスの仕入による費用",
      },
      {
        id: "9",
        code: "502",
        name: "給料手当",
        category: "5",
        categoryName: "費用",
        isActive: true,
        description: "従業員に支払う給料や手当",
      },
      {
        id: "10",
        code: "503",
        name: "法定福利費",
        category: "5",
        categoryName: "費用",
        isActive: true,
        description: "社会保険料等の法定福利費",
      },
      {
        id: "11",
        code: "504",
        name: "地代家賃",
        category: "5",
        categoryName: "費用",
        isActive: true,
        description: "事務所や店舗の賃借料",
      },
      {
        id: "12",
        code: "505",
        name: "水道光熱費",
        category: "5",
        categoryName: "費用",
        isActive: true,
        description: "電気・ガス・水道等の費用",
      },
      {
        id: "13",
        code: "506",
        name: "通信費",
        category: "5",
        categoryName: "費用",
        isActive: true,
        description: "電話・インターネット等の通信費",
      },
      {
        id: "14",
        code: "507",
        name: "消耗品費",
        category: "5",
        categoryName: "費用",
        isActive: true,
        description: "事務用品等の消耗品の購入費",
      },
      {
        id: "15",
        code: "601",
        name: "法人税等",
        category: "6",
        categoryName: "税金",
        isActive: true,
        description: "法人の所得に対する税金",
      },
    ]

    // 年度によって異なるデータを返す（モック用）
    let accountList = [...baseAccounts]

    if (nendo === "2023") {
      // 2023年度は一部の科目が非アクティブ
      accountList = baseAccounts.map((account) => {
        if (account.code === "507") {
          return { ...account, isActive: false }
        }
        return account
      })
    } else if (nendo === "2022") {
      // 2022年度はさらに別の科目が非アクティブ
      accountList = baseAccounts
        .map((account) => {
          if (["506", "507"].includes(account.code)) {
            return { ...account, isActive: false }
          }
          return account
        })
        .filter((account) => account.code !== "601") // 2022年度は法人税等の科目がない
    }

    // カテゴリーでフィルタリング
    if (options?.category) {
      accountList = accountList.filter((account) => account.category === options.category)
    }

    // アクティブ状態でフィルタリング
    if (options?.active !== undefined) {
      accountList = accountList.filter((account) => account.isActive === options.active)
    }

    // 検索キーワードでフィルタリング
    if (options?.search) {
      const keyword = options.search.toLowerCase()
      accountList = accountList.filter(
        (account) =>
          account.code.toLowerCase().includes(keyword) ||
          account.name.toLowerCase().includes(keyword) ||
          account.description.toLowerCase().includes(keyword),
      )
    }

    // 固定の遅延時間を使用（500ミリ秒）
    await new Promise((resolve) => setTimeout(resolve, 500))

    return accountList
  }
}
