import type { FiscalYear, FiscalYearService } from "../fiscal-year-service"

export class ApiFiscalYearService implements FiscalYearService {
  async getFiscalYears(): Promise<FiscalYear[]> {
    throw new Error("Not implemented")
  }
}
