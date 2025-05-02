import type { AccountService } from "./account-service"
import type { FiscalYearService } from "./fiscal-year-service"
import { MockAccountService } from "./mock/mock-account-service"
import { ApiAccountService } from "./api/api-account-service"
import { MockFiscalYearService } from "./mock/mock-fiscal-year-service"
import { ApiFiscalYearService } from "./api/api-fiscal-year-service"
import { useMock } from "../settings"

export class ServiceFactory {
  static getAccountService(): AccountService {
    // settings.tsのuseMock変数に基づいて実装を切り替える
    if (!useMock) {
      return new ApiAccountService()
    }
    return new MockAccountService()
  }

  static getFiscalYearService(): FiscalYearService {
    if (!useMock) {
      return new ApiFiscalYearService()
    }
    return new MockFiscalYearService()
  }

  // 他のサービスも同様に...
}
