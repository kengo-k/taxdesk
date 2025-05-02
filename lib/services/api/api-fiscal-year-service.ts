import { PrismaClient } from '@prisma/client'
import type { FiscalYear, FiscalYearService } from "../fiscal-year-service"

export class ApiFiscalYearService implements FiscalYearService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async getFiscalYears(): Promise<FiscalYear[]> {
    // prismaを使って実装
    const nendoMasters = await this.prisma.nendo_masters.findMany({
      orderBy: { nendo: 'desc' }
    })

    // データ変換処理
    return nendoMasters.map(nendo => ({
      id: nendo.nendo,
      label: `${nendo.nendo}年度（${nendo.start_date.substring(0, 4)}年${nendo.start_date.substring(4, 6)}月〜${nendo.end_date.substring(0, 4)}年${nendo.end_date.substring(4, 6)}月）`,
      startDate: `${nendo.start_date.substring(0, 4)}-${nendo.start_date.substring(4, 6)}-${nendo.start_date.substring(6, 8)}`,
      endDate: `${nendo.end_date.substring(0, 4)}-${nendo.end_date.substring(4, 6)}-${nendo.end_date.substring(6, 8)}`,
      isCurrent: nendo.fixed === '0'
    }))
  }
}
