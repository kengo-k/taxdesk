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
  fiscalYear: string,
): Promise<CashBalanceData> {
  // 実際の実装では、DBからデータを取得する処理を記述
  // 現時点では空実装とし、モックデータを返す

  // 指定された年度のデータを取得（存在しない場合は2024年度のデータを返す）
  const data = mockData[fiscalYear] || mockData['2024']

  // 実際のAPIでは処理に時間がかかることを模擬するために遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 300))

  return data
}

/**
 * モック実装
 */
export async function getCashBalanceMock(
  fiscalYear: string,
): Promise<CashBalanceData> {
  return getCashBalance(fiscalYear)
}
