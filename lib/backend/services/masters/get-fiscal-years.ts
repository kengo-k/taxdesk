import { Connection, FiscalYear } from '@/lib/types'

export async function getFiscalYears(conn: Connection): Promise<FiscalYear[]> {
  const nendoMasters = await conn.nendo_masters.findMany({
    orderBy: { nendo: 'desc' },
  })

  return nendoMasters.map((nendo) => ({
    id: nendo.nendo,
    label: `${nendo.nendo}年度（${nendo.start_date.substring(0, 4)}年${nendo.start_date.substring(4, 6)}月〜${nendo.end_date.substring(0, 4)}年${nendo.end_date.substring(4, 6)}月）`,
    startDate: `${nendo.start_date.substring(0, 4)}-${nendo.start_date.substring(4, 6)}-${nendo.start_date.substring(6, 8)}`,
    endDate: `${nendo.end_date.substring(0, 4)}-${nendo.end_date.substring(4, 6)}-${nendo.end_date.substring(6, 8)}`,
    isCurrent: nendo.fixed === '0',
  }))
}
