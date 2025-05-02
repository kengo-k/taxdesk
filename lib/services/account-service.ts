// 勘定科目の型定義
export interface AccountItem {
  id: string
  code: string
  name: string
  category: string
  categoryName: string
  isActive: boolean
  description: string
}

// 勘定科目サービスのインターフェース
export interface AccountService {
  getAccountList(
    nendo: string,
    options?: {
      category?: string
      active?: boolean
      search?: string
    },
  ): Promise<AccountItem[]>
}
