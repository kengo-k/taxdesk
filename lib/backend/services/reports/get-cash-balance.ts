import { Connection } from '@/lib/types'

// 現金残高データの型定義
export type CashBalanceData = {
  cashBalanceTotal: number
  cashBalanceData: number[]
  cashBalanceLabels: string[]
  cashBalanceAmounts: number[]
  cashBalanceColors: string[]
}

// モックデータ
const mockData: { [key: string]: CashBalanceData } = {
  '2022': {
    cashBalanceTotal: 850000000,
    cashBalanceData: [50, 30, 20],
    cashBalanceLabels: ['三菱UFJ銀行', 'みずほ銀行', '三井住友銀行'],
    cashBalanceAmounts: [425000000, 255000000, 170000000],
    cashBalanceColors: ['#1e40af', '#3b82f6', '#60a5fa'],
  },
  '2023': {
    cashBalanceTotal: 920000000,
    cashBalanceData: [45, 35, 20],
    cashBalanceLabels: ['三菱UFJ銀行', 'みずほ銀行', '三井住友銀行'],
    cashBalanceAmounts: [414000000, 322000000, 184000000],
    cashBalanceColors: ['#1e40af', '#3b82f6', '#60a5fa'],
  },
  '2024': {
    cashBalanceTotal: 999999999,
    cashBalanceData: [45, 30, 25],
    cashBalanceLabels: ['三菱UFJ銀行', 'みずほ銀行', '三井住友銀行'],
    cashBalanceAmounts: [450000000, 300000000, 249999999],
    cashBalanceColors: ['#1e40af', '#3b82f6', '#60a5fa'],
  },
}

/**
 * 指定された年度の現金残高データを取得する
 * @param fiscalYear 年度
 * @returns 現金残高データ
 */
export async function getCashBalance(
  conn: Connection,
  fiscalYear: string,
): Promise<CashBalanceData> {
  const rows = await conn.$queryRaw<any[]>`
select
  km.kamoku_cd,
  sum(j.karikata_value) as sum
from
  journals j
    inner join saimoku_masters sm on sm.saimoku_cd = j.karikata_cd
    inner join kamoku_masters km on km.kamoku_cd = sm.kamoku_cd
where
  nendo = ${fiscalYear}
  and km.kamoku_bunrui_cd = ${'1'}
group by
  km.kamoku_cd`
  return rows as any
}
