import { prisma } from '../../prisma/client'
import type { FiscalYear } from '../fiscal-year-service'

/**
 * 年度一覧を取得する（実際のDB実装）
 * @returns 年度一覧
 */
export async function getFiscalYears(): Promise<FiscalYear[]> {
  const nendoMasters = await prisma.nendo_masters.findMany({
    orderBy: { nendo: 'desc' }
  })

  return nendoMasters.map(nendo => ({
    id: nendo.nendo,
    label: `${nendo.nendo}年度（${nendo.start_date.substring(0, 4)}年${nendo.start_date.substring(4, 6)}月〜${nendo.end_date.substring(0, 4)}年${nendo.end_date.substring(4, 6)}月）`,
    startDate: `${nendo.start_date.substring(0, 4)}-${nendo.start_date.substring(4, 6)}-${nendo.start_date.substring(6, 8)}`,
    endDate: `${nendo.end_date.substring(0, 4)}-${nendo.end_date.substring(4, 6)}-${nendo.end_date.substring(6, 8)}`,
    isCurrent: nendo.fixed === '0'
  }))
}

/**
 * 年度一覧を取得する（モック実装）
 * @returns 年度一覧
 */
export async function getFiscalYearsMock(): Promise<FiscalYear[]> {
  // 固定値で2025年から2021年までの年度を返す（最新年度が先頭）
  const fiscalYears: FiscalYear[] = [
    {
      id: "2025",
      label: "2025年度（2025年4月〜2026年3月）",
      startDate: "2025-04-01",
      endDate: "2026-03-31",
      isCurrent: true,
    },
    {
      id: "2024",
      label: "2024年度（2024年4月〜2025年3月）",
      startDate: "2024-04-01",
      endDate: "2025-03-31",
      isCurrent: false,
    },
    {
      id: "2023",
      label: "2023年度（2023年4月〜2024年3月）",
      startDate: "2023-04-01",
      endDate: "2024-03-31",
      isCurrent: false,
    },
    {
      id: "2022",
      label: "2022年度（2022年4月〜2023年3月）",
      startDate: "2022-04-01",
      endDate: "2023-03-31",
      isCurrent: false,
    },
    {
      id: "2021",
      label: "2021年度（2021年4月〜2022年3月）",
      startDate: "2021-04-01",
      endDate: "2022-03-31",
      isCurrent: false,
    },
  ]

  // 遅延を追加（モック用）
  await new Promise((resolve) => setTimeout(resolve, 300))

  return fiscalYears
}
