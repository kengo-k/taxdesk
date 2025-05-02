import type { AccountService, AccountItem } from "../account-service"

export class ApiAccountService implements AccountService {
  async getAccountList(
    nendo: string,
    options?: {
      category?: string
      active?: boolean
      search?: string
    },
  ): Promise<AccountItem[]> {
    // 未実装のコードであることを明示的に示すエラーを投げる
    throw new Error(
      "ApiAccountService.getAccountList: 本実装は未実装です。settings.tsのuseMockをtrueに設定してください。",
    )
  }
}
